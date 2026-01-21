import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { otpStore } from "../lib/otpStore.js";
import connectToDatabase from "../lib/db.js";

// ---------------- TOKEN AUTH MIDDLEWARE ----------------
export const authenticateToken = async (req, res, next) => {
  try {
    await connectToDatabase();

    const token = req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtErr) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }

    const user = await User.findById(payload.userId).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = payload; // Set payload (userId, phone) for use in route handlers
    req.userDoc = user; // Set full user doc

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ---------------- SEND OTP ----------------
export const sendOtp = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ error: "Phone required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore.set(phone, {
      otp,
      expiresAt: Date.now() + 3 * 60 * 1000, // 3 minutes
    });

    const url = "https://www.fast2sms.com/dev/bulkV2";

    const payload = {
      route: "dlt",
      sender_id: process.env.FAST2SMS_SENDER_ID,
      message: process.env.FAST2SMS_DLT_TEMPLATE_ID,
      variables_values: otp,
      numbers: phone.replace(/^\+/, ""), // Remove + if present for SMS API
      flash: "0",
    };

    const response = await fetch(url, {
      method: "POST",
      headers: {
        authorization: process.env.FAST2SMS_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log("📩 OTP:", otp, data);

    return res.json({
      success: true,
      message: "OTP sent successfully",
    });
  } catch (error) {
    console.error("OTP Send Error:", error);
    return res.status(500).json({
      error: error.message || "Internal Server Error",
    });
  }
};

// ---------------- VERIFY OTP (handles login/signup) ----------------
export const verifyOtp = async (req, res, next) => {
  try {
    await connectToDatabase();

    const { phone, otp } = req.body;

    const data = otpStore.get(phone);

    if (!data) return res.status(400).json({ error: "OTP not found" });
    if (Date.now() > data.expiresAt)
      return res.status(400).json({ error: "OTP expired" });
    if (otp !== data.otp) return res.status(400).json({ error: "Invalid OTP" });

    otpStore.delete(phone);

    // Check if user exists
    let user = await User.findOne({ phone });

    if (!user) {
      // Create new user with minimal fields (only phone required)
      user = await User.create({
        fullName: "",
        phone,
        email: "",
        address: "",
        role: "patient",
        isPhoneVerified: true,
        location: null,
        fcmToken: "",
        deviceType: "web",
        lastLoginAt: new Date(),
      });
    } else {
      // Update last login for existing user
      user.lastLoginAt = new Date();
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    console.log(token);

    // Enhanced cookie options for better cross-origin support
    const options = {
      httpOnly: true,
      secure: false, // Localhost me false
      sameSite: "lax",
      maxAge: 24 * 60 * 60 * 1000,
      path: "/",
    };

    console.log("Token set in cookie for phone:", phone); // Debug log

    return res
      .status(201)
      .cookie("auth_token", token, options)
      .json({
        success: true,
        message: user.fullName
          ? "Login successful!"
          : "Account created and logged in!",
        user: {
          id: user._id,
          fullName: user.fullName,
          phone: user.phone,
          email: user.email,
        },
        token,
      });
  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// ---------------- GET CURRENT USER (/me) ----------------
export const getMe = async (req, res) => {
  try {
    res.json({
      success: true,
      user: {
        id: req.user.id,
        fullName: req.user.fullName,
        phone: req.user.phone,
        email: req.user.email,
        address: req.user.address,
        role: req.user.role,
        isPhoneVerified: req.user.isPhoneVerified,
        lastLoginAt: req.user.lastLoginAt,
      },
    });
  } catch (error) {
    console.error("Get Me Error:", error);
    res.status(500).json({ error: error.message });
  }
};


// ---------------- UPDATE USER DETAILS (EXCEPT ADDRESS) ----------------
export const updateUserDetails = async (req, res) => {
  try {
    await connectToDatabase();

    const userId = req.user.id; // from JWT payload

    // ❌ address & restricted fields intentionally excluded
    const allowedFields = [
      "fullName",
      "email",
      "sex",
      "avatar",
      "location",
      "fcmToken",
      "deviceType",
    ];

    const updates = {};

    for (const key of allowedFields) {
      if (req.body[key] !== undefined) {
        updates[key] = req.body[key];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        error: "No valid fields provided for update",
      });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { $set: updates },
      { new: true, runValidators: true }
    ).select("-__v");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      success: true,
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.error("Update User Error:", error);
    res.status(500).json({ error: error.message });
  }
};
