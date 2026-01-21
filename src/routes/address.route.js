// routes/addressRoutes.js

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

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET all addresses of the logged-in user
// POST add a new address
router.route("/")
  .get(getAddresses)
  .post(addAddress);

// UPDATE or DELETE a specific address by ID
router.route("/:id")
  .put(updateAddress)
  .delete(deleteAddress);

// Set an address as default
router.route("/:id/default")
  .patch(setDefaultAddress);

export default router;