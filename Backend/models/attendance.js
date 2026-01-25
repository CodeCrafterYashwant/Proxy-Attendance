const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
    student_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Connects to the Student
        required: true
    },

    session_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Session', // Connects to the specific class session
        required: true
    },

    status:{
        type: String,
        enum: ['Present', 'Absent'],
        default: 'Present'
    },

    timestamp:{
        type: Date,
        default: Date.now
    }
});

// Optional: Prevent a student from marking twice in the same session
// attendanceSchema.index({ student_id: 1, session_id: 1 }, { unique: true });

const Attendance = mongoose.model('Attendance', attendanceSchema);
module.exports = Attendance;