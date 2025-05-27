const Wishlist = require("../models/wishlistModel");

// Add an item to wishlist
const addToWishlist = async (req, res) => {
    try {
        const item = new Wishlist(req.body);
        await item.save();
        res.status(200).json({ message: "Item added to wishlist", item });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get user's wishlist
const getWishlist = async (req, res) => {
    try {
        const items = await Wishlist.find({ userId: req.params.userId }).populate("productId");
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Remove an item from wishlist
const removeFromWishlist = async (req, res) => {
    try {
        await Wishlist.findByIdAndDelete(req.params.itemId);
        res.status(200).json({ message: "Item removed from wishlist" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Clear entire wishlist for a user
const clearWishlist = async (req, res) => {
    try {
        await Wishlist.deleteMany({ userId: req.params.userId });
        res.status(200).json({ message: "Wishlist cleared successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {addToWishlist, getWishlist, removeFromWishlist, clearWishlist};
