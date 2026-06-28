import { Router } from "express";
import {
    createSession,
    facultyHistory,
    markAttendence,
    sessionHistory,
    getSessionOtp,
} from "../controllers/attendence.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router();

// router.route('/login').post(loginUser)
// router.route("/refresh-token").post(refreshAccessToken)

// //secured routes
router.route("/create_session").post(verifyJWT, createSession);
router.route("/faculty/history").get(verifyJWT, facultyHistory);
router.route("/report/:sessionId").get(verifyJWT, sessionHistory);
router.route("/mark").post(verifyJWT, markAttendence);
router.route("/session-otp").get(verifyJWT, getSessionOtp);
export default router;
