const express = require("express");
const router = express.Router();
const { register, login, adminLogin, getAllUsers, getUserById, deleteUser, sendOtp, verifyOtp, forgotPasswordOtp, resetPassword } = require("../controllers/userController");

router.post("/register", register);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.get("/alluser", getAllUsers);
router.get("/user/:id", getUserById);
router.delete("/deleteuser/:id", deleteUser);
router.post("/verify-otp", verifyOtp);
router.post("/send-otp", sendOtp);
router.post("/forgot-password-otp", forgotPasswordOtp);
router.post("/reset-password", resetPassword);

module.exports = router;
