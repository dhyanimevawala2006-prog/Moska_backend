const express = require("express");
const router = express.Router();

const {
  createCoupon,
  getPopularCoupons,
  getActiveCoupons,
  getAllCoupons,
  applyCoupon,
  updateCoupon,
  deleteCoupon
} = require("../controllers/couponController");

router.post("/create", createCoupon);
router.get("/popular", getPopularCoupons);
router.get("/active", getActiveCoupons);
router.get("/", getAllCoupons);
router.post("/apply", applyCoupon);


router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);


module.exports = router;
