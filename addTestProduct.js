const mongoose = require('mongoose');
const Product = require('./models/productModel');
const Category = require('./models/categoryModel');

mongoose.connect('mongodb://localhost:27017/estore_db')
  .then(async () => {
    console.log('✅ MongoDB connected');
    
    // Check existing products
    const existingProducts = await Product.find();
    console.log(`📦 Existing products: ${existingProducts.length}`);
    
    // Check categories
    let category = await Category.findOne({ cat_name: 'Clothes' });
    
    if (!category) {
      console.log('Creating Clothes category...');
      category = await Category.create({
        cat_name: 'Clothes',
        cat_pic: 'no-image.jpg'
      });
    }
    
    console.log(`📁 Category: ${category.cat_name} (${category._id})`);
    
    // Add test product
    const testProduct = {
      pname: 'Test T-Shirt',
      category: category._id,
      price: 499,
      oldPrice: 699,
      description: 'This is a test product',
      stock: 10,
      pic1: 'no-image.jpg',
      picHover: 'no-image.jpg',
      colors: ['red', 'blue', 'green']
    };
    
    const product = await Product.create(testProduct);
    console.log('✅ Test product created:', product.pname);
    console.log('🆔 Product ID:', product._id);
    
    // Verify
    const allProducts = await Product.find().populate('category');
    console.log(`\n📊 Total products now: ${allProducts.length}`);
    
    allProducts.forEach((p, i) => {
      console.log(`${i + 1}. ${p.pname} - ₹${p.price} (${p.category?.cat_name || 'No category'})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ Error:', err);
    process.exit(1);
  });
