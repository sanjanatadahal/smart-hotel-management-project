const express = require("express");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/rooms
// @desc Get all rooms, with optional dynamic date availability checking
router.get("/", async (req, res) => {
  try {
    const { checkIn, checkOut } = req.query;
    const rooms = await Room.find().sort({ price: 1 });

    if (!checkIn || !checkOut) {
      return res.json({ success: true, rooms });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime())) {
      return res.status(400).json({ success: false, message: "Invalid date format." });
    }

    // Find conflicting bookings: (existing.checkIn < req.checkOut && existing.checkOut > req.checkIn)
    const conflictingBookings = await Booking.find({
      bookingStatus: { $in: ["Confirmed", "Checked-in"] },
      $or: [
        {
          checkIn: { $lt: checkOutDate },
          checkOut: { $gt: checkInDate },
        },
      ],
    }).select("roomId checkIn checkOut");

    const bookedRoomIdSet = new Set(
      conflictingBookings.map((b) => b.roomId.toString())
    );

    const enrichedRooms = rooms.map((room) => {
      const isBooked = bookedRoomIdSet.has(room._id.toString()) || room.status !== "Available";
      return {
        ...room.toObject(),
        isBooked,
      };
    });

    return res.json({ success: true, rooms: enrichedRooms });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/rooms/:id
// @desc Get single room
router.get("/:id", async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }
    return res.json({ success: true, room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/rooms
// @desc Add new room (Admin only)
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, roomNumber, type, price, bed, guests, description, images, status } = req.body;

    const existingRoom = await Room.findOne({ roomNumber });
    if (existingRoom) {
      return res.status(400).json({ success: false, message: `Room number ${roomNumber} already exists.` });
    }

    const newRoom = await Room.create({
      name,
      roomNumber,
      type: type || name,
      price,
      bed: bed || "King Bed",
      guests: guests || 2,
      description: description || "",
      images: images || [],
      status: status || "Available",
      cleaningStatus: "Clean",
    });

    return res.status(201).json({ success: true, message: "Room created successfully.", room: newRoom });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/rooms/:id
// @desc Update room (Admin or Reception)
router.put("/:id", protect, authorizeRoles("admin", "reception"), async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    const { name, roomNumber, type, price, bed, guests, description, images, status, cleaningStatus } = req.body;

    if (name !== undefined) room.name = name;
    if (roomNumber !== undefined) room.roomNumber = roomNumber;
    if (type !== undefined) room.type = type;
    if (price !== undefined) room.price = price;
    if (bed !== undefined) room.bed = bed;
    if (guests !== undefined) room.guests = guests;
    if (description !== undefined) room.description = description;
    if (images !== undefined) room.images = images;
    if (status !== undefined) room.status = status;
    if (cleaningStatus !== undefined) room.cleaningStatus = cleaningStatus;

    await room.save();

    return res.json({ success: true, message: "Room updated successfully.", room });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/rooms/:id
// @desc Delete room (Admin only)
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const room = await Room.findByIdAndDelete(req.params.id);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }
    return res.json({ success: true, message: "Room deleted successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
