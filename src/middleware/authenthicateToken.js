import jwt from "jsonwebtoken";
import User from "../models/User.js";
import connectToDatabase from "../lib/db.js";

export const authenticateToken = async (req, res, next) => {
  try {
    await connectToDatabase();

    let token = null;

    // ✅ 1. Check Authorization Header (Mobile Apps)
    if (req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    // ✅ 2. Fallback to Cookie (Web)
    else if (req.cookies?.auth_token) {
      token = req.cookies.auth_token;
      console.log(token);
      
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Token missing",
      });
    }

    // ✅ Verify JWT
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid or expired token",
      });
    }

    // ✅ Fetch user
    const user = await User.findById(decoded.userId).select("-password -__v");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ✅ Attach clean user info
    req.user = {
      id: user._id,
      role: user.role,
      phone: user.phone,
      email: user.email,
    };

    // Optional full document
    // req.userDoc = user;

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
