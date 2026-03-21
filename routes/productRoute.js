const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

const multer = require("multer");

// Multer config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

router.get("/test", (req, res) => {
  res.send("Product route working ✅");
});

// Routes
router.post(
  "/add",
  upload.fields([
    { name: "pic" },
    { name: "picHover" },
    { name: "colorImages", maxCount: 20 },
  ]),
  productController.addProduct,
);
router.get("/getall", productController.getAllProducts);
router.get("/popular", productController.getPopularProducts);
router.get("/popular/random", productController.getRandomPopularProducts);
router.get("/get/:id", productController.getProductById);
router.get("/getcat/:id", productController.getProductCatById);

router.put(
  "/update/:id",
  upload.fields([
    { name: "pic" },
    { name: "picHover" },
    { name: "colorImages", maxCount: 20 },
  ]),
  productController.updateProduct,
);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
