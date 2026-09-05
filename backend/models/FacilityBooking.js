const mongoose = require("mongoose");

const facilityBookingSchema = new mongoose.Schema(
  {
    facilityBookingId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    guestName: {
      type: String,
      required: true,
    },
    guestEmail: {
      type: String,
      required: true,
    },
    guestPhone: {
      type: String,
      default: "",
    },
    facilityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Facility",
      required: true,
    },
    facilityName: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true, // YYYY-MM-DD
    },
    timeSlot: {
      type: String,
      required: true,
    },
    numberOfPeople: {
      type: Number,
      default: 1,
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Cash at Reception"],
      default: "UPI",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending", "Refunded"],
      default: "Paid",
    },
    bookingStatus: {
      type: String,
      enum: ["Confirmed", "Completed", "Cancelled"],
      default: "Confirmed",
    },
    qrCodeData: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FacilityBooking", facilityBookingSchema);
