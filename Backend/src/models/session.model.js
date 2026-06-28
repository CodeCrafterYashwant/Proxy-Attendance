import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    creator_name: {
        type: String,
    },
    creator_email: {
        type: String,
    },

    class_name: {
        type: String,
        required: true,
    },

    otpString: {
        type: String,
        required: true,
    },
    center_location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true },
    },
    createdAt: { type: Date, default: Date.now },

    // --- 3. Live Attendance Data ---
    attendees: [
        {
            student_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            name: { type: String },
            email: { type: String },
            location: {
                latitude: Number,
                longitude: Number,
            },
            ip_address: {
                type: String,
            },
            timestamp: { type: Date, default: Date.now },
        },
    ],

    total_present: {
        type: Number,
        default: 0,
    },
});

export const Session = mongoose.model("Session", sessionSchema);
