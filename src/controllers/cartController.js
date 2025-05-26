const Cart = require("../models/cartModel");
const User = require("../models/userModel");
const Product = require("../models/productModel");

const addtocartController = async (req, res) => {
  try {
    const { productId, quantity, userId } = req.body;

    // Validate the requested quantity (1-5)
    if (quantity <= 0 || quantity > 5) {
      return res.status(400).json({ 
        success: false, 
        message: "Quantity must be between 1 and 5 per product" 
      });
    }

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
      // Check if adding the quantity would exceed the limit of 5
      const newQuantity = cart.items[productIndex].quantity + quantity;
      if (newQuantity > 5) {
        return res.status(400).json({
          success: false,
          message: "Maximum quantity limit of 5 per product reached"
        });
      }
      cart.items[productIndex].quantity = newQuantity;
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

const removeCartController = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }

    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );

    if (productIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product not found in cart",
      });
    }

    cart.items.splice(productIndex, 1);

    await cart.save();

    res.json({
      success: true,
      message: "Product removed successfully from the cart",
      cart,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error occurred while removing product from cart",
      error: error.message,
    });
  }
};

const qtyPlusController = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }

    // Check if increasing quantity exceeds the limit (5)
    if (cart.items[productIndex].quantity >= 5) {
      return res.status(400).json({
        success: false,
        message: "Maximum quantity limit of 5 per product reached",
      });
    }

    cart.items[productIndex].quantity += 1;
    await cart.save();
    res.json({
      success: true,
      message: "Quantity increased successfully",
      cart,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error occurred while updating quantity",
      error: err.message,
    });
  }
};

const qtyMinusController = async (req, res) => {
  const { productId } = req.params;
  const { userId } = req.body;

  try {
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.json({ success: false, message: "Cart not found" });
    }
    const productIndex = cart.items.findIndex(
      (item) => item.productId.toString() === productId
    );
    if (productIndex === -1) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found in cart" });
    }
    if (cart.items[productIndex].quantity > 1) {
      cart.items[productIndex].quantity -= 1;
      await cart.save();
    } else {
      cart.items.splice(productIndex, 1);
      await cart.save();
    }
    res.json({
      success: true,
      message: "Quantity decreased successfully",
      cart,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Error occurred while updating quantity",
      error: err.message,
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
        const product = await Product.findById(item.productId);
        return {
          ...product._doc,
          quantity: item.quantity,
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

const getCartTotalController = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) {
      return res.status(404).json({ success: false, message: "Cart not found" });
    }
    const totalItems = cart.items.length;
    res.status(200).json({ success: true, total: totalItems });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching cart total",
      error: e.message,
    });
  }
};

module.exports = {
  addtocartController,
  qtyPlusController,
  qtyMinusController,
  removeCartController,
  getcartController,
  allcartController,
  getCartTotalController,
};