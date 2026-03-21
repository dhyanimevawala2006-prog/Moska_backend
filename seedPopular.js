/**
 * Run this once to fix the DB:
 *   node seedPopular.js
 *
 * What it does:
 *  1. Sets popular: false on all products that don't have the field
 *  2. Marks the first 5 products as popular: true (if none are popular yet)
 */
const mongoose = require('mongoose');
const Product = require('./models/productModel');

mongoose.connect('mongodb://localhost:27017/estore_db').then(async () => {
  console.log('✅ Connected to MongoDB');

  // Step 1: Set popular: false on all docs missing the field
  const fixed = await Product.updateMany(
    { popular: { $exists: false } },
    { $set: { popular: false } }
  );
  console.log(`✅ Fixed ${fixed.modifiedCount} products (set popular: false)`);

  // Step 2: Check how many are already popular
  const popularCount = await Product.countDocuments({ popular: true });
  console.log(`ℹ️  Currently ${popularCount} products have popular: true`);

  if (popularCount === 0) {
    // Mark first 5 as popular
    const products = await Product.find().limit(5);
    const ids = products.map(p => p._id);
    await Product.updateMany({ _id: { $in: ids } }, { $set: { popular: true } });
    console.log(`✅ Marked ${products.length} products as popular:`);
    products.forEach(p => console.log(`   ⭐ ${p.pname}`));
  } else {
    console.log('✅ Popular products already exist — no changes needed.');
  }

  process.exit(0);
}).catch(err => {
  console.error('❌ DB Error:', err.message);
  process.exit(1);
});
