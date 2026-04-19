const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/test", (req, res) => {
  res.send("Product route working ✅");
});

// All routes now accept JSON body with base64 images — no multer needed
router.post("/add", productController.addProduct);
router.get("/getall", productController.getAllProducts);
router.get("/popular", productController.getPopularProducts);
router.get("/popular/random", productController.getRandomPopularProducts);
router.get("/get/:id", productController.getProductById);
router.get("/getcat/:id", productController.getProductCatById);
router.put("/update/:id", productController.updateProduct);
router.delete("/delete/:id", productController.deleteProduct);

module.exports = router;
