const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },

  items: [
    {
      productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
      },
      quantity: {
        type: Number,
        default: 1,
      },
      color: {
        type: String,
        default: '',
      },
      size: {
        type: String,
        default: '',
      },
    },
  ],

  total: {
    type: Number,
    required: true,
  },

  discount: {
    type: Number,
    default: 0,
  },

  couponCode: {
    type: String,
    default: '',
  },

  finalTotal: {
    type: Number,
    default: 0,
  },

  address: {
    name: String,
    phone: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
  },

  paymentMethod: {
    type: String,
    enum: ['cod', 'online'],
    default: 'cod',
  },

  status: {
    type: String,
    default: "Pending",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("orders", orderSchema);
