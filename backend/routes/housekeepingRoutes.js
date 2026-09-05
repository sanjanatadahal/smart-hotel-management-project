const express = require("express");
const CleaningTask = require("../models/CleaningTask");
const Room = require("../models/Room");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/housekeeping/tasks
// @desc Get cleaning tasks (Housekeeping, Reception, Admin)
router.get("/tasks", protect, authorizeRoles("housekeeping", "reception", "admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const tasks = await CleaningTask.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, tasks });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/housekeeping/tasks/:id
// @desc Update task status (Needs Cleaning -> Under Cleaning -> Clean)
router.put("/tasks/:id", protect, authorizeRoles("housekeeping", "reception", "admin"), async (req, res) => {
  try {
    const { status, notes, assignedTo } = req.body;
    const task = await CleaningTask.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: "Cleaning task not found." });
    }

    if (status) task.status = status;
    if (notes !== undefined) task.notes = notes;
    if (assignedTo !== undefined) task.assignedTo = assignedTo;
    task.updatedAt = Date.now();

    await task.save();

    // If marked Clean, update the Room
    if (status === "Clean") {
      const room = await Room.findById(task.roomId);
      if (room) {
        room.cleaningStatus = "Clean";
        if (room.status !== "Occupied") {
          room.status = "Available";
        }
        await room.save();
      }
    } else if (status === "Under Cleaning" || status === "Needs Cleaning") {
      const room = await Room.findById(task.roomId);
      if (room) {
        room.cleaningStatus = status;
        await room.save();
      }
    }

    return res.json({ success: true, message: `Task status updated to ${task.status}.`, task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/housekeeping/tasks
// @desc Create manual cleaning or maintenance task
router.post("/tasks", protect, authorizeRoles("housekeeping", "reception", "admin"), async (req, res) => {
  try {
    const { roomId, notes, status, assignedTo } = req.body;

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    const taskId = "CLN-" + Math.floor(10000 + Math.random() * 90000);
    const task = await CleaningTask.create({
      taskId,
      roomId: room._id,
      roomNumber: room.roomNumber,
      roomName: room.name,
      status: status || "Needs Cleaning",
      notes: notes || "Manual inspection/cleaning task",
      assignedTo: assignedTo || "Housekeeping Staff",
    });

    room.cleaningStatus = status || "Needs Cleaning";
    await room.save();

    return res.status(201).json({ success: true, message: "Cleaning task created.", task });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
