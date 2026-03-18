const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const couponRoutes = require("./routes/couponRoutes");


const app = express();

// CORS
app.use(
  cors({
    origin: "http://localhost:4200",
    credentials: true,
  }),
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use("/api", require("./routes/userRoute"));
app.use("/api/categories", require("./routes/categoryRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/cart", require("./routes/cartRoute"));
app.use("/api/order", require("./routes/oderRoutes"));
app.use("/api/ratings", require("./routes/ratingRoute"));
app.use("/api/coupons", require("./routes/couponRoutes"));
app.use("/api/wishlist", require("./routes/wishlistRoute"));
app.use("/api/contact", require("./routes/contactRoute"));
app.use("/api/admin/stats", require("./routes/adminStatsRoute"));
app.use("/api/admin/notifications", require("./routes/notificationRoute"));

// Coupon routes

// Health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Server is running",
    timestamp: new Date(),
  });
});

// MongoDB
mongoose
  .connect("mongodb://localhost:27017/estore_db", {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  })
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });

// Server
const port = 3000;
app.listen(port, () =>
  console.log(`🚀 Server running on http://localhost:${port}`),
);
