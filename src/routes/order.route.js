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
 * ======================
 * CREATE & PAYMENT
 * ======================
 */

// Create order + Razorpay order
router.post("/create", authenticateToken, createOrder);

// Verify Razorpay payment
router.post("/verify-payment", authenticateToken, verifyPayment);

/**
 * ======================
 * GET ORDERS
 * ======================
 */

// Get all orders of logged-in user
router.get("/", authenticateToken, getUserOrders);

// Get single order by orderId
router.get("/:orderId", authenticateToken, getOrderById);

export default router;
