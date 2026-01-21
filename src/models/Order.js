// models/Order.js
import mongoose from "mongoose";

const orderServiceSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    patientName: {
      type: String,
      required: true,
      trim: true,
    },
    patientAge: {
      type: Number,
      min: 0,
      max: 150,
    },
    patientGender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    /** 🌍 Location for doctor search (home address location) */
    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        default: [0, 0],
        index: "2dsphere",
      },
    },
    services: [orderServiceSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    appointmentDateTime: {
      type: Date,
      required: true, // Full datetime: date + time selected by user
    },
    status: {
      type: String,
      enum: ["pending", "paid", "notified", "accepted", "assigned", "completed", "cancelled"],
      default: "pending",
    },
    assignedDoctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Doctor who accepted
    },
    notes: {
      type: String,
      trim: true,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  },
  { timestamps: true }
);

orderSchema.index({ location: "2dsphere" });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;