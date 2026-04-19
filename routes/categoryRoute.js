const express = require("express");
const router  = express.Router();
const categoryController = require("../controllers/categoryController");

// All routes accept plain JSON — image field contains a Cloudinary URL
router.post("/add",          categoryController.addCategory);
router.get("/all",           categoryController.getCategories);
router.get("/get/:id",       categoryController.getCategoriesById);
router.put("/update/:id",    categoryController.updateCategory);
router.delete("/delete/:id", categoryController.deleteCategory);

module.exports = router;
