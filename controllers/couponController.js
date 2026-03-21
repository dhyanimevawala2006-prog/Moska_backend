const Coupon = require("../models/couponModel");

// CREATE COUPON
const createCoupon = async (req, res) => {
  try {
    const coupon = new Coupon(req.body);
    await coupon.save();
    res.status(201).json({ success: true, message: "Coupon created successfully", data: coupon });
  } catch (error) {
    console.error("Create coupon error:", error.message);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: "Coupon code already exists" });
    }
    if (error.name === "ValidationError") {
      const fields = Object.keys(error.errors).join(", ");
      return res.status(400).json({ success: false, message: `Validation failed: ${fields}` });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET POPULAR COUPONS (home page)
const getPopularCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true, popular: true })
      .sort({ createdAt: -1 })
      .limit(6);
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL ACTIVE COUPONS (cart page — popular + non-popular)
const getActiveCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({ isActive: true }).sort({ popular: -1, createdAt: -1 });
    res.json(coupons);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET ALL COUPONS (admin)
const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    res.json({ success: true, data: coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// APPLY COUPON
const applyCoupon = async (req, res) => {
  try {
    const { code, cartTotal } = req.body;

    const coupon = await Coupon.findOne({
      code: { $regex: new RegExp("^" + code.trim() + "$", "i") },
    });

    if (!coupon) return res.status(400).json({ message: "Invalid coupon code" });
    if (!coupon.isActive) return res.status(400).json({ message: "Coupon is inactive" });
    if (new Date() > new Date(coupon.expireDate)) return res.status(400).json({ message: "Coupon expired" });
    if (cartTotal < coupon.minOrderAmount) {
      return res.status(400).json({ message: `Minimum order ₹${coupon.minOrderAmount} required` });
    }

    let discount = 0;
    if (coupon.discountType === "percentage") {
      discount = (cartTotal * coupon.discountValue) / 100;
      if (coupon.maxDiscount) discount = Math.min(discount, coupon.maxDiscount);
    } else {
      discount = coupon.discountValue;
    }

    res.json({ discount, finalAmount: cartTotal - discount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE COUPON
const updateCoupon = async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, message: "Coupon updated", data: coupon });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE COUPON
const deleteCoupon = async (req, res) => {
  try {
    await Coupon.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Coupon deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCoupon,
  getPopularCoupons,
  getActiveCoupons,
  getAllCoupons,
  updateCoupon,
  applyCoupon,
  deleteCoupon,
};
