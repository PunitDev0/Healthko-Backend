import express from 'express';
import { createSubCategory, getSubCategories } from '../controllers/subCategory.controller.js';

const router = express.Router();

router.post('/', createSubCategory);
router.get('/', getSubCategories);

export default router;
