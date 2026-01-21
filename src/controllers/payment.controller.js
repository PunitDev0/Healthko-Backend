import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

/**
 * @desc    Create payment for an order
 * @route   POST /api/payments
 * @access  Private
 */
export const createPayment = async (req, res) => {
  try {
    const payment = await Payment.create(req.body);

    await Order.findByIdAndUpdate(req.body.order, {
      payment: payment._id,
    });

    res.status(201).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Mark payment as paid
 * @route   PATCH /api/payments/:id/success
 * @access  Private
 */
export const markPaymentPaid = async (req, res) => {
  try {
    const { transactionId, gatewayResponse } = req.body;

    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "paid",
        transactionId,
        gatewayResponse,
      },
      { new: true }
    );

    await Order.findByIdAndUpdate(payment.order, {
      status: "paid",
    });

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc    Payment failed
 * @route   PATCH /api/payments/:id/fail
 * @access  Private
 */
export const markPaymentFailed = async (req, res) => {
  try {
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: "failed",
        gatewayResponse: req.body.gatewayResponse,
      },
      { new: true }
    );

    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
