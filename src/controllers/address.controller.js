// controllers/addressController.js

import User from "../models/User.js";
import asyncHandler from "express-async-handler";

// @desc    Get all addresses of logged-in user
// @route   GET /api/addresses
// @access  Private
export const getAddresses = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id).select("addresses");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  res.json({
    success: true,
    addresses: user.addresses.filter(addr => addr.isActive),
  });
});

// @desc    Add new address
// @route   POST /api/addresses
// @access  Private
export const addAddress = asyncHandler(async (req, res) => {
  const {
    type,
    fullAddress,
    street,
    city,
    state,
    zipCode,
    landmark,
    lat,
    lng,
    isDefault,
  } = req.body;

  if (!fullAddress || !city || !state || !zipCode || !type) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  // If setting as default, unset others
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  const newAddress = {
    type: type.toLowerCase(),
    fullAddress,
    street: street || "",
    city,
    state,
    zipCode,
    country: "India",
    landmark: landmark || "",
    location: {
      type: "Point",
      coordinates: [lng || 0, lat || 0], // [longitude, latitude]
    },
    isDefault: isDefault || user.addresses.length === 0, // First address = default
    isActive: true,
  };

  user.addresses.push(newAddress);

  await user.save();

  res.status(201).json({
    success: true,
    message: "Address added successfully",
    address: newAddress,
  });
});

// @desc    Update address
// @route   PUT /api/addresses/:id
// @access  Private
export const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const address = user.addresses.id(id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // If making this default, unset others
  if (updates.isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  // Update fields
  Object.keys(updates).forEach(key => {
    if (key === "lat" || key === "lng") {
      if (!address.location.coordinates) address.location.coordinates = [0, 0];
      if (key === "lat") address.location.coordinates[1] = updates.lat;
      if (key === "lng") address.location.coordinates[0] = updates.lng;
    } else if (key !== "isDefault") {
      address[key] = updates[key];
    }
  });

  if (updates.isDefault !== undefined) {
    address.isDefault = updates.isDefault;
  }

  await user.save();

  res.json({
    success: true,
    message: "Address updated successfully",
    address,
  });
});

// @desc    Delete address (soft delete)
// @route   DELETE /api/addresses/:id
// @access  Private
export const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const address = user.addresses.id(id);

  if (!address) {
    res.status(404);
    throw new Error("Address not found");
  }

  // Prevent deleting the last address
  if (user.addresses.filter(a => a.isActive).length === 1) {
    res.status(400);
    throw new Error("Cannot delete the last address");
  }

  address.isActive = false;

  // If deleted address was default, set first active as default
  if (address.isDefault) {
    const firstActive = user.addresses.find(a => a.isActive && a._id.toString() !== id);
    if (firstActive) firstActive.isDefault = true;
  }

  await user.save();

  res.json({
    success: true,
    message: "Address deleted successfully",
  });
});

// @desc    Set default address
// @route   PATCH /api/addresses/:id/default
// @access  Private
export const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const user = await User.findById(req.user.id);

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const address = user.addresses.id(id);

  if (!address || !address.isActive) {
    res.status(404);
    throw new Error("Address not found or inactive");
  }

  // Unset all others
  user.addresses.forEach(addr => {
    addr.isDefault = false;
  });

  address.isDefault = true;

  await user.save();

  res.json({
    success: true,
    message: "Default address updated",
    address,
  });
});