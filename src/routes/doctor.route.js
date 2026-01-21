import express from "express";
import { registerDoctor } from "../controllers/doctor.controller.js";
import { authenticateToken } from "../middleware/authenthicateToken.js";

const router = express.Router();

// 🔐 auth only — NO upload middleware
router.post(
  "/",
  authenticateToken,
  registerDoctor
);

export default router;
