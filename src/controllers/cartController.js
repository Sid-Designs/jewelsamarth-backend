const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const addtocartController = async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;

    const user = await User.findById(userId);
    const product = await Product.findById(productId);
    if (!user || !product) {
      return res
        .status(400)
        .json({ success: false, message: "Product or User not found" });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex > -1) {
      cart.items[productIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }

    await cart.save();
    res
      .status(200)
      .json({ success: true, message: "Product added to cart", data: cart });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product to cart",
      error: e.message,
    });
  }
};

const getcartController = async (req, res) => {
    try {
      const { userId } = req.body;
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: "Cart not found",
        });
      }
      const productDetails = await Promise.all(
        cart.items.map(async (item) => {
          const product = await Product.findById(item.productId); // Find product by its ID
          return {
            ...product._doc, // Spread product details
            quantity: item.quantity, // Add quantity from the cart
          };
        })
      );
      res.status(200).json({
        success: true,
        data: productDetails,
      });
    } catch (e) {
      res.status(500).json({
        success: false,
        message: "Error occurred while fetching cart products",
        error: e.message,
      });
    }
  };
  

const allcartController = async (req, res) => {
  try {
    const carts = await Cart.find({});
    res.status(200).json({ success: true, data: carts });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occurred while adding product to cart",
      error: e.message,
    });
  }
};

module.exports = { addtocartController, getcartController, allcartController };
