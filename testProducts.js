const mongoose = require('mongoose');
const Product = require('./models/productModel');

mongoose.connect('mongodb://localhost:27017/estore_db')
  .then(async () => {
    console.log('MongoDB connected');
    
    const products = await Product.find();
    console.log(`Total products in database: ${products.length}`);
    
    if (products.length > 0) {
      console.log('\nFirst product:');
      console.log(JSON.stringify(products[0], null, 2));
    } else {
      console.log('\n⚠️  No products found in database!');
      console.log('Please add products first.');
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.log('MongoDB connection error:', err);
    process.exit(1);
  });
