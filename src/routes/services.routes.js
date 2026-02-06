import express from "express";
import {
  createService,
  getServices,
} from "../controllers/services.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Services
 *   description: Service Management APIs
 */

/**
 * @swagger
 * /api/services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     parameters:
 *       - name: category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *         example: "66a1f2c1d9f4d9a8b1234567"
 *       - name: subCategory
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by subcategory ID
 *         example: "66a1f2c1d9f4d9a8b9876543"
 *       - name: isActive
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *     responses:
 *       200:
 *         description: Services fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", getServices);

/**
 * @swagger
 * /api/services:
 *   post:
 *     summary: Create a new service
 *     tags: [Services]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *               - category
 *               - subCategory
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Premium Bathroom Cleaning"
 *               slug:
 *                 type: string
 *                 example: "premium-bathroom-cleaning"
 *               category:
 *                 type: string
 *                 description: Category ID
 *                 example: "66a1f2c1d9f4d9a8b1234567"
 *               subCategory:
 *                 type: string
 *                 description: SubCategory ID
 *                 example: "66a1f2c1d9f4d9a8b9876543"
 *               description:
 *                 type: string
 *                 example: "Complete deep cleaning for bathrooms"
 *               price:
 *                 type: number
 *                 example: 1499
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Service created successfully
 *       400:
 *         description: Missing required fields / Invalid data
 *       409:
 *         description: Service already exists
 *       500:
 *         description: Server error
 */
router.post("/", createService);

export default router;
