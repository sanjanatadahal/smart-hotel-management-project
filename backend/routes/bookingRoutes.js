const express = require("express");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const CleaningTask = require("../models/CleaningTask");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// Helper to generate a unique readable booking ID: e.g. BK-783921
const generateBookingId = () => {
  return "BK-" + Math.floor(100000 + Math.random() * 900000);
};

// @route POST /api/bookings/room
// @desc Create room booking with double-booking prevention and room add-ons
router.post("/room", protect, async (req, res) => {
  try {
    const {
      roomId,
      checkIn,
      checkOut,
      guests,
      selectedFacilities,
      paymentMethod,
    } = req.body;

    if (!roomId || !checkIn || !checkOut) {
      return res.status(400).json({ success: false, message: "Room, check-in, and check-out dates are required." });
    }

    const checkInDate = new Date(checkIn);
    const checkOutDate = new Date(checkOut);

    if (checkOutDate <= checkInDate) {
      return res.status(400).json({ success: false, message: "Check-out date must be after check-in date." });
    }

    const room = await Room.findById(roomId);
    if (!room) {
      return res.status(404).json({ success: false, message: "Room not found." });
    }

    // Double booking check: (existing.checkIn < new.checkOut && existing.checkOut > new.checkIn)
    const conflictingBooking = await Booking.findOne({
      roomId: room._id,
      bookingStatus: { $in: ["Confirmed", "Checked-in"] },
      checkIn: { $lt: checkOutDate },
      checkOut: { $gt: checkInDate },
    });

    if (conflictingBooking) {
      return res.status(409).json({
        success: false,
        message: `This room is already booked for the selected dates (${conflictingBooking.checkIn.toISOString().split("T")[0]} to ${conflictingBooking.checkOut.toISOString().split("T")[0]}). Please choose alternative dates or another room.`,
      });
    }

    // Calculate nights
    const oneDay = 24 * 60 * 60 * 1000;
    const nights = Math.max(1, Math.round(Math.abs((checkOutDate - checkInDate) / oneDay)));
    const roomAmount = room.price * nights;

    // Calculate selected add-ons
    let facilitiesAmount = 0;
    const addOns = (selectedFacilities || []).map((f) => {
      facilitiesAmount += Number(f.price || 0);
      return {
        facilityId: f.facilityId || null,
        name: f.name,
        price: Number(f.price || 0),
      };
    });

    const totalAmount = roomAmount + facilitiesAmount;
    const bookingId = generateBookingId();

    const paymentStatus = paymentMethod === "Cash at Reception" ? "Pending" : "Paid";

    // QR Code data payload
    const qrCodeData = JSON.stringify({
      bookingId,
      guest: req.user.name,
      room: room.name,
      roomNumber: room.roomNumber,
      checkIn: checkInDate.toISOString().split("T")[0],
      checkOut: checkOutDate.toISOString().split("T")[0],
      total: `₹${totalAmount}`,
      status: paymentStatus,
    });

    const newBooking = await Booking.create({
      bookingId,
      userId: req.user._id,
      guestName: req.user.name,
      guestEmail: req.user.email,
      guestPhone: req.user.phone || "",
      roomId: room._id,
      roomName: room.name,
      roomNumber: room.roomNumber,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests: guests || 2,
      selectedFacilities: addOns,
      roomAmount,
      facilitiesAmount,
      totalAmount,
      paymentMethod: paymentMethod || "UPI",
      paymentStatus,
      bookingStatus: "Confirmed",
      qrCodeData,
    });

    return res.status(201).json({
      success: true,
      message: "Room booking confirmed successfully!",
      booking: newBooking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/bookings/my
// @desc Get logged-in customer's bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate("roomId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/bookings
// @desc Get all bookings (Reception & Admin) with search & filter
router.get("/", protect, authorizeRoles("reception", "admin"), async (req, res) => {
  try {
    const { status, search, date } = req.query;
    const query = {};

    if (status) {
      query.bookingStatus = status;
    }

    if (search) {
      query.$or = [
        { bookingId: { $regex: search, $options: "i" } },
        { guestName: { $regex: search, $options: "i" } },
        { guestEmail: { $regex: search, $options: "i" } },
        { roomNumber: { $regex: search, $options: "i" } },
        { roomName: { $regex: search, $options: "i" } },
      ];
    }

    if (date) {
      const targetDate = new Date(date);
      const nextDay = new Date(targetDate);
      nextDay.setDate(nextDay.getDate() + 1);

      query.$or = [
        { checkIn: { $gte: targetDate, $lt: nextDay } },
        { checkOut: { $gte: targetDate, $lt: nextDay } },
      ];
    }

    const bookings = await Booking.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/bookings/:id/status
// @desc Update booking status (Check-in, Check-out, Cancel)
// When Checked-out, automatically creates Housekeeping task!
router.put("/:id/status", protect, authorizeRoles("reception", "admin"), async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (paymentStatus) {
      booking.paymentStatus = paymentStatus;
    }

    if (bookingStatus) {
      booking.bookingStatus = bookingStatus;

      const room = await Room.findById(booking.roomId);

      if (bookingStatus === "Checked-in") {
        if (room) {
          room.status = "Occupied";
          await room.save();
        }
      } else if (bookingStatus === "Checked-out") {
        if (room) {
          room.status = "Available";
          room.cleaningStatus = "Needs Cleaning";
          await room.save();

          // Automatically trigger housekeeping task
          const taskId = "CLN-" + Math.floor(10000 + Math.random() * 90000);
          await CleaningTask.create({
            taskId,
            roomId: room._id,
            roomNumber: room.roomNumber,
            roomName: room.name,
            status: "Needs Cleaning",
            notes: `Automatic cleaning task created after guest checkout (${booking.guestName}, Booking: ${booking.bookingId})`,
          });
        }
      } else if (bookingStatus === "Cancelled") {
        if (room && room.status === "Occupied") {
          room.status = "Available";
          await room.save();
        }
      }
    }

    await booking.save();

    return res.json({
      success: true,
      message: `Booking status updated to ${booking.bookingStatus}.`,
      booking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/bookings/:id/cancel
// @desc Customer self-cancel their booking
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (booking.bookingStatus === "Checked-in" || booking.bookingStatus === "Checked-out") {
      return res.status(400).json({ success: false, message: "Cannot cancel a booking that is active or completed." });
    }

    booking.bookingStatus = "Cancelled";
    await booking.save();

    return res.json({ success: true, message: "Booking cancelled successfully.", booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
