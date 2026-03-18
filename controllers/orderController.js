const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");

// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
  try {
    const {
      userId,
      items,
      total,
      address,
      couponCode,
      discount,
      finalTotal,
      paymentMethod,
    } = req.body;

    const order = await Order.create({
      userId,
      items,
      total,
      discount: discount || 0,
      couponCode: couponCode || '',
      finalTotal: finalTotal || total,
      address,
      paymentMethod: paymentMethod || 'cod',
    });

    // mark coupon as used
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $addToSet: { usedBy: userId } }
      );
    }

    res.status(201).json({
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET USER ORDERS =================
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json({
      message: "User Orders",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET ALL ORDERS (ADMIN) =================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId")
      .sort({ createdAt: -1 });

    res.json({
      message: "All Orders",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
