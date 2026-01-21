// models/Payment.js
import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    method: {
      type: String,
      enum: ["card", "upi", "wallet", "razorpay", "paytm"], // Add payment gateways
      required: true,
    },
    transactionId: {
      type: String,
      unique: true,
    },
    gatewayResponse: {
      type: Object, // Store full response from payment gateway
    },
  },
  { timestamps: true }
);

paymentSchema.index({ order: 1 }, { unique: true });

const Payment = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

export default Payment;