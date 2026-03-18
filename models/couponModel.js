const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true
  },

  title: {
    type: String,
    required: true
  },

  description: {
    type: String
  },

  discountType: {
    type: String,
    enum: ["flat", "percentage"],
    required: true
  },

  discountValue: {
    type: Number,
    required: true
  },

  minOrderAmount: {
    type: Number,
    default: 0
  },

  maxDiscount: {
    type: Number,
    default: 0
  },

  expireDate: {
    type: Date,
    required: true
  },

  isActive: {
    type: Boolean,
    default: true
  },

  popular: {
    type: Boolean,
    default: false
  }

}, { timestamps: true });

module.exports = mongoose.model("Coupon", couponSchema);