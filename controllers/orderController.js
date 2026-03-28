const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Product = require("../models/productModel");

// ================= CREATE ORDER =================
exports.createOrder = async (req, res) => {
  try {
    console.log("=== INCOMING ORDER BODY ===", JSON.stringify(req.body, null, 2));

    const {
      userId,
      items,
      total,
      address,
      couponCode,
      discount,
      finalTotal,
      paymentMethod,
    } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "No items provided" });
    }

    // ── STEP 1: validate & fetch all products BEFORE creating order ──
    const productDocs = [];
    for (const item of items) {
      // productId may come as object or string — handle both
      const pid = item.productId?._id || item.productId;

      if (!pid) {
        return res.status(400).json({ error: "Missing productId in item", item });
      }

      const qty = Number(item.quantity || item.qty || 1);
      const product = await Product.findById(pid);

      console.log(`Checking product: ${pid}, qty: ${qty}, found: ${!!product}, stock: ${product?.stock}`);

      if (!product) {
        return res.status(404).json({ error: `Product not found: ${pid}` });
      }

      // if stock is 0 (not set), skip stock check — treat as unlimited
      if (product.stock > 0 && product.stock < qty) {
        return res.status(400).json({ error: `"${product.pname}" is out of stock. Available: ${product.stock}` });
      }

      productDocs.push({ product, quantity: qty });
    }

    // ── STEP 2: create order ──
    const order = await Order.create({
      userId,
      items,
      total,
      discount: discount || 0,
      couponCode: couponCode || '',
      finalTotal: finalTotal || total,
      address,
      paymentMethod: paymentMethod || 'cod',
    });

    // ── STEP 3: deduct stock (only if stock > 0) ──
    for (const { product, quantity } of productDocs) {
      if (product.stock > 0) {
        const oldStock = product.stock;
        product.stock -= quantity;
        console.log(`----- STOCK UPDATE -----`);
        console.log(`Product : ${product.pname}`);
        console.log(`Old     : ${oldStock}`);
        console.log(`Bought  : ${quantity}`);
        console.log(`New     : ${product.stock}`);
        await product.save();
      }
    }

    // ── STEP 4: mark coupon as used ──
    if (couponCode) {
      await Coupon.findOneAndUpdate(
        { code: couponCode },
        { $addToSet: { usedBy: userId } }
      );
    }

    res.status(201).json({
      message: "Order placed successfully",
      data: order,
    });
  } catch (error) {
    console.error("=== ORDER ERROR ===", error);
    res.status(500).json({ error: error.message });
  }
};

// ================= GET USER ORDERS =================
exports.getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId })
      .populate("items.productId")
      .sort({ createdAt: -1 });

    res.json({
      message: "User Orders",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET ALL ORDERS (ADMIN) =================
exports.getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("items.productId")
      .populate("userId")
      .sort({ createdAt: -1 });

    res.json({
      message: "All Orders",
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= UPDATE ORDER STATUS =================
exports.updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );

    res.json({
      message: "Order status updated",
      data: order,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
