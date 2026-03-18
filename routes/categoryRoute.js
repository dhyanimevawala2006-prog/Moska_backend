const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");
const upload = require("../middleware/upload");

router.post(
  "/add",
  upload.single("cat_pic"),
  categoryController.addCategory
);

router.get("/all", categoryController.getCategories);
router.get("/get/:id", categoryController.getCategoriesById);

router.delete("/delete/:id", categoryController.deleteCategory);
router.put('/update/:id', upload.single('cat_pic'), categoryController.updateCategory);

module.exports = router;

