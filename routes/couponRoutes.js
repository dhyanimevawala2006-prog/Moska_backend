const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getPopularCoupons,
  getAllCoupons,
  applyCoupon,
  updateCoupon,
  deleteCoupon
} = require("../controllers/couponController");

router.post("/create", createCoupon);
router.get("/popular", getPopularCoupons);
router.get("/", getAllCoupons);
router.post("/apply", applyCoupon);


router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);


module.exports = router;
