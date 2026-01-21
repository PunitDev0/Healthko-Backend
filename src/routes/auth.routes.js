import express from "express";
import { sendOtp, verifyOtp, getMe, updateUserDetails } from "../controllers/auth.controller.js";
import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: OTP + JWT Authentication APIs
 */

/**
 * @swagger
 * /api/auth/send-otp:
 *   post:
 *     summary: Send OTP to phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Phone required
 *       500:
 *         description: Server error
 */
router.post("/send-otp", sendOtp);

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Verify OTP and login/signup user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phone
 *               - otp
 *             properties:
 *               phone:
 *                 type: string
 *                 example: "9876543210"
 *               otp:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       201:
 *         description: Login successful / Account created
 *       400:
 *         description: OTP invalid/expired
 *       500:
 *         description: Server error
 */
router.post("/verify-otp", verifyOtp);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Get current logged-in user (Protected)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Current user returned
 *       401:
 *         description: Unauthorized
 */
router.get("/me", authenticateToken, getMe);

/**
 * @swagger
 * /api/auth/me:
 *   put:
 *     summary: Update current user details (Protected)
 *     tags: [Auth]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *                 example: "Punit Kumar"
 *               email:
 *                 type: string
 *                 example: "punit@gmail.com"
 *               sex:
 *                 type: string
 *                 example: "male"
 *               avatar:
 *                 type: string
 *                 example: "https://imageurl.com/avatar.png"
 *               location:
 *                 type: object
 *                 example: { lat: 23.12, lng: 72.55 }
 *               fcmToken:
 *                 type: string
 *                 example: "FCM_TOKEN_HERE"
 *               deviceType:
 *                 type: string
 *                 example: "web"
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: No valid fields provided
 *       401:
 *         description: Unauthorized
 */
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/me",authenticateToken, getMe);
router.put("/me", authenticateToken, updateUserDetails);

export default router;
