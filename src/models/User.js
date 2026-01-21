// models/User.js
import mongoose from "mongoose";

const addressSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["home", "work", "other"],
    required: true,
    trim: true,
  },
  fullAddress: {
    type: String,
    required: true,
    trim: true,
  },
  street: { type: String, trim: true },
  city: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  zipCode: { type: String, required: true, trim: true },
  country: { type: String, default: "India", trim: true },

  landmark: { type: String, trim: true },

  location: {
    type: {
      type: String,
      enum: ["Point"],
      default: "Point",
    },
    coordinates: {
      type: [Number], // [lng, lat]
      default: [0, 0],
    },
  },

  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const userSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },

    phone: {
      type: String,
      unique: true,
      trim: true,
    },

    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    avatar: { type: String, default: "" },

    /** ✅ Sex / Gender */
    sex: {
      type: String,
      enum: ["male", "female", "other", "prefer_not_to_say"],
      trim: true,
      lowercase: true,
      default: "prefer_not_to_say",
    },

    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient",
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },

    addresses: [addressSchema],

    isPhoneVerified: { type: Boolean, default: false },

    fcmToken: { type: String, default: "" },

    deviceType: {
      type: String,
      enum: ["android", "ios", "web"],
      default: "web",
    },

    lastLoginAt: Date,
    isActive: { type: Boolean, default: true },
    deletedAt: Date,
  },
  { timestamps: true }
);

userSchema.index({ phone: 1 }, { unique: true });
userSchema.index({ location: "2dsphere" });
userSchema.index({ "addresses.location": "2dsphere" });

const User =
  mongoose.models.User || mongoose.model("User", userSchema);

export default User;
