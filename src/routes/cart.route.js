// routes/cartRoutes.js

import express from "express";
import {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
} from "../controllers/cart.controller.js";
import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();

// Apply authentication to all cart routes
router.use(authenticateToken);

// GET cart
router.route("/").get(getCart);

// Add to cart
router.route("/add").post(addToCart);

// Update item quantity
router.route("/update").put(updateCartItem);

// Remove specific item
router.route("/remove/:serviceId").delete(removeFromCart);

// Clear entire cart
router.route("/clear").delete(clearCart);

export default router;