const Product  = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

// Add Product — receives Cloudinary URLs directly from frontend
exports.addProduct = async (req, res) => {
  try {
    const { pname, category, price, description, stock, oldPrice, popular } = req.body;

    // Images are already Cloudinary URLs sent from the frontend
    const mainImage  = req.body.pic      || 'no-image.jpg';
    const hoverImage = req.body.picHover || 'no-image.jpg';

    // Resolve category
    let categoryId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      const categoryDoc = await Category.findOne({ cat_name: category });
      if (categoryDoc) {
        categoryId = categoryDoc._id;
      } else {
        const newCat = await Category.create({ cat_name: category, cat_pic: 'no-image.jpg' });
        categoryId = newCat._id;
      }
    }

    const productData = {
      pname,
      category: categoryId,
      price,
      description,
      stock:   stock || 0,
      pic1:    mainImage,
      picHover: hoverImage,
      popular: popular !== undefined ? (popular === true || popular === 'true') : false
    };

    if (oldPrice) productData.oldPrice = oldPrice;

    // Colors — hex values + Cloudinary URLs already resolved by frontend
    const colorsRaw      = req.body['colors[]']      || req.body.colors;
    const colorImagesRaw = req.body['colorImages[]']  || req.body.colorImages;

    if (colorsRaw) {
      const colorArr      = Array.isArray(colorsRaw)      ? colorsRaw      : [colorsRaw];
      const colorImageArr = colorImagesRaw
        ? (Array.isArray(colorImagesRaw) ? colorImagesRaw : [colorImagesRaw])
        : [];

      productData.colors = colorArr.map((hex, i) => ({
        color: hex,
        image: colorImageArr[i] || 'no-image.jpg'
      }));
    }

    const sizesRaw = req.body.sizes || req.body['sizes[]'];
    if (sizesRaw) productData.sizes = Array.isArray(sizesRaw) ? sizesRaw : [sizesRaw];

    const product = await Product.create(productData);
    console.log('✅ Product saved:', product._id);
    res.status(201).json({ success: true, message: 'Product added successfully', data: product });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find().populate('category').maxTimeMS(5000).exec();
    res.json({ success: true, data: products });
  } catch (err) {
    console.error('Error in getAllProducts:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Product By ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('category');
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getProductCatById = async (req, res) => {
  try {
    const products = await Product.find({ category: req.params.id }).populate('category');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Product — receives Cloudinary URLs directly from frontend
exports.updateProduct = async (req, res) => {
  try {
    const { pname, category, price, description, stock, oldPrice, popular } = req.body;

    const updates = {};
    if (pname       !== undefined) updates.pname       = pname;
    if (price       !== undefined) updates.price       = price;
    if (description !== undefined) updates.description = description;
    if (stock       !== undefined) updates.stock       = stock || 0;
    if (popular     !== undefined) updates.popular     = popular === true || popular === 'true';
    if (oldPrice)                  updates.oldPrice    = oldPrice;

    // Resolve category
    if (category) {
      let categoryId = category;
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const categoryDoc = await Category.findOne({ cat_name: category });
        if (categoryDoc) {
          categoryId = categoryDoc._id;
        } else {
          const newCat = await Category.create({ cat_name: category, cat_pic: 'no-image.jpg' });
          categoryId = newCat._id;
        }
      }
      updates.category = categoryId;
    }

    // Images are Cloudinary URLs — store directly
    if (req.body.pic)      updates.pic1     = req.body.pic;
    if (req.body.picHover) updates.picHover = req.body.picHover;

    // Colors
    const colorsRaw      = req.body['colors[]']     || req.body.colors;
    const colorImagesRaw = req.body['colorImages[]'] || req.body.colorImages;

    if (colorsRaw) {
      const colorArr      = Array.isArray(colorsRaw)      ? colorsRaw      : [colorsRaw];
      const colorImageArr = colorImagesRaw
        ? (Array.isArray(colorImagesRaw) ? colorImagesRaw : [colorImagesRaw])
        : [];

      updates.colors = colorArr.map((hex, i) => ({
        color: hex,
        image: colorImageArr[i] || 'no-image.jpg'
      }));
    }

    const sizesRaw = req.body.sizes || req.body['sizes[]'];
    if (sizesRaw) updates.sizes = Array.isArray(sizesRaw) ? sizesRaw : [sizesRaw];

    const updated = await Product.findByIdAndUpdate(req.params.id, updates, { new: true }).populate('category');
    console.log('✅ Product updated:', updated._id);
    res.json({ success: true, message: 'Product updated successfully', data: updated });
  } catch (err) {
    console.error('Error updating product:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Delete Product
exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get Popular Products
exports.getPopularProducts = async (req, res) => {
  try {
    const products = await Product.find({ popular: true }).populate('category');
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get 5 Random Popular Products
exports.getRandomPopularProducts = async (req, res) => {
  try {
    const products = await Product.aggregate([
      { $match: { popular: true } },
      { $sample: { size: 5 } }
    ]);
    const populated = await Product.populate(products, { path: 'category' });
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
