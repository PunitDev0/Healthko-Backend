import express from "express";
import {
  createPayment,
  markPaymentPaid,
  markPaymentFailed,
} from "../controllers/payment.controller.js";
import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Payments
 *   description: Payment transaction management
 */

// Apply authentication to all payment routes
router.use(authenticateToken);

/**
 * @swagger
 * /api/payments:
 *   post:
 *     summary: Create a new payment record
 *     tags: [Payments]
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
 *               - order
 *               - amount
 *               - method
 *             properties:
 *               order:
 *                 type: string
 *                 example: "60d0fe4f5311236168a109ca"
 *               amount:
 *                 type: number
 *                 example: 500
 *               method:
 *                 type: string
 *                 enum: [card, upi, wallet, razorpay, paytm]
 *                 example: "razorpay"
 *     responses:
 *       201:
 *         description: Payment created successfully
 *       500:
 *         description: Server error
 */
router.route("/").post(createPayment);

/**
 * @swagger
 * /api/payments/{id}/success:
 *   patch:
 *     summary: Mark a payment as successful
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               transactionId:
 *                 type: string
 *                 example: "pay_29837xd8r92837"
 *               gatewayResponse:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment status updated to paid
 *       500:
 *         description: Server error
 */
router.route("/:id/success").patch(markPaymentPaid);

/**
 * @swagger
 * /api/payments/{id}/fail:
 *   patch:
 *     summary: Mark a payment as failed
 *     tags: [Payments]
 *     security:
 *       - cookieAuth: []
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Payment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               gatewayResponse:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment status updated to failed
 *       500:
 *         description: Server error
 */
router.route("/:id/fail").patch(markPaymentFailed);

export default router;
