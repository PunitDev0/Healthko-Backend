import express from "express";
import { sendOtp, verifyOtp, getMe, updateUserDetails } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me",authenticateToken, getMe);
router.put("/me", authenticateToken, updateUserDetails);

export default router;
