import express from "express";
import {
  createOrder,
  verifyPayment,
  getOrderById,
  getUserOrders,
} from "../controllers/order.controller.js";

import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Order management and payment integration
 */

/**
 * @swagger
 * /api/orders/create:
 *   post:
 *     summary: Create a new order and Razorpay payment order
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - patientName
 *               - address
 *               - services
 *               - appointmentDateTime
 *               - totalAmount
 *             properties:
 *               patientName:
 *                 type: string
 *                 example: "John Doe"
 *               patientAge:
 *                 type: number
 *                 example: 30
 *               patientGender:
 *                 type: string
 *                 example: "male"
 *               address:
 *                 type: string
 *                 example: "123 Street, City"
 *               location:
 *                 type: object
 *                 properties:
 *                   lat:
 *                     type: number
 *                     example: 22.7196
 *                   lng:
 *                     type: number
 *                     example: 75.8577
 *               services:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     service:
 *                       type: string
 *                       description: Service ID
 *                       example: "60d0fe4f5311236168a109ca"
 *                     quantity:
 *                       type: number
 *                       example: 1
 *               notes:
 *                 type: string
 *                 example: "Please arrive on time."
 *               appointmentDateTime:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-12-31T10:00:00Z"
 *               totalAmount:
 *                 type: number
 *                 example: 500
 *     responses:
 *       201:
 *         description: Order created successfully
 *       400:
 *         description: Required fields missing or invalid data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/create", authenticateToken, createOrder);

/**
 * @swagger
 * /api/orders/verify-payment:
 *   post:
 *     summary: Verify Razorpay payment signature
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *               - orderId
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *                 example: "order_9A76xd8rS92837"
 *               razorpay_payment_id:
 *                 type: string
 *                 example: "pay_29837xd8r92837"
 *               razorpay_signature:
 *                 type: string
 *                 example: "9a76xd8r...signature"
 *               orderId:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid payment details or signature
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.post("/verify-payment", authenticateToken, verifyPayment);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     summary: Get all orders of the logged-in user
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user orders
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 count: { type: number }
 *                 orders: 
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Order'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", authenticateToken, getUserOrders);

/**
 * @swagger
 * /api/orders/{orderId}:
 *   get:
 *     summary: Get a single order by ID
 *     tags: [Orders]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *         description: The order ID
 *     responses:
 *       200:
 *         description: Order details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean }
 *                 order:
 *                   $ref: '#/components/schemas/Order'
 *                 payment:
 *                   $ref: '#/components/schemas/Payment'
 *       400:
 *         description: Invalid order ID
 *       404:
 *         description: Order not found
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/:orderId", authenticateToken, getOrderById);

export default router;

