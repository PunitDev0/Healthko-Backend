// controllers/orderController.js
import Razorpay from "razorpay";
import crypto from "crypto";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import mongoose from "mongoose";

// Initialize Razorpay instance (use environment variables in production)
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * POST /api/orders/create
 * Create Order + Razorpay Payment Order
 */
export const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      patientName,
      patientAge,
      patientGender,
      address,
      location, // { lat, lng }
      services, // [{ service: ObjectId, quantity: Number }]
      notes,
      appointmentDateTime, // ISO string
    } = req.body;

    const userId = req.user.id; // Assuming auth middleware sets req.user

    if (!patientName || !address || !services || !appointmentDateTime) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (!Array.isArray(services) || services.length === 0) {
      return res.status(400).json({ message: "At least one service required" });
    }

    // Validate appointment time (e.g., not in past)
    const appointmentDate = new Date(appointmentDateTime);
    if (appointmentDate < new Date()) {
      return res.status(400).json({ message: "Appointment cannot be in the past" });
    }

    // Calculate total amount (you should populate service prices)
    // Here we assume frontend sends correct total, but better to validate on backend
    // For simplicity, we'll trust frontend or fetch prices
    let totalAmount = 0;

    // Optional: Populate and validate services
    // const populatedServices = await Service.find({ _id: { $in: services.map(s => s.service) } });
    // But for now, assume frontend sends correct totalAmount
    const { totalAmount: clientTotal } = req.body;
    if (!clientTotal || clientTotal <= 0) {
      return res.status(400).json({ message: "Invalid total amount" });
    }

    totalAmount = Math.round(clientTotal * 100); // Razorpay uses paise

    // Create Order in DB
    const order = await Order.create(
      [
        {
          user: userId,
          patientName: patientName.trim(),
          patientAge,
          patientGender,
          address: address.trim(),
          location: {
            type: "Point",
            coordinates: [location.lng, location.lat], // MongoDB: [lng, lat]
          },
          services: services.map((s) => ({
            service: s.service,
            quantity: s.quantity || 1,
          })),
          totalAmount: clientTotal,
          appointmentDateTime: appointmentDate,
          notes: notes?.trim(),
          status: "pending",
        },
      ],
      { session }
    );

    const newOrder = order[0];

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create({
      amount: totalAmount, // in paise
      currency: "INR",
      receipt: `receipt_${newOrder._id}`,
      notes: {
        order_id: newOrder._id.toString(),
        user_id: userId.toString(),
      },
    });

    // Create Payment record
    await Payment.create(
      [
        {
          order: newOrder._id,
          amount: clientTotal,
          status: "pending",
          method: "razorpay",
          transactionId: razorpayOrder.id, // Razorpay order ID
          gatewayResponse: razorpayOrder,
        },
      ],
      { session }
    );

    await session.commitTransaction();

    res.status(201).json({
      success: true,
      order: newOrder,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID, // Send public key to frontend
      },
      message: "Order created successfully. Proceed to payment.",
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Create Order Error:", error);
    res.status(500).json({
      message: "Failed to create order",
      error: error.message,
    });
  } finally {
    session.endSession();
  }
};

/**
 * POST /api/orders/verify-payment
 * Verify Razorpay Payment Signature
 */
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId, // Your DB order _id
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment details" });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (!isAuthentic) {
      return res.status(400).json({ message: "Invalid payment signature" });
    }

    // Update Payment & Order status
    await Promise.all([
      Payment.findOneAndUpdate(
        { transactionId: razorpay_order_id },
        {
          status: "paid",
          gatewayResponse: { ...req.body },
        }
      ),
      Order.findByIdAndUpdate(orderId, {
        status: "paid",
      }),
    ]);

    res.json({
      success: true,
      message: "Payment verified successfully",
      paymentId: razorpay_payment_id,
    });
  } catch (error) {
    console.error("Payment Verification Error:", error);
    res.status(500).json({ message: "Payment verification failed" });
  }
};

/**
 * GET /api/orders/:orderId
 * Get single order by orderId
 */
export const getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      return res.status(400).json({ message: "Invalid order ID" });
    }

    const order = await Order.findOne({
      _id: orderId,
      user: userId,
    })
      .populate("services.service", "name price duration")
      .populate("user", "name email phone");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const payment = await Payment.findOne({ order: order._id });

    res.status(200).json({
      success: true,
      order,
      payment,
    });
  } catch (error) {
    console.error("Get Order By ID Error:", error);
    res.status(500).json({
      message: "Failed to fetch order",
      error: error.message,
    });
  }
};

/**
 * GET /api/orders
 * Get all orders of logged-in user
 */
export const getUserOrders = async (req, res) => {
  try {
    const userId = req.user.id;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("services.service", "name price duration")
      .lean();

    const orderIds = orders.map((o) => o._id);

    const payments = await Payment.find({ order: { $in: orderIds } }).lean();

    const paymentMap = {};
    payments.forEach((p) => {
      paymentMap[p.order.toString()] = p;
    });

    const finalOrders = orders.map((order) => ({
      ...order,
      payment: paymentMap[order._id.toString()] || null,
    }));

    res.status(200).json({
      success: true,
      count: finalOrders.length,
      orders: finalOrders,
    });
  } catch (error) {
    console.error("Get User Orders Error:", error);
    res.status(500).json({
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
};
