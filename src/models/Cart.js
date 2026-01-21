// models/Cart.js
import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
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
  // Additional custom fields if needed, e.g., notes: String
});

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [cartItemSchema],
    totalAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

cartSchema.index({ user: 1 }, { unique: true });

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;