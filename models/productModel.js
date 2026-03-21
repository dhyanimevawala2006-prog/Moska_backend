const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  pname: {
    type: String,
    required: true,
    index: true
  },
  pic1: {
    type: String,
    default: "no-image.jpg"
  },
  picHover: {
    type: String,
    default: "no-image.jpg"
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "categories",
    required: true,
    index: true
  },
  price: {
    type: Number,
    required: true
  },
  oldPrice: {
    type: Number,
    default: 0
  },
  colors: [{
    color: { type: String },
    image: { type: String, default: 'no-image.jpg' }
  }],
  sizes: [{
    type: String
  }],
  description: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  }
});

// Add compound index for better performance
productSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model("product", productSchema);