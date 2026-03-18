const Wishlist = require("../models/wishlistModel");

// GET /api/wishlist/:userId
const getWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOne({ userId: req.params.userId }).populate("products");
    res.json({ success: true, data: wishlist ? wishlist.products : [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/wishlist/toggle  { userId, productId }
const toggleWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    let wishlist = await Wishlist.findOne({ userId });

    if (!wishlist) {
      wishlist = new Wishlist({ userId, products: [productId] });
    } else {
      const index = wishlist.products.indexOf(productId);
      if (index === -1) {
        wishlist.products.push(productId);
      } else {
        wishlist.products.splice(index, 1);
      }
    }

    await wishlist.save();
    const updated = await Wishlist.findOne({ userId }).populate("products");
    res.json({ success: true, data: updated.products });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWishlist, toggleWishlist };
