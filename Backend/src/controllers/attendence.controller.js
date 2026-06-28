import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { Attendance } from "../models/attendance.model.js";
import { Session } from "../models/session.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { randomBytes } from "crypto";

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) *
            Math.cos(lat2 * (Math.PI / 180)) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const createSession = asyncHandler(async (req, res) => {
    const user = req?.user;
    if (user?.role != "faculty") {
        throw new ApiError(403, "Access Denied");
    }

    const { latitude, longitude, className } = req.body;
    if (!className) {
        throw new ApiError(400, "Class Name is required");
    }

    // Generate the initial 64-character hex string
    let currentOtp = randomBytes(32).toString("hex");

    // 1. Create the session in the DB
    const createdSession = await Session.create({
        creator_id: user._id,
        creator_name: user.name,
        creator_email: user.email,
        class_name: className,
        otpString: currentOtp,
        center_location: { latitude, longitude },
    });

    // 2. Start OTP Rotation (Updates ONLY the OTP field)
    let elapsed = 0;
    const intervalTime = 10 * 1000; // 10 seconds
    const maxTime = 60 * 1000; // 1 minute

    const intervalId = setInterval(async () => {
        elapsed += intervalTime;

        // If 1 minute has passed, stop the loop
        if (elapsed >= maxTime) {
            clearInterval(intervalId);
            console.log(
                `OTP rotation stopped for session ${createdSession._id}. Session remains open.`
            );

            // Optional: Remove the OTP field entirely so no new students can join
            await Session.findByIdAndUpdate(createdSession._id, {
                otpString: "EXPIRED",
            });

            return;
        }

        // Generate a new 64-character hex string
        currentOtp = randomBytes(32).toString("hex");

        // Update ONLY the otpString field in the database.
        await Session.findByIdAndUpdate(createdSession._id, {
            otpString: currentOtp,
        });
    }, intervalTime);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                createdSession,
                "Session Created and OTP Rotation Started"
            )
        );
});

const getSessionOtp = asyncHandler(async (req, res) => {
    const role = req?.user?.role;
    if (role != "faculty") {
        throw new ApiError(400, "Access Denied");
    }
    const { sessionId } = req?.params;
    const session = await Session.findById(sessionId).select("otpString");
    if (!session) {
        throw new ApiError(400, "Session not Found");
    }
    if (session.otpString == "EXPIRED") {
        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    { otp: null, isExpired: true },
                    "Session Closed"
                )
            );
    }
    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                { otpString: session.otpString, isExpired: false },
                "OTP FEATCHED"
            )
        );
});

const markAttendence = asyncHandler(async (req, res) => {
    const { otpString, longitude, latitude } = req?.body;
    const studentId = req?.user?._id;
    if (!latitude || !longitude) {
        throw new ApiError(400, "GPS Missing");
    }
    let clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    if (clientIp && clientIp.includes(",")) {
        clientIp = clientIp.split(",")[0].trim();
    }
    const session = await Session.findOne({ otpString: otpString });
    if (!session) {
        throw new ApiError(404, "Session expired or Invalid QR.");
    }

    const isAlreadyPresent = session.attendees.some(
        (r) => r.student_id.toString() === studentId.toString()
    );
    if (isAlreadyPresent)
        throw new ApiError(400, "You have already marked attendance.");

    // 3. --- NEW IP LIMIT CHECK ---
    // Count how many times this exact IP address has been used in this session
    const ipUsageCount = session.attendees.filter(
        (att) => att.ip_address === clientIp
    ).length;

    if (ipUsageCount >= 5) {
        throw new ApiError(
            403,
            "Attendance limit reached for this device/network (Max 5)."
        );
    }
    const dist = getDistance(
        parseFloat(session.center_location.latitude),
        parseFloat(session.center_location.longitude),
        parseFloat(latitude),
        parseFloat(longitude)
    );

    if (dist > 50)
        throw new ApiError(403, `Location Mismatch. ${Math.round(dist)}m away`);
    session.attendees.push({
        name: req?.user?.name,
        student_id: studentId,
        email: req?.user?.email,
        location: { latitude, longitude },
        ip_address: clientIp,
    });
    session.total_present += 1;
    await session.save();
    const newAttendence = new Attendance({
        student_id: studentId,
        session_id: session?._id,
        status: "Present",
    });
    await newAttendence.save();
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Attendence Marked Successfully"));
});

const sessionHistory = asyncHandler(async (req, res) => {
    const { sessionId } = req?.params;
    const session = await Session.findById(sessionId);
    if (!session) throw new ApiError(404, "Session not Found");
    const studentNames = session.attendees.map((student) => student.name);
    const data = {
        total_students: session.total_present,
        present_list: studentNames,
    };
    return res
        .status(200)
        .json(
            new ApiResponse(200, data, "Session History Featched Successfully")
        );
});

const facultyHistory = asyncHandler(async (req, res) => {
    const user = req?.user;
    if (user?.role != "faculty") {
        throw new ApiError(403, "Access Denied");
    }
    const session = await Session.find({ creator_id: user?._id }).sort({
        createdAt: -1,
    });
    if (!session || session.length === 0) {
        return res.status(200).json([]);
    }
    const data = await Session.aggregate([
        {
            $match: {
                creator_id: user?._id,
            },
        },
        {
            $sort: {
                createdAt: -1,
            },
        },
        {
            $project: {
                _id: 1,
                createdAt: 1,
                class_name: 1,
                total_present: 1,

                // transform attendees array
                student_list: {
                    $map: {
                        input: "$attendees",
                        as: "student",
                        in: {
                            name: "$$student.name",
                            email: "$$student.email",
                            time: "$$student.timestamp",
                        },
                    },
                },
            },
        },
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, data, "History Fetched Successfully"));
});

export {
    createSession,
    facultyHistory,
    sessionHistory,
    markAttendence,
    getSessionOtp,
};
