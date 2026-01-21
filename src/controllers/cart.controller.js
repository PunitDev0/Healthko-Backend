// controllers/cart.controller.js

import Cart from "../models/Cart.js";
import Service from "../models/Service.js";

/**
 * Helper: Calculate total amount
 */
const calculateTotalAmount = (items) =>
  items.reduce(
    (total, item) => total + item.service.price * item.quantity,
    0
  );

/**
 * @desc    Get user's cart
 * @route   GET /api/cart
 * @access  Private
 */
export const getCart = async (req, res) => {
  try {
    const userId = req.user.id;

    let cart = await Cart.findOne({ user: userId }).populate({
      path: "items.service",
      select: "name price image duration description",
      match: { isActive: true },
    });

    if (!cart) {
      return res.status(200).json({
        success: true,
        data: { items: [], totalAmount: 0, itemCount: 0 },
      });
    }

    // Remove inactive / deleted services
    cart.items = cart.items.filter((item) => item.service);

    cart.totalAmount = calculateTotalAmount(cart.items);
    await cart.save();

    const itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        _id: cart._id,
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount,
      },
    });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Add item to cart
 * @route   POST /api/cart/add
 * @access  Private
 */
export const addToCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, quantity = 1 } = req.body;

    if (!serviceId || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid serviceId or quantity" });
    }

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
    });

    if (!service) {
      return res
        .status(404)
        .json({ success: false, message: "Service not found" });
    }

    let cart = await Cart.findOne({ user: userId });

    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.service.toString() === serviceId
    );

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity += quantity;
    } else {
      cart.items.push({ service: serviceId, quantity });
    }

    await cart.populate("items.service", "price name image duration description");

    cart.totalAmount = calculateTotalAmount(cart.items);
    await cart.save();

    const itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount,
      },
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Update cart item quantity
 * @route   PUT /api/cart/update
 * @access  Private
 */
export const updateCartItem = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId, quantity } = req.body;

    if (!serviceId || quantity < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid serviceId or quantity" });
    }

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.service",
      "price name image duration description"
    );

    if (!cart || cart.items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Cart is empty" });
    }

    const item = cart.items.find(
      (i) => i.service._id.toString() === serviceId
    );

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found in cart" });
    }

    item.quantity = quantity;
    cart.totalAmount = calculateTotalAmount(cart.items);

    await cart.save();

    const itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount,
      },
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Remove item from cart
 * @route   DELETE /api/cart/remove/:serviceId
 * @access  Private
 */
export const removeFromCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const { serviceId } = req.params;

    const cart = await Cart.findOne({ user: userId }).populate(
      "items.service",
      "price name image duration description"
    );

    if (!cart || cart.items.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Cart is empty" });
    }

    cart.items = cart.items.filter(
      (item) => item.service._id.toString() !== serviceId
    );

    cart.totalAmount = calculateTotalAmount(cart.items);
    await cart.save();

    const itemCount = cart.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      message: "Item removed",
      data: {
        items: cart.items,
        totalAmount: cart.totalAmount,
        itemCount,
      },
    });
  } catch (error) {
    console.error("Remove Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * @desc    Clear cart
 * @route   DELETE /api/cart/clear
 * @access  Private
 */
export const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;

    const cart = await Cart.findOneAndUpdate(
      { user: userId },
      { items: [], totalAmount: 0 },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      data: { items: [], totalAmount: 0, itemCount: 0 },
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
