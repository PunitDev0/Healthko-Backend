import express from "express";
import {
  createPayment,
  markPaymentPaid,
  markPaymentFailed,
} from "../controllers/payment.controller.js";
import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();

// Apply authentication to all payment routes
router.use(authenticateToken);

// Create payment
router.route("/").post(createPayment);

// Payment success
router.route("/:id/success").patch(markPaymentPaid);

// Payment failure
router.route("/:id/fail").patch(markPaymentFailed);

export default router;
