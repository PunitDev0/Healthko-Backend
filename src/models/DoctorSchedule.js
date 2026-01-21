// models/DoctorSchedule.js
import mongoose from "mongoose";

const timeSlotSchema = new mongoose.Schema({
  startTime: {
    type: String, // e.g., "09:00"
    required: true,
  },
  endTime: {
    type: String, // e.g., "10:00"
    required: true,
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  bookedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order", // If booked
  },
});

const doctorScheduleSchema = new mongoose.Schema(
  {
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: {
      type: Date, // yyyy-mm-dd format, but store as Date (start of day)
      required: true,
    },
    timeSlots: [timeSlotSchema],
    // Weekly recurring? For simplicity, daily entries; cron job to generate future schedules
  },
  { timestamps: true }
);

doctorScheduleSchema.index({ doctor: 1, date: 1 }, { unique: true });

const DoctorSchedule =
  mongoose.models.DoctorSchedule || mongoose.model("DoctorSchedule", doctorScheduleSchema);

export default DoctorSchedule;