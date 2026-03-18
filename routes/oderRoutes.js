const express = require("express");
const router = express.Router();

const orderController = require("../controllers/orderController");


// CREATE ORDER
router.post("/create",orderController.createOrder);

// GET USER ORDERS
router.get("/user/:userId",orderController.getUserOrders);

// GET ALL ORDERS (ADMIN)
router.get("/all",orderController.getAllOrders);

// UPDATE STATUS
router.put("/status/:id",orderController.updateOrderStatus);


module.exports = router;