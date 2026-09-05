const express = require("express");
const Facility = require("../models/Facility");
const FacilityBooking = require("../models/FacilityBooking");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/facilities
// @desc Get facilities (optional ?type=addon or ?type=separate)
router.get("/", async (req, res) => {
  try {
    const { type } = req.query;
    const filter = { isActive: true };

    if (type === "addon") {
      filter.isRoomAddon = true;
    } else if (type === "separate") {
      filter.isSeparateBooking = true;
    }

    const facilities = await Facility.find(filter).sort({ name: 1 });
    return res.json({ success: true, facilities });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/facilities/:id/availability?date=YYYY-MM-DD
// @desc Get dynamic capacity status for all time slots on a given date
router.get("/:id/availability", async (req, res) => {
  try {
    const { date } = req.query;
    const facility = await Facility.findById(req.params.id);

    if (!facility) {
      return res.status(404).json({ success: false, message: "Facility not found." });
    }

    const queryDate = date || new Date().toISOString().split("T")[0];

    // Find all confirmed bookings for this facility on the specified date
    const bookings = await FacilityBooking.find({
      facilityId: facility._id,
      date: queryDate,
      bookingStatus: { $ne: "Cancelled" },
    });

    // Compute booked slots
    const slotCounts = {};
    facility.timeSlots.forEach((slot) => {
      slotCounts[slot] = 0;
    });

    bookings.forEach((b) => {
      if (slotCounts[b.timeSlot] !== undefined) {
        slotCounts[b.timeSlot] += b.numberOfPeople || 1;
      }
    });

    const slotsAvailability = facility.timeSlots.map((slot) => {
      const booked = slotCounts[slot] || 0;
      const remaining = Math.max(0, facility.capacity - booked);
      let status = "Available";

      if (remaining === 0) {
        status = "Fully booked";
      } else if (remaining <= Math.ceil(facility.capacity * 0.25)) {
        status = "Limited availability";
      }

      return {
        slot,
        capacity: facility.capacity,
        booked,
        available: remaining,
        status,
        isFull: remaining === 0,
      };
    });

    return res.json({
      success: true,
      facilityId: facility._id,
      facilityName: facility.name,
      date: queryDate,
      slots: slotsAvailability,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/facilities
// @desc Add facility (Admin only)
router.post("/", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const {
      name,
      description,
      image,
      price,
      pricingType,
      capacity,
      timeSlots,
      isRoomAddon,
      isSeparateBooking,
    } = req.body;

    const newFacility = await Facility.create({
      name,
      description,
      image: image || "",
      price: price || 0,
      pricingType: pricingType || "per_person",
      capacity: capacity || 20,
      timeSlots: timeSlots || [
        "08:00 AM - 10:00 AM",
        "10:00 AM - 12:00 PM",
        "12:00 PM - 02:00 PM",
        "02:00 PM - 04:00 PM",
        "04:00 PM - 06:00 PM",
        "06:00 PM - 08:00 PM",
      ],
      isRoomAddon: Boolean(isRoomAddon),
      isSeparateBooking: isSeparateBooking !== undefined ? Boolean(isSeparateBooking) : true,
    });

    return res.status(201).json({
      success: true,
      message: "Facility created successfully.",
      facility: newFacility,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/facilities/:id
// @desc Update facility (Admin only)
router.put("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: "Facility not found." });
    }

    const fields = [
      "name",
      "description",
      "image",
      "price",
      "pricingType",
      "capacity",
      "timeSlots",
      "isRoomAddon",
      "isSeparateBooking",
      "isActive",
    ];

    fields.forEach((field) => {
      if (req.body[field] !== undefined) {
        facility[field] = req.body[field];
      }
    });

    await facility.save();

    return res.json({
      success: true,
      message: "Facility updated successfully.",
      facility,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/facilities/:id
// @desc Soft-delete / deactivate facility (Admin only)
router.delete("/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const facility = await Facility.findById(req.params.id);
    if (!facility) {
      return res.status(404).json({ success: false, message: "Facility not found." });
    }

    facility.isActive = false;
    await facility.save();

    return res.json({ success: true, message: "Facility deactivated successfully." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
