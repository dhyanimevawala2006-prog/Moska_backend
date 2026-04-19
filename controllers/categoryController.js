const Category = require("../models/categoryModel");

// Add Category
exports.addCategory = async (req, res) => {
  try {
    const { cat_name, image } = req.body;

    if (!cat_name) {
      return res.status(400).json({ message: "Category name is required" });
    }
    if (!image) {
      return res.status(400).json({ message: "Image URL is required" });
    }

    const category = new Category({ cat_name, cat_pic: image });
    await category.save();

    console.log('✅ Category saved:', category._id, '| image:', image);
    res.status(201).json({ message: "Category added successfully", data: category });
  } catch (error) {
    console.error('❌ Add Category Error:', error);
    res.status(500).json({ error: error.message });
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

// Get Single Category
exports.getCategoriesById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }
    res.status(200).json({ message: "Single Category", data: category });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Category
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { cat_name, image } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    const updateData = { cat_name };
    if (image) updateData.cat_pic = image;   // new Cloudinary URL

    const updated = await Category.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );

    console.log('✅ Category updated:', updated._id);
    res.json({ message: "Category updated successfully", data: updated });
  } catch (error) {
    console.error('❌ Update Category Error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete Category
exports.deleteCategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
