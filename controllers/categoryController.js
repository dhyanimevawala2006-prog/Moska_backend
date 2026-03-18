const Category = require("../models/categoryModel");

// Add Category with Image
exports.addCategory = async (req, res) => {
  try {
    console.log('📝 Add Category Request:');
    console.log('Body:', req.body);
    console.log('File:', req.file);

    if (!req.file) {
      return res.status(400).json({ message: "Image is required" });
    }

    if (!req.body.cat_name) {
      return res.status(400).json({ message: "Category name is required" });
    }

    const category = new Category({
      cat_name: req.body.cat_name,
      cat_pic: req.file.filename
    });

    await category.save();

    console.log('✅ Category saved:', category);

    res.status(201).json({
      message: "Category added successfully",
      data: category
    });
  } catch (error) {
    console.error('❌ Add Category Error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.toString()
    });
  }
};

// Get All Categories
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const fs = require('fs');
const path = require('path');

exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cat_name } = req.body;

    // 1. Find the existing category first
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    // 2. Prepare update data
    let updateData = { cat_name };

    // 3. Check if a new file is uploaded
    if (req.file) {
      // Delete the old image file from the uploads folder
      const oldPath = path.join(__dirname, '../uploads/', category.cat_pic);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      
      // Update with the new filename
      updateData.cat_pic = req.file.filename;
    }

    // 4. Update the database
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true } // returns the modified document
    );

    res.json({
      message: "Category updated successfully",
      data: updatedCategory
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCategoriesById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.status(200).json({
      message: "Single Category",
      data: category   // 🔥 must be inside data
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Category (Optional: delete image file also)
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
