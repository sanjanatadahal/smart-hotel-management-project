const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    bookingId: {
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
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      default: "",
    },
    checkIn: {
      type: Date,
      required: true,
    },
    checkOut: {
      type: Date,
      required: true,
    },
    guests: {
      type: Number,
      default: 2,
    },
    selectedFacilities: [
      {
        facilityId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Facility",
        },
        name: String,
        price: Number,
      },
    ],
    roomAmount: {
      type: Number,
      required: true,
    },
    facilitiesAmount: {
      type: Number,
      default: 0,
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
      enum: ["Confirmed", "Checked-in", "Checked-out", "Cancelled"],
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

module.exports = mongoose.model("Booking", bookingSchema);
