const express = require("express");
const Facility = require("../models/Facility");
const FacilityBooking = require("../models/FacilityBooking");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

const generateFacilityBookingId = () => {
  return "FB-" + Math.floor(100000 + Math.random() * 900000);
};

// @route POST /api/facility-bookings
// @desc Book a separate facility with dynamic slot capacity validation
router.post("/", protect, async (req, res) => {
  try {
    const {
      facilityId,
      date,
      timeSlot,
      numberOfPeople,
      paymentMethod,
    } = req.body;

    if (!facilityId || !date || !timeSlot) {
      return res.status(400).json({ success: false, message: "Facility, date, and time slot are required." });
    }

    const facility = await Facility.findById(facilityId);
    if (!facility) {
      return res.status(404).json({ success: false, message: "Facility not found." });
    }

    const people = Math.max(1, parseInt(numberOfPeople, 10) || 1);

    // Dynamic slot capacity check
    const existingBookings = await FacilityBooking.find({
      facilityId: facility._id,
      date,
      timeSlot,
      bookingStatus: { $ne: "Cancelled" },
    });

    const alreadyBooked = existingBookings.reduce((sum, b) => sum + (b.numberOfPeople || 1), 0);
    const availableCapacity = facility.capacity - alreadyBooked;

    if (availableCapacity < people) {
      return res.status(409).json({
        success: false,
        message: `Only ${Math.max(0, availableCapacity)} spot(s) remaining for ${facility.name} on ${date} at ${timeSlot}. Cannot accommodate ${people} person(s).`,
      });
    }

    const totalAmount = facility.pricingType === "per_slot"
      ? facility.price
      : facility.price * people;

    const facilityBookingId = generateFacilityBookingId();
    const paymentStatus = paymentMethod === "Cash at Reception" ? "Pending" : "Paid";

    const qrCodeData = JSON.stringify({
      facilityBookingId,
      guest: req.user.name,
      facility: facility.name,
      date,
      timeSlot,
      guests: people,
      total: `₹${totalAmount}`,
      status: paymentStatus,
    });

    const newBooking = await FacilityBooking.create({
      facilityBookingId,
      userId: req.user._id,
      guestName: req.user.name,
      guestEmail: req.user.email,
      guestPhone: req.user.phone || "",
      facilityId: facility._id,
      facilityName: facility.name,
      date,
      timeSlot,
      numberOfPeople: people,
      pricePerUnit: facility.price,
      totalAmount,
      paymentMethod: paymentMethod || "UPI",
      paymentStatus,
      bookingStatus: "Confirmed",
      qrCodeData,
    });

    return res.status(201).json({
      success: true,
      message: `${facility.name} booked successfully!`,
      booking: newBooking,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/facility-bookings/my
// @desc Get logged-in customer's facility bookings
router.get("/my", protect, async (req, res) => {
  try {
    const bookings = await FacilityBooking.find({ userId: req.user._id })
      .populate("facilityId")
      .sort({ createdAt: -1 });

    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/facility-bookings
// @desc Get all facility bookings (Admin & Reception)
router.get("/", protect, authorizeRoles("admin", "reception"), async (req, res) => {
  try {
    const { date, status } = req.query;
    const query = {};

    if (date) query.date = date;
    if (status) query.bookingStatus = status;

    const bookings = await FacilityBooking.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, bookings });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/facility-bookings/:id/status
// @desc Update facility booking status
router.put("/:id/status", protect, authorizeRoles("admin", "reception"), async (req, res) => {
  try {
    const { bookingStatus, paymentStatus } = req.body;
    const booking = await FacilityBooking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: "Facility booking not found." });
    }

    if (bookingStatus) booking.bookingStatus = bookingStatus;
    if (paymentStatus) booking.paymentStatus = paymentStatus;

    await booking.save();

    return res.json({ success: true, message: "Facility booking updated.", booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/facility-bookings/:id/cancel
// @desc Customer cancel their facility booking
router.put("/:id/cancel", protect, async (req, res) => {
  try {
    const booking = await FacilityBooking.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Facility booking not found." });
    }

    booking.bookingStatus = "Cancelled";
    await booking.save();

    return res.json({ success: true, message: "Facility booking cancelled.", booking });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
