const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const WishlistSchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    createdAt: { type: Date, default: Date.now } 
});

module.exports = mongoose.model("Wishlist", WishlistSchema);
