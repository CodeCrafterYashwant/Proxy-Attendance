import mongoose from "mongoose";

const attendanceSchema = new mongoose.Schema({
    student_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    session_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Session",
        required: true,
    },

    status: {
        type: String,
        enum: ["Present", "Absent"],
    },

    timestamp: {
        type: Date,
        default: Date.now,
    },
});

export const Attendance = mongoose.model("Attendance", attendanceSchema);
