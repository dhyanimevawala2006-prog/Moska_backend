const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const mongoose = require('mongoose');

// Add Product
exports.addProduct = async (req, res) => {
  try {
    const { pname, category, price, description, stock, oldPrice, colors, popular } = req.body;
    const mainImage = req.files['pic'] ? req.files['pic'][0].filename : 'no-image.jpg';
    const hoverImage = req.files['picHover'] ? req.files['picHover'][0].filename : 'no-image.jpg';

    // Find category by name or ID
    let categoryId = category;
    if (!mongoose.Types.ObjectId.isValid(category)) {
      // If not a valid ObjectId, search by name
      const categoryDoc = await Category.findOne({ cat_name: category });
      if (categoryDoc) {
        categoryId = categoryDoc._id;
      } else {
        // Create new category if not found
        const newCategory = await Category.create({ 
          cat_name: category, 
          cat_pic: 'no-image.jpg' 
        });
        categoryId = newCategory._id;
      }
    }

    const productData = {
      pname,
      category: categoryId,
      price,
      description,
      stock: stock || 0,
      pic1: mainImage,
      picHover: hoverImage,
      popular: popular !== undefined ? (popular === true || popular === 'true') : false
    };

    if (oldPrice) productData.oldPrice = oldPrice;

    // Handle colors with per-color images
    const colorsRaw = req.body['colors[]'] || colors;
    if (colorsRaw) {
      const colorArr = Array.isArray(colorsRaw) ? colorsRaw : [colorsRaw];
      const colorImages = req.files['colorImages'] || [];
      productData.colors = colorArr.map((hex, i) => ({
        color: hex,
        image: colorImages[i] ? colorImages[i].filename : 'no-image.jpg'
      }));
    }

    const sizesRaw = req.body.sizes || req.body['sizes[]'];
    if (sizesRaw) productData.sizes = Array.isArray(sizesRaw) ? sizesRaw : [sizesRaw];

    const product = await Product.create(productData);

    res.status(201).json({ success: true, message: 'Product added successfully', data: product });
  } catch (err) {
    console.error('Error adding product:', err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// Get All Products
exports.getAllProducts = async (req, res) => {
  try {
    console.time('getAllProducts');
    
    const products = await Product.find()
      .populate('category')
      .maxTimeMS(5000) // 5 second timeout
      .exec();
    
    console.timeEnd('getAllProducts');
    console.log(`Found ${products.length} products`);
    
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
    const product = await Product.find({ category: req.params.id })
      .populate('category');

    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Update Product
exports.updateProduct = async (req, res) => {
  try {
    console.log('Update request body:', req.body);
    console.log('Update request files:', req.files);
    
    const { pname, category, price, description, stock, oldPrice, colors, popular } = req.body;
    
    const updates = {};
    if (pname !== undefined) updates.pname = pname;
    if (price !== undefined) updates.price = price;
    if (description !== undefined) updates.description = description;
    if (stock !== undefined) updates.stock = stock || 0;
    if (popular !== undefined) updates.popular = popular === true || popular === 'true';

    // Handle category (same as add product)
    if (category) {
      let categoryId = category;
      if (!mongoose.Types.ObjectId.isValid(category)) {
        const categoryDoc = await Category.findOne({ cat_name: category });
        if (categoryDoc) {
          categoryId = categoryDoc._id;
        } else {
          const newCategory = await Category.create({ 
            cat_name: category, 
            cat_pic: 'no-image.jpg' 
          });
          categoryId = newCategory._id;
        }
      }
      updates.category = categoryId;
    }

    // Handle images
    if (req.files && req.files['pic']) {
      updates.pic1 = req.files['pic'][0].filename;
    }
    if (req.files && req.files['picHover']) {
      updates.picHover = req.files['picHover'][0].filename;
    }

    // Handle optional fields
    if (oldPrice) updates.oldPrice = oldPrice;

    // Handle colors with per-color images
    const colorsRaw = req.body['colors[]'] || colors;
    if (colorsRaw) {
      const colorArr = Array.isArray(colorsRaw) ? colorsRaw : [colorsRaw];
      const colorImages = req.files['colorImages'] || [];
      updates.colors = colorArr.map((hex, i) => ({
        color: hex,
        image: colorImages[i] ? colorImages[i].filename : 'no-image.jpg'
      }));
    }

    const sizesRaw = req.body.sizes || req.body['sizes[]'];
    if (sizesRaw) updates.sizes = Array.isArray(sizesRaw) ? sizesRaw : [sizesRaw];

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id, 
      updates, 
      { new: true }
    ).populate('category');
    
    console.log('Product updated successfully');
    res.json({ success: true, message: 'Product updated successfully', data: updatedProduct });
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
      { $match: { popular: true } },  // only strictly true
      { $sample: { size: 5 } }
    ]);

    const populated = await Product.populate(products, { path: 'category' });
    res.json({ success: true, data: populated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};