import mongoose from "mongoose";
import formidable from "formidable";
import connectToDatabase from "../lib/db.js";
import uploadToS3 from "../lib/uploadToS3.js";
import User from "../models/User.js";
import Doctor from "../models/Doctor.js";

/* ======================================================
   🔹 FORMIDABLE NORMALIZERS (VERY IMPORTANT)
====================================================== */

const getFieldValue = (v) => {
  if (Array.isArray(v)) return v[0];
  return v ?? "";
};

const getNumberValue = (v) => {
  const val = getFieldValue(v);
  return val !== "" ? Number(val) : undefined;
};

const getBooleanValue = (v) => {
  const val = getFieldValue(v);
  return val === "true" || val === true;
};

const getArrayField = (v) => {
  if (!v) return [];

  if (Array.isArray(v)) {
    if (v.length > 1) return v.map((i) => i.trim());
    return v[0].split(",").map((i) => i.trim());
  }

  return v.split(",").map((i) => i.trim());
};

/* ======================================================
   🔹 REGISTER DOCTOR (ONE-SHOT FLOW)
====================================================== */

export const registerDoctor = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    await connectToDatabase();

    /* ---------- Parse Form (Formidable) ---------- */
    const form = formidable({
      multiples: true,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
    });

    const { fields, files } = await new Promise((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        else resolve({ fields, files });
      });
    });

    const userId = req.user.id;

    /* ---------- Required Files ---------- */
    if (!files.medicalLicense || !files.professionalCertificate) {
      return res.status(400).json({
        error: "Medical license and professional certificate are required",
      });
    }

    /* ---------- Upload Files to AWS S3 ---------- */
    const medicalLicenseFile = await uploadToS3(
      files.medicalLicense,
      "doctors/licenses"
    );

    const professionalCertificateFile = await uploadToS3(
      files.professionalCertificate,
      "doctors/certificates"
    );

    const collegeIdImage = files.collegeIdImage
      ? await uploadToS3(files.collegeIdImage, "doctors/college-ids")
      : null;

    const degreeCertificateFile = files.degreeCertificate
      ? await uploadToS3(files.degreeCertificate, "doctors/degrees")
      : null;

    /* ---------- Fetch User ---------- */
    const user = await User.findById(userId).session(session);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    /* ---------- Prevent Duplicate Doctor ---------- */
    const existingDoctor = await Doctor.findOne({ user: userId }).session(
      session
    );
    if (existingDoctor) {
      return res.status(409).json({
        error: "Doctor profile already exists",
      });
    }

    /* ---------- Update User ---------- */
    user.fullName = getFieldValue(fields.fullName);
    user.email = getFieldValue(fields.email);
    user.sex = getFieldValue(fields.sex);
    user.role = "doctor";

    const fcmToken = getFieldValue(fields.fcmToken);
    if (fcmToken) user.fcmToken = fcmToken;

    await user.save({ session });

    /* ---------- Create Doctor ---------- */
    const doctor = await Doctor.create(
      [
        {
          user: userId,

          specialization: getFieldValue(fields.specialization),
          experienceYears: getNumberValue(fields.experienceYears),

          medicalRegistrationNumber: getFieldValue(
            fields.medicalRegistrationNumber
          ),
          medicalCouncil: getFieldValue(fields.medicalCouncil),

          consultationFee: getNumberValue(fields.consultationFee),
          travellingFeePerKm: getNumberValue(fields.travellingFeePerKm),

          medicalLicenseFile,
          professionalCertificateFile,

          education: {
            highestQualification: getFieldValue(
              fields.highestQualification
            ),
            collegeName: getFieldValue(fields.collegeName),
            yearOfCompletion: getNumberValue(fields.yearOfCompletion),
            collegeIdNumber: getFieldValue(fields.collegeIdNumber),
            collegeIdImage,
            additionalCertifications: getArrayField(
              fields.additionalCertifications
            ),
            degreeCertificateNumber: getFieldValue(
              fields.degreeCertificateNumber
            ),
            degreeCertificateFile,
          },

          clinicAddress: getFieldValue(fields.clinicAddress),
          city: getFieldValue(fields.city),
          state: getFieldValue(fields.state),
          zipCode: getFieldValue(fields.zipCode),

          serviceRadiusKm:
            getNumberValue(fields.serviceRadiusKm) || 15,

          homeVisitAvailable: getBooleanValue(
            fields.homeVisitAvailable
          ),

          languagesSpoken: getArrayField(fields.languagesSpoken),
          bio: getFieldValue(fields.bio),

          isVerified: false, // admin approval pending
        },
      ],
      { session }
    );

    await session.commitTransaction();

    return res.status(201).json({
      success: true,
      message: "Doctor registered successfully. Verification pending.",
      doctor: doctor[0],
    });
  } catch (error) {
    await session.abortTransaction();
    console.error("Doctor Registration Error:", error);

    return res.status(500).json({
      error: error.message || "Doctor registration failed",
    });
  } finally {
    session.endSession();
  }
};
