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

/**
 * @swagger
 * tags:
 *   name: Cart
 *   description: Cart Management APIs
 */

/**
 * ✅ Protected Routes (cookieAuth)
 */
router.use(authenticateToken);

/**
 * @swagger
 * /api/cart:
 *   get:
 *     summary: Get logged-in user's cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart fetched successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.get("/", getCart);

/**
 * @swagger
 * /api/cart/add:
 *   post:
 *     summary: Add service to cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: "66a1f2c1d9f4d9a8b1234567"
 *               quantity:
 *                 type: number
 *                 example: 1
 *     responses:
 *       200:
 *         description: Item added to cart successfully
 *       400:
 *         description: Invalid serviceId or quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Service not found
 *       500:
 *         description: Server error
 */
router.post("/add", addToCart);

/**
 * @swagger
 * /api/cart/update:
 *   put:
 *     summary: Update cart item quantity
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - quantity
 *             properties:
 *               serviceId:
 *                 type: string
 *                 example: "66a1f2c1d9f4d9a8b1234567"
 *               quantity:
 *                 type: number
 *                 example: 2
 *     responses:
 *       200:
 *         description: Cart updated successfully
 *       400:
 *         description: Invalid serviceId or quantity
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart is empty / Item not found
 *       500:
 *         description: Server error
 */
router.put("/update", updateCartItem);

/**
 * @swagger
 * /api/cart/remove/{serviceId}:
 *   delete:
 *     summary: Remove a service from cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: serviceId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "66a1f2c1d9f4d9a8b1234567"
 *     responses:
 *       200:
 *         description: Item removed successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Cart is empty
 *       500:
 *         description: Server error
 */
router.delete("/remove/:serviceId", removeFromCart);

/**
 * @swagger
 * /api/cart/clear:
 *   delete:
 *     summary: Clear entire cart
 *     tags: [Cart]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Cart cleared successfully
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 */
router.delete("/clear", clearCart);

export default router;
