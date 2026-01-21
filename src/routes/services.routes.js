import express from 'express';
import { createService, getServices } from '../controllers/services.controller.js'; 

const router = express.Router();

// GET services
router.get('/', getServices);
router.post('/', createService);

export default router;
