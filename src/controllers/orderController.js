const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
require("dotenv").config();

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_ID,
});

const createOrderController = async (req, res) => {
  try {
    const {
      userId,
      firstName,
      lastName,
      phone,
      pincode,
      address,
      city,
      state,
      email,
      products,
      totalAmt,
      discount,
      finalAmt,
      paymentMethod,
    } = req.body;

    // Check for missing fields
    if (
      !userId ||
      !firstName ||
      !lastName ||
      !phone ||
      !pincode ||
      !address ||
      !city ||
      !state ||
      !email ||
      !products ||
      !totalAmt ||
      !finalAmt ||
      !paymentMethod
    ) {
      return res.status(400).json({
        success: false,
        message: "Missing required details",
      });
    }

    // Razorpay Order Options
    const options = {
      amount: finalAmt * 100, // Amount in paise
      currency: "INR",
      receipt: `JSO_${Date.now()}_${crypto.randomBytes(10).toString("hex")}`,
      payment_capture: 1,
    };

    // Create Razorpay Order
    const razorpayOrder = await razorpay.orders.create(options);

    // Find the highest order number and increment it
    const totalOrders = await Order.countDocuments(); // Count the total number of orders
    const newOrderNumber = totalOrders + 1 + 10000; // Start sequence from 10001

    // Create and save order in database
    const newOrder = new Order({
      userId,
      firstName,
      lastName,
      phone,
      pincode,
      address,
      city,
      state,
      email,
      products,
      totalAmt,
      discount,
      finalAmt,
      paymentMethod,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
      orderNumber: newOrderNumber,
    });

    await newOrder.save();

    await Cart.findOneAndDelete({ userId });

    res.json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
      razorpayOrder,
    });
  } catch (e) {
    res.json({
      success: false,
      message: `Error occurred while creating order: ${e.message}`,
      error: e.message,
    });
  }
};

const verifyPaymentController = async (req, res) => {
  try {
    const { order_id, payment_id, signature, userId } = req.body;
    const paymentSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_ID)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");
    if (paymentSignature !== signature) {
      return res.json({
        success: false,
        message: "Payment Verification Failed",
      });
    }

    const order = await Order.findOneAndUpdate(
      { userId },
      { payment_id: payment_id, paymentStatus: "paid" }
    );
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }
    await order.save();
    return res.json({
      success: true,
      message: "Payment Verification Successfull",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: `Error occurred while verifying payment: ${e.message}`,
      error: e.message,
    });
  }
};

const couponController = async (req, res) => {
  try {
    const { couponCode } = req.body;

    const coupon = await Coupon.findOne({ code: couponCode });

    if (!coupon) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid coupon code" });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res
        .status(400)
        .json({ success: false, message: "Coupon has expired" });
    }

    res.json({ success: true, discount: coupon.discount });
  } catch (error) {
    res.json({ success: false, message: `os` });
  }
};

const getOrderDetailsController = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);
    if (!order) {
      return res.json({
        success: false,
        message: "Order not found",
      });
    }
    res.json({
      success: true,
      order,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching Order Details",
      error: e.message,
    });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    const orders = await Order.find({});
    res.json({
      order: orders,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching Products",
      error: e.message,
    });
  }
};

const getAllOrderDetailsController = async (req, res) => {
  try {
    const { userId } = req.body;
    const orders = await Order.find({ userId });
    res.json({
      success: true,
      orders,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching All Orders",
      error: e.message,
    });
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    order.status = status;
    await order.save();
    res.json({
      success: true,
      message: `Order is ${status}`,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching All Orders",
      error: e.message,
    });
  }
};

const deleteOrderController = async (req, res) => {
  try {
    const {orderId} = req.params;
    const order = await Order.findByIdAndDelete(orderId);
    res.json({
      success: true,
      message: "Order Delete Successfully"
    })
  } catch (e) {
    res.json({
      success: false,
      message: "Error Occured While Fetching All Orders",
      error: e.message,
    });
  }
};

module.exports = {
  createOrderController,
  verifyPaymentController,
  couponController,
  getAllOrdersController,
  getOrderDetailsController,
  getAllOrderDetailsController,
  changeOrderStatus,
  deleteOrderController,
};
