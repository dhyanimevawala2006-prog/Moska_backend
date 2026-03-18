const Order   = require("../models/orderModel");
const User    = require("../models/userModel");
const Contact = require("../models/contactModel");

// GET /api/admin/notifications
exports.getNotifications = async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // last 7 days

    const [newOrders, newUsers, newMessages] = await Promise.all([
      Order.find({ createdAt: { $gte: since } })
        .populate("userId", "username email")
        .sort({ createdAt: -1 })
        .limit(10),
      User.find({ createdAt: { $gte: since } })
        .sort({ createdAt: -1 })
        .limit(10),
      Contact.find({ status: "unread" })
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const notifications = [];

    newOrders.forEach(o => notifications.push({
      id:      o._id,
      type:    'order',
      icon:    'fa-shopping-bag',
      color:   '#38b2ac',
      title:   'New Order',
      message: `${o.userId?.username || 'Customer'} placed an order of ₹${o.finalTotal || o.total}`,
      time:    o.createdAt,
    }));

    newUsers.forEach(u => notifications.push({
      id:      u._id,
      type:    'user',
      icon:    'fa-user-plus',
      color:   '#667eea',
      title:   'New Registration',
      message: `${u.username} joined as a new user`,
      time:    u.createdAt,
    }));

    newMessages.forEach(m => notifications.push({
      id:      m._id,
      type:    'message',
      icon:    'fa-envelope',
      color:   '#ed8936',
      title:   'New Message',
      message: `${m.name}: ${m.subject || m.message.substring(0, 40)}...`,
      time:    m.createdAt,
    }));

    // Sort all by time desc
    notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

    res.json({ success: true, data: notifications.slice(0, 15), total: notifications.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
