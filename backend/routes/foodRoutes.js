const express = require("express");
const FoodItem = require("../models/FoodItem");
const FoodOrder = require("../models/FoodOrder");
const { protect, authorizeRoles } = require("../middleware/auth");

const router = express.Router();

const generateOrderId = () => {
  return "ORD-" + Math.floor(100000 + Math.random() * 900000);
};

// @route GET /api/food/items
// @desc Get food menu items (public or customer)
router.get("/items", async (req, res) => {
  try {
    const { category, onlyAvailable } = req.query;
    const filter = {};

    if (category) filter.category = category;
    if (onlyAvailable === "true") filter.isAvailable = true;

    const items = await FoodItem.find(filter).sort({ category: 1, name: 1 });
    return res.json({ success: true, items });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/food/items
// @desc Add food item (Admin only)
router.post("/items", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const { name, category, price, description, image, isVeg, isAvailable } = req.body;

    const item = await FoodItem.create({
      name,
      category,
      price,
      description: description || "",
      image: image || "",
      isVeg: isVeg !== undefined ? Boolean(isVeg) : true,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    return res.status(201).json({ success: true, message: "Food item created.", item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/food/items/:id
// @desc Update food item (Admin only)
router.put("/items/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const item = await FoodItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Food item not found." });
    }

    const fields = ["name", "category", "price", "description", "image", "isVeg", "isAvailable"];
    fields.forEach((f) => {
      if (req.body[f] !== undefined) item[f] = req.body[f];
    });

    await item.save();
    return res.json({ success: true, message: "Food item updated.", item });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route DELETE /api/food/items/:id
// @desc Delete food item (Admin only)
router.delete("/items/:id", protect, authorizeRoles("admin"), async (req, res) => {
  try {
    const item = await FoodItem.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Food item not found." });
    }
    return res.json({ success: true, message: "Food item removed." });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route POST /api/food/orders
// @desc Place food order (Customer)
router.post("/orders", protect, async (req, res) => {
  try {
    const { roomNumber, items, paymentMethod, notes } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({ success: false, message: "Cart is empty. Please select food items." });
    }

    let totalAmount = 0;
    const orderItems = items.map((i) => {
      const itemTotal = Number(i.price) * Number(i.quantity);
      totalAmount += itemTotal;
      return {
        foodItemId: i.foodItemId || null,
        name: i.name,
        price: Number(i.price),
        quantity: Number(i.quantity) || 1,
      };
    });

    const orderId = generateOrderId();
    const paymentStatus = paymentMethod === "Cash on Delivery" ? "Pending" : "Paid";

    const order = await FoodOrder.create({
      orderId,
      userId: req.user._id,
      customerName: req.user.name,
      roomNumber: roomNumber || "Table / Takeaway",
      items: orderItems,
      totalAmount,
      paymentMethod: paymentMethod || "UPI",
      paymentStatus,
      orderStatus: "New",
      notes: notes || "",
    });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully! Kitchen has received your order.",
      order,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/food/orders/my
// @desc Get logged-in customer's orders
router.get("/orders/my", protect, async (req, res) => {
  try {
    const orders = await FoodOrder.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route GET /api/food/orders
// @desc Get live kitchen food orders (Kitchen, Staff, Admin)
router.get("/orders", protect, authorizeRoles("kitchen", "reception", "admin"), async (req, res) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.orderStatus = status;

    const orders = await FoodOrder.find(query).sort({ createdAt: -1 });
    return res.json({ success: true, orders });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

// @route PUT /api/food/orders/:id/status
// @desc Update food order status (Kitchen: New -> Preparing -> Ready -> Delivered)
router.put("/orders/:id/status", protect, authorizeRoles("kitchen", "reception", "admin"), async (req, res) => {
  try {
    const { orderStatus } = req.body;
    const order = await FoodOrder.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found." });
    }

    const validStatuses = ["New", "Preparing", "Ready", "Delivered"];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ success: false, message: "Invalid order status." });
    }

    order.orderStatus = orderStatus;
    if (orderStatus === "Delivered" && order.paymentMethod === "Cash on Delivery") {
      order.paymentStatus = "Paid";
    }

    await order.save();

    return res.json({ success: true, message: `Order marked as ${orderStatus}.`, order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
