const express = require("express");
const Wishlist = require("../models/whislistModel");
const router = express.Router();

// Add item to wishlist
router.post("/add", async (req, res) => {
    try {
        const item = new Wishlist(req.body);
        await item.save();
        res.status(200).json({ message: "Item added to wishlist" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get user's wishlist
router.get("/:userId", async (req, res) => {
    try {
        const items = await Wishlist.find({ userId: req.params.userId }).populate("productId");
        res.status(200).json(items);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Remove item from wishlist
router.delete("/remove/:itemId", async (req, res) => {
    try {
        await Wishlist.findByIdAndDelete(req.params.itemId);
        res.status(200).json({ message: "Item removed from wishlist" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
