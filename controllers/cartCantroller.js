const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// ================= ADD TO CART =================
exports.addToCart = async (req, res) => {
  try {
    const { userId, productId, quantity } = req.body;

    let cart = await Cart.findOne({ userId });

    if (!cart) {
      cart = new Cart({
        userId,
        items: [
          {
            productId,
            quantity: Number(quantity) || 1,
          },
        ],
      });
    } else {
      const itemIndex = cart.items.findIndex(
        (item) => item.productId.toString() === productId,
      );

      if (itemIndex > -1) {
        cart.items[itemIndex].quantity += Number(quantity) || 1;
      } else {
        cart.items.push({
          productId,
          quantity: Number(quantity) || 1,
        });
      }
    }

    await cart.save();

    const populatedCart = await Cart.findOne({ userId }).populate(
      "items.productId",
    );

    res.json({
      message: "Product added to cart",
      data: populatedCart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= GET CART =================
exports.getCart = async (req, res) => {
  try {
    const { userId } = req.params;

    const cart = await Cart.findOne({ userId }).populate("items.productId");

    if (!cart) {
      return res.json({
        message: "Cart empty",
        data: [],
      });
    }

    res.json({
      message: "User Cart",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= INCREASE QTY =================
exports.increaseQty = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (item) {
      item.quantity += 1;
    }

    await cart.save();

    res.json({
      message: "Quantity increased",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= DECREASE QTY =================
exports.decreaseQty = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    const item = cart.items.find(
      (item) => item.productId.toString() === productId,
    );

    if (item && item.quantity > 1) {
      item.quantity -= 1;
    }

    await cart.save();

    res.json({
      message: "Quantity decreased",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= REMOVE ITEM =================
exports.removeItem = async (req, res) => {
  try {
    const { userId, productId } = req.body;

    const cart = await Cart.findOne({ userId });

    cart.items = cart.items.filter(
      (item) => item.productId.toString() !== productId,
    );

    await cart.save();

    res.json({
      message: "Item removed",
      data: cart,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ================= CLEAR CART =================
exports.clearCart = async (req, res) => {
  try {
    const { userId } = req.body;

    await Cart.findOneAndDelete({ userId });

    res.json({
      message: "Cart cleared",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
