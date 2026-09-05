const express = require("express");
const Room = require("../models/Room");
const Booking = require("../models/Booking");
const Facility = require("../models/Facility");
const FacilityBooking = require("../models/FacilityBooking");
const FoodOrder = require("../models/FoodOrder");
const User = require("../models/User");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

// @route GET /api/admin/stats
// @desc Get overview statistics for Admin Dashboard
router.get("/stats", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const totalRooms = await Room.countDocuments();
    const availableRooms = await Room.countDocuments({ status: "Available", cleaningStatus: "Clean" });
    const occupiedRooms = await Room.countDocuments({ status: "Occupied" });
    const maintenanceRooms = await Room.countDocuments({
      $or: [{ status: "Maintenance" }, { cleaningStatus: "Needs Cleaning" }],
    });

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const todayBookingsCount = await Booking.countDocuments({
      createdAt: { $gte: startOfToday },
    });

    const totalFacilityBookings = await FacilityBooking.countDocuments();
    const totalFoodOrders = await FoodOrder.countDocuments();

    // Total Revenue calculation
    const paidRoomBookings = await Booking.find({ paymentStatus: "Paid" }).select("totalAmount");
    const roomRevenue = paidRoomBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const paidFacilityBookings = await FacilityBooking.find({ paymentStatus: "Paid" }).select("totalAmount");
    const facilityRevenue = paidFacilityBookings.reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    const paidFoodOrders = await FoodOrder.find({ paymentStatus: "Paid" }).select("totalAmount");
    const foodRevenue = paidFoodOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);

    const totalRevenue = roomRevenue + facilityRevenue + foodRevenue;

    const recentBookings = await Booking.find().sort({ createdAt: -1 }).limit(5);

    return res.json({
      success: true,
      stats: {
        totalRooms,
        availableRooms,
        occupiedRooms,
        maintenanceRooms,
        todayBookingsCount,
        totalFacilityBookings,
        totalFoodOrders,
        roomRevenue,
        facilityRevenue,
        foodRevenue,
        totalRevenue,
      },
      recentBookings,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/admin/staff
// @desc Get all staff accounts
router.get("/staff", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const staff = await User.find({
      role: { $in: ["reception", "housekeeping", "kitchen"] },
    })
      .select("-password")
      .sort({ createdAt: -1 });

    return res.json({ success: true, staff });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/admin/staff
// @desc Create a new staff account (Admin only)
router.post("/staff", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ success: false, message: "Name, email, password, and role are required." });
    }

    const validRoles = ["reception", "housekeeping", "kitchen"];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ success: false, message: "Invalid staff role. Choose reception, housekeeping, or kitchen." });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "An account with this email already exists." });
    }

    const staffMember = await User.create({
      name,
      email: email.toLowerCase(),
      phone: phone || "",
      password,
      role,
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      message: `Staff account for ${name} (${role}) created successfully.`,
      staff: {
        id: staffMember._id,
        name: staffMember.name,
        email: staffMember.email,
        phone: staffMember.phone,
        role: staffMember.role,
        isActive: staffMember.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/admin/staff/:id
// @desc Update or toggle status of a staff account
router.put("/staff/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "Staff account not found." });
    }

    const { name, phone, role, isActive, password } = req.body;

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (role && ["reception", "housekeeping", "kitchen"].includes(role)) user.role = role;
    if (isActive !== undefined) user.isActive = Boolean(isActive);
    if (password) user.password = password;

    await user.save();

    return res.json({
      success: true,
      message: "Staff member updated successfully.",
      staff: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        isActive: user.isActive,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/admin/customers
// @desc Get customer list and their booking histories
router.get("/customers", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const customers = await User.find({ role: "customer" })
      .select("-password")
      .sort({ createdAt: -1 });

    // Enrich each customer with their booking count
    const enrichedCustomers = await Promise.all(
      customers.map(async (c) => {
        const bookingsCount = await Booking.countDocuments({ userId: c._id });
        const facilityBookingsCount = await FacilityBooking.countDocuments({ userId: c._id });
        const foodOrdersCount = await FoodOrder.countDocuments({ userId: c._id });
        return {
          ...c.toObject(),
          bookingsCount,
          facilityBookingsCount,
          foodOrdersCount,
        };
      })
    );

    return res.json({ success: true, customers: enrichedCustomers });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
