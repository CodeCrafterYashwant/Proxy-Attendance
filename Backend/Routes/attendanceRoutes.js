const express = require('express');
const router = express.Router();
const Session = require('../models/session'); 
const Attendance = require('../models/attendance');
const User = require('../models/user');
const { jwtAuthMiddleware } = require('../jwt');

// --- Helper Functions ---
const checkFacultyRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        return user.role === 'faculty';
    } catch (error) {
        return false;
    }
}

const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = 
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
    return R * c; 
}

// --- Routes ---

// 1. CREATE SESSION (Must handle class_name)
router.post('/create_session', jwtAuthMiddleware, async (req, res) => {
    try {
        if (!(await checkFacultyRole(req.user.id))) {
            return res.status(403).json({ message: "Access Denied" });
        }

        const { latitude, longitude, class_name } = req.body; 
        
        // This is likely where your 500 error was coming from:
        // The DB required this, but your old code wasn't reading it.
        if(!class_name) {
            return res.status(400).json({ message: "Class Name is required" });
        }
        
        const faculty = await User.findById(req.user.id);
        const generatedOTP = Math.floor(1000 + Math.random() * 9000).toString();

        const newSession = new Session({
            creator_id: faculty._id,
            creator_name: faculty.name,
            creator_email: faculty.email,
            class_name: class_name, 
            otp: generatedOTP,
            center_location: { latitude, longitude }
        });

        const response = await newSession.save();
        
        res.status(200).json({ 
            message: 'Session Started', 
            otp: generatedOTP, 
            sessionId: response._id,
            class_name: response.class_name
        });

    } catch (err) {
        console.log("Create Session Error:", err); // Log the specific error
        res.status(500).json({ error: 'Internal server error' });
    }
});



// ---------------------------------------------------------
// GET /faculty/history - Fetches history with Student Names
// ---------------------------------------------------------
router.get('/faculty/history', jwtAuthMiddleware, async (req, res) => {
    try {
        const facultyId = req.user.id;

        // 1. Check Role
        if (!(await checkFacultyRole(facultyId))) {
            return res.status(403).json({ message: "Access Denied. Faculty only." });
        }

        // 2. Find sessions
        const sessions = await Session.find({ creator_id: facultyId })
                                      .sort({ createdAt: -1 });

        if (!sessions || sessions.length === 0) {
            return res.status(200).json([]); // Return empty array instead of 404 to prevent frontend errors
        }

        // 3. Format Data (CRITICAL FIX HERE)
        const historyData = sessions.map(session => ({
            _id: session._id,                 // Frontend expects '_id'
            createdAt: session.createdAt,     // Frontend expects 'createdAt'
            class_name: session.class_name,   // Frontend expects 'class_name' (Added this back!)
            total_present: session.total_present,
            
            // The new list you wanted:
            student_list: session.attendees.map(student => ({
                name: student.name,
                email: student.email,
                time: student.timestamp
            }))
        }));

        res.status(200).json(historyData);

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});



// 3. MARK ATTENDANCE
router.post('/mark', jwtAuthMiddleware, async (req, res) => {
    try {
        const { sessionId, otp, latitude, longitude } = req.body;
        const studentId = req.user.id;

        if (!latitude || !longitude) return res.status(400).json({ message: "GPS missing." });

        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });

        const studentUser = await User.findById(studentId);
        if (!studentUser) return res.status(404).json({ message: 'User not found' });

        // 60 Seconds Timer
        const timeDifference = Date.now() - session.createdAt;
        if (timeDifference > 300000) { 
            return res.status(400).json({ message: 'Session Expired (Time limit exceeded)' });
        }

        if (session.otp !== otp) return res.status(400).json({ message: 'Invalid OTP' });

        const isAlreadyPresent = session.attendees.some(r => r.student_id.toString() === studentId);
        if (isAlreadyPresent) return res.status(400).json({ message: 'You have already marked attendance.' });

        const dist = getDistance(parseFloat(session.center_location.latitude), parseFloat(session.center_location.longitude), parseFloat(latitude), parseFloat(longitude));
        
        if (dist > 100) return res.status(403).json({ message: `Location Mismatch. ${Math.round(dist)}m away.` });

        session.attendees.push({
            student_id: studentId,
            name: studentUser.name,
            email: studentUser.email,
            location: { latitude, longitude }
        });
        session.total_present += 1;
        await session.save();

        const newAttendance = new Attendance({ student_id: studentId, session_id: sessionId, status: 'Present' });
        await newAttendance.save();

        res.status(200).json({ message: 'Attendance Marked Successfully' });

    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 4. STUDENT HISTORY
router.get('/history', jwtAuthMiddleware, async (req, res) => {
    try {
        const history = await Attendance.find({ student_id: req.user.id }).populate('session_id');
        res.status(200).json(history);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// 5. REPORT
router.get('/report/:sessionId', jwtAuthMiddleware, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const session = await Session.findById(sessionId);
        if (!session) return res.status(404).json({ message: 'Session not found' });
        const studentNames = session.attendees.map(student => student.name);
        res.status(200).json({
            total_students: session.total_present,
            present_list: studentNames
        });
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;