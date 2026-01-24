const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
    // --- 1. Creator Info ---
    creator_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creator_name: { type: String },
    creator_email: { type: String },

    // --- 2. Session Info ---
    class_name: {   // <--- THIS WAS MISSING
        type: String, 
        required: true 
    },
    
    otp: { type: String, required: true },
    center_location: {
        latitude: { type: Number, required: true },
        longitude: { type: Number, required: true }
    },
    createdAt: { type: Date, default: Date.now },

    // --- 3. Live Attendance Data ---
    attendees: [{
        student_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        name: { type: String },
        email: { type: String },
        location: { 
            latitude: Number,
            longitude: Number
        },
        timestamp: { type: Date, default: Date.now }
    }],
    
    total_present: {
        type: Number,
        default: 0
    }
});

const Session = mongoose.model('Session', sessionSchema);
module.exports = Session;