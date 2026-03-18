const mongoose = require('mongoose');
const Category = require('./models/categoryModel');

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/estore_db')
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Categories to add
const categories = [
  { cat_name: 'Clothes', cat_pic: 'no-image.jpg' },
  { cat_name: 'Beauty', cat_pic: 'no-image.jpg' },
  { cat_name: 'Medicine', cat_pic: 'no-image.jpg' },
  { cat_name: 'Electronic Item', cat_pic: 'no-image.jpg' },
  { cat_name: 'Toy', cat_pic: 'no-image.jpg' },
  { cat_name: 'Jewellery', cat_pic: 'no-image.jpg' }
];

async function seedCategories() {
  try {
    // Check if categories already exist
    const existingCategories = await Category.find({});
    
    if (existingCategories.length > 0) {
      console.log('\n📦 Existing categories in database:');
      existingCategories.forEach(cat => {
        console.log(`   - ${cat.cat_name} (ID: ${cat._id})`);
      });
      console.log('\n');
    }

    // Add new categories
    let addedCount = 0;
    let existingCount = 0;

    for (const cat of categories) {
      const exists = await Category.findOne({ cat_name: cat.cat_name });
      
      if (!exists) {
        const newCategory = await Category.create(cat);
        console.log(`✅ Added: ${newCategory.cat_name} (ID: ${newCategory._id})`);
        addedCount++;
      } else {
        console.log(`⏭️  Already exists: ${cat.cat_name} (ID: ${exists._id})`);
        existingCount++;
      }
    }

    console.log('\n' + '='.repeat(50));
    console.log(`✅ Seeding completed!`);
    console.log(`   New categories added: ${addedCount}`);
    console.log(`   Already existing: ${existingCount}`);
    console.log('='.repeat(50) + '\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  }
}

seedCategories();
