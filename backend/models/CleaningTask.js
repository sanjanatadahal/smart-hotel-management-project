const mongoose = require("mongoose");

const cleaningTaskSchema = new mongoose.Schema(
  {
    taskId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    roomNumber: {
      type: String,
      required: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Needs Cleaning", "Under Cleaning", "Clean", "Maintenance"],
      default: "Needs Cleaning",
    },
    notes: {
      type: String,
      default: "Automatic housekeeping task generated upon guest checkout.",
    },
    assignedTo: {
      type: String,
      default: "Housekeeping Staff",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("CleaningTask", cleaningTaskSchema);
