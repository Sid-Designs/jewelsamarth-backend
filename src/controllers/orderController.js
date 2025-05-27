const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const { emailTemplates } = require("../utils/emailTemplates");
const transporter = require("../config/nodeMailer");
require("dotenv").config();

// Razorpay Setup
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_ID,
});

// Constants
const ORDER_STATUS = {
  PENDING: "pending",
  PROCESSING: "processing",
  SHIPPED: "shipped",
  DELIVERED: "delivered",
  CANCELLED: "cancelled"
};

const PAYMENT_STATUS = {
  PENDING: "pending",
  PAID: "paid",
  FAILED: "failed"
};

// Helper Functions
const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne().sort({ orderNumber: -1 }).limit(1);
  return lastOrder ? lastOrder.orderNumber + 1 : 10001;
};

const validateOrderData = (data) => {
  const requiredFields = [
    "userId", "firstName", "lastName", "phone", "pincode", 
    "address", "city", "state", "email", "products", 
    "totalAmt", "finalAmt", "paymentMethod"
  ];
  
  const missingFields = requiredFields.filter(field => !data[field]);
  if (missingFields.length > 0) {
    return {
      isValid: false,
      message: `Missing required fields: ${missingFields.join(", ")}`
    };
  }
  
  if (!Array.isArray(data.products) || data.products.length === 0) {
    return {
      isValid: false,
      message: "Products must be a non-empty array"
    };
  }
  
  return { isValid: true };
};

// Controllers
const createOrderController = async (req, res) => {
  try {
    const orderData = req.body;
    
    // Validate input data
    const validation = validateOrderData(orderData);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        message: validation.message
      });
    }
    
    // Generate Razorpay order
    const razorpayOptions = {
      amount: orderData.finalAmt * 100, // Amount in paise
      currency: "INR",
      receipt: `JSO_${Date.now()}_${crypto.randomBytes(10).toString("hex")}`,
      payment_capture: 1,
    };
    
    const razorpayOrder = await razorpay.orders.create(razorpayOptions);
    
    // Create database order
    const newOrder = new Order({
      ...orderData,
      razorpayOrderId: razorpayOrder.id,
      status: ORDER_STATUS.PENDING,
      paymentStatus: PAYMENT_STATUS.PENDING,
      orderNumber: await generateOrderNumber(),
    });
    
    await newOrder.save();
    
    // Clear user's cart
    await Cart.findOneAndDelete({ userId: orderData.userId });
    
    // Send order confirmation email
    try {
      await transporter.sendMail({
        from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
        to: orderData.email,
        subject: "Your Order Confirmation - Jewel Samarth",
        html: emailTemplates.orderCreated(newOrder.toObject())
      });
    } catch (emailError) {
      console.error("Failed to send order confirmation email:", emailError);
    }
    
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
      razorpayOrder
    });
    
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const verifyPaymentController = async (req, res) => {
  try {
    const { order_id, payment_id, signature, userId } = req.body;
    
    if (!order_id || !payment_id || !signature || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification details"
      });
    }
    
    // Verify payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_ID)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");
      
    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed: Invalid signature"
      });
    }
    
    // Update order status
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: order_id, userId },
      { 
        payment_id,
        paymentStatus: PAYMENT_STATUS.PAID,
        paymentDate: new Date()
      },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Send payment confirmation email
    try {
      await transporter.sendMail({
        from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
        to: order.email,
        subject: "Payment Received - Jewel Samarth",
        html: emailTemplates.paymentSuccess(order.toObject())
      });
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError);
    }
    
    res.json({
      success: true,
      message: "Payment verified successfully",
      order
    });
    
  } catch (error) {
    console.error("Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const couponController = async (req, res) => {
  try {
    const { couponCode } = req.body;
    
    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required"
      });
    }
    
    const coupon = await Coupon.findOne({ code: couponCode });
    
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code"
      });
    }
    
    // Check coupon validity
    const currentDate = new Date();
    if (coupon.expiryDate && new Date(coupon.expiryDate) < currentDate) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired"
      });
    }
    
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached"
      });
    }
    
    res.json({
      success: true,
      coupon: {
        code: coupon.code,
        discount: coupon.discount,
        discountType: coupon.discountType,
        minOrderValue: coupon.minOrderValue
      }
    });
    
  } catch (error) {
    console.error("Coupon validation error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const getOrderDetailsController = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }
    
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.json({
      success: true,
      order
    });
    
  } catch (error) {
    console.error("Order details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch order details",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = {};
    
    if (status && Object.values(ORDER_STATUS).includes(status)) {
      filter.status = status;
    }
    
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const totalOrders = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    });
    
  } catch (error) {
    console.error("Get all orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const getUserOrdersController = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }
    
    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));
    
    const totalOrders = await Order.countDocuments({ userId });
    
    res.json({
      success: true,
      orders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    });
    
  } catch (error) {
    console.error("Get user orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch user orders",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const updateOrderStatusController = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    
    if (!orderId || !status) {
      return res.status(400).json({
        success: false,
        message: "Order ID and status are required"
      });
    }
    
    if (!Object.values(ORDER_STATUS).includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }
    
    const order = await Order.findByIdAndUpdate(
      orderId,
      { status },
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    // Send status update email
    try {
      await transporter.sendMail({
        from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
        to: order.email,
        subject: `Order Status Update - #${order.orderNumber}`,
        html: emailTemplates.statusUpdate(order.toObject(), status)
      });
    } catch (emailError) {
      console.error("Failed to send status update email:", emailError);
    }
    
    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
    
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    if (!orderId) {
      return res.status(400).json({
        success: false,
        message: "Order ID is required"
      });
    }
    
    const order = await Order.findByIdAndDelete(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }
    
    res.json({
      success: true,
      message: "Order deleted successfully"
    });
    
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete order",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

module.exports = {
  createOrderController,
  verifyPaymentController,
  couponController,
  getOrderDetailsController,
  getAllOrdersController,
  getUserOrdersController,
  updateOrderStatusController,
  deleteOrderController
};