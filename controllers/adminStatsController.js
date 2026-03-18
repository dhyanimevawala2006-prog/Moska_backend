const Product = require("../models/productModel");
const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");

exports.getStats = async (req, res) => {
  try {
    const [products, categories, allOrders, users] = await Promise.all([
      Product.find({}, "stock"),
      Category.countDocuments(),
      Order.find({}, "status"),
      User.countDocuments(),
    ]);

    const totalStock = products.reduce((sum, p) => sum + (p.stock || 0), 0);
    const pendingOrders = allOrders.filter(o => o.status === "pending").length;

    res.json({
      success: true,
      data: {
        totalStock,
        totalProducts: products.length,
        totalCategories: categories,
        pendingOrders,
        totalOrders: allOrders.length,
        totalUsers: users,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

exports.getDashboard = async (req, res) => {
  try {
    const [products, allOrders, users, categories] = await Promise.all([
      Product.find({}, "pname pic1 category price stock").populate("category", "cat_name").sort({ createdAt: -1 }).limit(5),
      Order.find()
        .populate("userId", "username email")
        .populate("items.productId", "pname pic1 price")
        .sort({ createdAt: -1 })
        .limit(8),
      User.countDocuments(),
      Category.countDocuments(),
    ]);

    const totalRevenue = allOrders.reduce((sum, o) => sum + (o.finalTotal || o.total || 0), 0);
    const pendingOrders = allOrders.filter(o => o.status?.toLowerCase() === "pending").length;

    // Last 7 days revenue chart data
    const days = 7;
    const revenueChart = [];

    // Fetch all orders once instead of 7 separate queries
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - (days - 1));
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const allRecentOrders = await Order.find({
      createdAt: { $gte: sevenDaysAgo }
    });

    console.log('Total recent orders found:', allRecentOrders.length);
    allRecentOrders.forEach(o => console.log('Order date:', o.createdAt, 'total:', o.finalTotal || o.total));

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);

      const dayOrders = allRecentOrders.filter(o => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= date && orderDate < nextDate;
      });

      const dayRevenue = dayOrders.reduce((sum, o) => sum + (o.finalTotal || o.total || 0), 0);
      revenueChart.push({
        label: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        revenue: dayRevenue,
        orders: dayOrders.length,
      });
    }

    res.json({
      success: true,
      data: {
        stats: {
          totalRevenue,
          totalOrders: await Order.countDocuments(),
          totalUsers: users,
          totalProducts: await Product.countDocuments(),
          pendingOrders,
          totalCategories: categories,
        },
        recentOrders: allOrders,
        topProducts: products,
        revenueChart,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
