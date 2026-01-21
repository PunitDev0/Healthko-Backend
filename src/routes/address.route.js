import express from "express";
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
} from "../controllers/address.controller.js";

import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Address
 *   description: User Address Management APIs
 */

/**
 * ✅ All routes are Protected (cookieAuth)
 */

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all active addresses of logged-in user
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     responses:
 *       200:
 *         description: Addresses fetched successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.get("/", authenticateToken, getAddresses);

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Add a new address
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - fullAddress
 *               - city
 *               - state
 *               - zipCode
 *             properties:
 *               type:
 *                 type: string
 *                 example: "home"
 *               fullAddress:
 *                 type: string
 *                 example: "Flat 12, ABC Society, Near Mall"
 *               street:
 *                 type: string
 *                 example: "Main Road"
 *               city:
 *                 type: string
 *                 example: "Ahmedabad"
 *               state:
 *                 type: string
 *                 example: "Gujarat"
 *               zipCode:
 *                 type: string
 *                 example: "380001"
 *               landmark:
 *                 type: string
 *                 example: "Near Metro Station"
 *               lat:
 *                 type: number
 *                 example: 23.0225
 *               lng:
 *                 type: number
 *                 example: 72.5714
 *               isDefault:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Required fields missing
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User not found
 */
router.post("/", authenticateToken, addAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   put:
 *     summary: Update an address by ID
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "66a1f2c1d9f4d9a8b1234567"
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: "office"
 *               fullAddress:
 *                 type: string
 *                 example: "Business Tower, 3rd Floor"
 *               street:
 *                 type: string
 *                 example: "Ring Road"
 *               city:
 *                 type: string
 *                 example: "Surat"
 *               state:
 *                 type: string
 *                 example: "Gujarat"
 *               zipCode:
 *                 type: string
 *                 example: "395007"
 *               landmark:
 *                 type: string
 *                 example: "Opposite Lake"
 *               lat:
 *                 type: number
 *                 example: 21.1702
 *               lng:
 *                 type: number
 *                 example: 72.8311
 *               isDefault:
 *                 type: boolean
 *                 example: false
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User/Address not found
 */
router.put("/:id", authenticateToken, updateAddress);

/**
 * @swagger
 * /api/addresses/{id}:
 *   delete:
 *     summary: Delete an address by ID (Soft delete)
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "66a1f2c1d9f4d9a8b1234567"
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       400:
 *         description: Cannot delete last address
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: User/Address not found
 */
router.delete("/:id", authenticateToken, deleteAddress);

/**
 * @swagger
 * /api/addresses/{id}/default:
 *   patch:
 *     summary: Set an address as default
 *     tags: [Address]
 *     security:
 *       - cookieAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         example: "66a1f2c1d9f4d9a8b1234567"
 *     responses:
 *       200:
 *         description: Default address updated successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found or inactive
 */
router.patch("/:id/default", authenticateToken, setDefaultAddress);

export default router;
