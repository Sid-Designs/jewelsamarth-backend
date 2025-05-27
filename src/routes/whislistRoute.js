const express = require("express");
const Wishlist = require("../models/whislistModel");
const {addToWishlist, getWishlist, removeFromWishlist, clearWishlist} = require("../controllers/whislistController");
const router = express.Router();

// Add item to wishlist
router.post("/add", addToWishlist);

// Get user's wishlist
router.get("/:userId", getWishlist);

// Remove item from wishlist
router.delete("/remove/:itemId", removeFromWishlist);

// Clear entire wishlist for a user
router.delete("/clear/:userId", clearWishlist);

module.exports = router;
