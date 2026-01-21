import mongoose from "mongoose";

/**
 * =========================
 * EDUCATION SUB-SCHEMA
 * =========================
 */
const educationSchema = new mongoose.Schema(
  {
    highestQualification: {
      type: String,
      required: true, // MBBS, BSc Nursing, GNM etc
      trim: true,
    },

    collegeName: {
      type: String,
      required: true,
      trim: true,
    },

    yearOfCompletion: {
      type: Number,
      required: true,
    },

    collegeIdNumber: {
      type: String,
      trim: true,
    },

    collegeIdImage: {
      type: String, // uploaded file URL
      trim: true,
    },

    additionalCertifications: [
      {
        type: String, // comma separated values allowed from UI
        trim: true,
      },
    ],

    degreeCertificateNumber: {
      type: String,
      trim: true,
    },

    degreeCertificateFile: {
      type: String, // uploaded file URL
      trim: true,
    },
  },
  { _id: false }
);

/**
 * =========================
 * DOCTOR SCHEMA
 * =========================
 */
const doctorSchema = new mongoose.Schema(
  {
    /** 🔗 Link to User */
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /**
     * =========================
     * PROFESSIONAL INFORMATION
     * =========================
     */
    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    experienceYears: {
      type: Number,
      required: true,
      min: 0,
    },

    medicalRegistrationNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    medicalCouncil: {
      type: String,
      required: true, // eg: Delhi Medical Council
      trim: true,
    },

    consultationFee: {
      type: Number,
      required: true,
      min: 0,
    },

    travellingFeePerKm: {
      type: Number,
      required: true,
      min: 0,
    },

    /**
     * =========================
     * DOCUMENT UPLOADS
     * =========================
     */
    medicalLicenseFile: {
      type: String, // PDF / JPG / PNG
      required: true,
    },

    professionalCertificateFile: {
      type: String,
      required: true,
    },

    /**
     * =========================
     * EDUCATION DETAILS
     * =========================
     */
    education: educationSchema,

    /**
     * =========================
     * SERVICE AREA
     * =========================
     */
    clinicAddress: {
      type: String,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    state: {
      type: String,
      required: true,
      trim: true,
    },

    zipCode: {
      type: String,
      required: true,
      trim: true,
    },

    serviceRadiusKm: {
      type: Number,
      required: true,
      default: 15,
    },

    homeVisitAvailable: {
      type: Boolean,
      default: true,
    },

    /**
     * =========================
     * ADDITIONAL INFORMATION
     * =========================
     */
    languagesSpoken: [
      {
        type: String,
        trim: true,
      },
    ],

    bio: {
      type: String,
      maxlength: 5000,
      trim: true,
    },

    /**
     * =========================
     * VERIFICATION & STATUS
     * =========================
     */
    isVerified: {
      type: Boolean,
      default: false,
    },

    verifiedAt: Date,

    isActive: {
      type: Boolean,
      default: true,
    },

    deletedAt: Date,
  },
  { timestamps: true }
);

/**
 * =========================
 * INDEXES
 * =========================
 */
doctorSchema.index({ user: 1 });
doctorSchema.index({ specialization: 1 });
doctorSchema.index({ city: 1 });
doctorSchema.index({ isVerified: 1 });

export default mongoose.models.Doctor ||
  mongoose.model("Doctor", doctorSchema);
