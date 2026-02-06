import express from "express";
import {
  createSubCategory,
  getSubCategories,
} from "../controllers/subCategory.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: SubCategories
 *   description: SubCategory Management APIs
 */

/**
 * @swagger
 * /api/subcategories:
 *   post:
 *     summary: Create a new subcategory
 *     tags: [SubCategories]
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
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Bathroom Cleaning"
 *               slug:
 *                 type: string
 *                 example: "bathroom-cleaning"
 *               category:
 *                 type: string
 *                 description: Parent category ID
 *                 example: "66a1f2c1d9f4d9a8b1234567"
 *               description:
 *                 type: string
 *                 example: "Deep bathroom cleaning services"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Subcategory created successfully
 *       400:
 *         description: Name, slug and category are required / Invalid category id
 *       409:
 *         description: Subcategory already exists for this category
 *       500:
 *         description: Server error
 */
router.post("/", createSubCategory);

/**
 * @swagger
 * /api/subcategories:
 *   get:
 *     summary: Get all subcategories
 *     tags: [SubCategories]
 *     parameters:
 *       - name: category
 *         in: query
 *         required: false
 *         schema:
 *           type: string
 *         description: Filter by category ID
 *         example: "66a1f2c1d9f4d9a8b1234567"
 *       - name: isActive
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *         example: true
 *     responses:
 *       200:
 *         description: Subcategories fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", getSubCategories);

export default router;
