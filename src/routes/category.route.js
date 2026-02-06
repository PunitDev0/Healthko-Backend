import express from "express";
import {
  createCategory,
  getCategories,
} from "../controllers/category.controller.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Categories
 *   description: Category Management APIs
 */

/**
 * @swagger
 * /api/categories:
 *   post:
 *     summary: Create a new category
 *     tags: [Categories]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - slug
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Home Cleaning"
 *               slug:
 *                 type: string
 *                 example: "home-cleaning"
 *               description:
 *                 type: string
 *                 example: "All types of home cleaning services"
 *               isActive:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Category created successfully
 *       400:
 *         description: Name and slug are required
 *       409:
 *         description: Category already exists
 *       500:
 *         description: Server error
 */
router.post("/", createCategory);

/**
 * @swagger
 * /api/categories:
 *   get:
 *     summary: Get all categories
 *     tags: [Categories]
 *     parameters:
 *       - name: isActive
 *         in: query
 *         required: false
 *         schema:
 *           type: boolean
 *         example: true
 *     responses:
 *       200:
 *         description: Categories fetched successfully
 *       500:
 *         description: Server error
 */
router.get("/", getCategories);

export default router;
