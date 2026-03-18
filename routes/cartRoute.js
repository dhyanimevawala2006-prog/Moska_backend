const express = require("express");
const router = express.Router();
const cartController = require("../controllers/cartCantroller");

// ADD TO CART
router.post("/add", cartController.addToCart);

// GET USER CART
router.get("/:userId", cartController.getCart);

// INCREASE PRODUCT QUANTITY
router.put("/increase", cartController.increaseQty);

// DECREASE PRODUCT QUANTITY
router.put("/decrease", cartController.decreaseQty);

// REMOVE SINGLE ITEM
router.delete("/remove", cartController.removeItem);

// CLEAR FULL CART
router.delete("/clear", cartController.clearCart);

module.exports = router;
