const mongoose = require("mongoose");

const foodOrderSchema = new mongoose.Schema(
  {
    orderId: {
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
    customerName: {
      type: String,
      required: true,
    },
    roomNumber: {
      type: String,
      default: "Dine-in / Table",
    },
    items: [
      {
        foodItemId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "FoodItem",
        },
        name: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          default: 1,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ["UPI", "Card", "Cash on Delivery", "Room Charge"],
      default: "UPI",
    },
    paymentStatus: {
      type: String,
      enum: ["Paid", "Pending"],
      default: "Paid",
    },
    orderStatus: {
      type: String,
      enum: ["New", "Delivered"],
      default: "New",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("FoodOrder", foodOrderSchema);
