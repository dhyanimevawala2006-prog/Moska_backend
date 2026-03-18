const User = require("../models/userModel");
const axios = require("axios");

const OTP_AUTH_TOKEN = "eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJDLUJERThCNDgxQTE5OTQ1MSIsImlhdCI6MTc3MzY0ODk4MCwiZXhwIjoxOTMxMzI4OTgwfQ.YqnqcBz0dW3kmUfeXRV-UEtIdyq1zKs9Jt_71ADJenAsLq2mPJo-s_1COC1ArGEf3elku6px-foeXRtmJW3yjw";
const OTP_CUSTOMER_ID = "C-BDE8B481A199451";

// POST /api/send-otp
const sendOtp = async (req, res) => {
  try {
    const { email, mobileno } = req.body;

    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "Email already registered" });

    const mobileExists = await User.findOne({ mobileno });
    if (mobileExists) return res.status(400).json({ message: "Mobile number already registered" });

    const response = await axios.post(
      `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${OTP_CUSTOMER_ID}&flowType=SMS&mobileNumber=${mobileno}`,
      {},
      { headers: { authToken: OTP_AUTH_TOKEN } }
    );

    res.status(200).json({
      message: "OTP sent successfully",
      verificationId: response.data?.data?.verificationId,
    });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
};

// POST /api/verify-otp
const verifyOtp = async (req, res) => {
  try {
    const { verificationId, otp, userData } = req.body;

    const response = await axios.get(
      `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${userData.mobileno}&verificationId=${verificationId}&customerId=${OTP_CUSTOMER_ID}&code=${otp}`,
      { headers: { authToken: OTP_AUTH_TOKEN } }
    );

    if (response.data?.responseCode === 200 || response.data?.data?.verificationStatus === "VERIFICATION_COMPLETED") {
      const existing = await User.findOne({ email: userData.email });
      if (existing) return res.status(400).json({ message: "Email already registered" });

      const newUser = await User.create(userData);
      return res.status(200).json({ message: "Registration successful", data: newUser });
    } else {
      return res.status(400).json({ message: "Invalid OTP" });
    }
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
};

// POST /api/register
const register = async (req, res) => {
  try {
    const { username, email, password, mobileno } = req.body;
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ username, email, password, mobileno });
    res.status(201).json({ message: "Registration successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email not registered" });

    if (user.password !== password) return res.status(401).json({ message: "Incorrect password" });

    res.status(200).json({
      message: "Login successful",
      user: { id: user._id, name: user.username, email: user.email }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/admin-login
const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Hardcoded master admin credentials
    const ADMIN_EMAIL    = "admin@gmail.com";
    const ADMIN_PASSWORD = "111222";

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      return res.status(200).json({
        message: "Admin login successful",
        user: { id: "master-admin", name: "Admin", email: ADMIN_EMAIL, isAdmin: true }
      });
    }

    // Fallback: DB user with isAdmin flag
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid credentials" });
    if (user.password !== password) return res.status(401).json({ message: "Invalid credentials" });
    if (!user.isAdmin) return res.status(403).json({ message: "Access denied. Not an admin." });

    res.status(200).json({
      message: "Admin login successful",
      user: { id: user._id, name: user.username, email: user.email, isAdmin: true }
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/alluser
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, "-password");
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// GET /api/user/:id
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// DELETE /api/deleteuser/:id
const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// POST /api/forgot-password-otp  — send OTP to registered mobile
const forgotPasswordOtp = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not registered" });

    const response = await axios.post(
      `https://cpaas.messagecentral.com/verification/v3/send?countryCode=91&customerId=${OTP_CUSTOMER_ID}&flowType=SMS&mobileNumber=${user.mobileno}`,
      {},
      { headers: { authToken: OTP_AUTH_TOKEN } }
    );

    res.status(200).json({
      message: "OTP sent to registered mobile",
      verificationId: response.data?.data?.verificationId,
      mobileno: user.mobileno,
    });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
};

// POST /api/reset-password  — verify OTP then update password
const resetPassword = async (req, res) => {
  try {
    const { email, verificationId, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const response = await axios.get(
      `https://cpaas.messagecentral.com/verification/v3/validateOtp?countryCode=91&mobileNumber=${user.mobileno}&verificationId=${verificationId}&customerId=${OTP_CUSTOMER_ID}&code=${otp}`,
      { headers: { authToken: OTP_AUTH_TOKEN } }
    );

    const status = response.data?.data?.verificationStatus;
    if (response.data?.responseCode !== 200 && status !== "VERIFICATION_COMPLETED") {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    user.password = newPassword;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: err.response?.data?.message || err.message });
  }
};

module.exports = { register, login, adminLogin, getAllUsers, getUserById, deleteUser, verifyOtp, sendOtp, forgotPasswordOtp, resetPassword };
