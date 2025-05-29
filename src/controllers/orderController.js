const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
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

// Email Templates
const emailTemplates = {
  orderCreated: (orderDetails) => {
    const year = new Date().getFullYear();
    const productsList = orderDetails.products.map(
      (product) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: left;">
          ${product.name} (${product.quantity})
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          ₹${product.price * product.quantity}
        </td>
      </tr>
    `).join("");

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation | Jewel Samarth</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
            border-radius: 20px;
          }
          
          .header {
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9fa;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .order-table th, .order-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            background-color: #f59e0b;
            color: white;
          }
          
          .button {
            display: inline-block;
            background-color: #fecc32;
            color: #060675 !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
          }
          
          .footer {
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
            font-size: 12px;
          }
          p {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" width="180" />
          </div>
          
          <div class="content">
            <h1>Your Order is Confirmed!</h1>
            <p>Thank you for your order, ${orderDetails.firstName}! Your order #${orderDetails.orderNumber} has been received.</p>
            
            <table class="order-table">
              <tr>
                <th colspan="2">Order Summary</th>
              </tr>
              ${products}
              <tr>
                <td><strong>Subtotal</strong></td>
                <td>₹${orderDetails.totalAmt}</td>
              </tr>
              <tr>
                <td><strong>Discount</strong></td>
                <td>-₹${orderDetails.discount || 0}</td>
              </tr>
              <tr>
                <td><strong>Total</strong></td>
                <td>₹${orderDetails.finalAmt}</td>
              </tr>
            </table>
            
            <div style="text-align: center;">
              <span class="status-badge">Payment Pending</span>
              <p>Please complete your payment to proceed with order processing.</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://jewelsamarth.in/order/${orderDetails._id}" class="button">View Order Details</a>
            </div>
          </div>
          
          <div class="footer">
            © ${year} Jewel Samarth. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  },

  paymentSuccess: (orderDetails) => {
    const year = new Date().getFullYear();
    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Payment Successful | Jewel Samarth</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
            border-radius: 20px;
          }
          
          .header {
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9fa;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          .payment-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .payment-table th, .payment-table td {
            padding: 12px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            background-color: #10b981;
            color: white;
          }
          
          .button {
            display: inline-block;
            background-color: #fecc32;
            color: #060675 !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
          }
          
          .footer {
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
            font-size: 12px;
          }
          p{
          text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" width="180" />
          </div>
          
          <div class="content">
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment, ${orderDetails.firstName}! Your order #${orderDetails.orderNumber} is now being processed.</p>
            
            <table class="payment-table">
              <tr>
                <th colspan="2">Payment Details</th>
              </tr>
              <tr>
                <td><strong>Order Number</strong></td>
                <td>#${orderDetails.orderNumber}</td>
              </tr>
              <tr>
                <td><strong>Amount Paid</strong></td>
                <td>₹${orderDetails.finalAmt}</td>
              </tr>
              <tr>
                <td><strong>Payment Method</strong></td>
                <td>${orderDetails.paymentMethod}</td>
              </tr>
              <tr>
                <td><strong>Payment Date</strong></td>
                <td>${new Date().toLocaleDateString()}</td>
              </tr>
            </table>
            
            <div style="text-align: center;">
              <span class="status-badge">Payment Received</span>
            </div>
            
            <div style="text-align: center;">
              <a href="https://jewelsamarth.in/order/${orderDetails._id}" class="button">Track Your Order</a>
            </div>
          </div>
          
          <div class="footer">
            © ${year} Jewel Samarth. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  },

  statusUpdate: (orderDetails, newStatus) => {
    const year = new Date().getFullYear();
    const statusMessages = {
      processing: "Your order is being prepared for shipment.",
      shipped: "Your order has been shipped and is on its way to you!",
      delivered: "Your order has been successfully delivered.",
      cancelled: "Your order has been cancelled as per your request."
    };

    const statusColors = {
      processing: "#f59e0b",
      shipped: "#3b82f6",
      delivered: "#10b981",
      cancelled: "#ef4444"
    };

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Status Update | Jewel Samarth</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            border: 1px solid #e5e7eb;
            border-radius: 20px;
          }
          
          .header {
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9fa;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          .status-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            background-color: ${statusColors[newStatus]};
            color: white;
            text-transform: capitalize;
          }
          
          .button {
            display: inline-block;
            background-color: #fecc32;
            color: #060675 !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
          }
          
          .footer {
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
            font-size: 12px;
          }
          p {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" width="180" />
          </div>
          
          <div class="content">
            <h1>Order Status Updated</h1>
            <p>Hello ${orderDetails.firstName}, the status of your order #${orderDetails.orderNumber} has been updated.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <span class="status-badge">${newStatus}</span>
              <p>${statusMessages[newStatus]}</p>
            </div>
            
            <div style="text-align: center;">
              <a href="https://jewelsamarth.in/order/${orderDetails._id}" class="button">View Order Details</a>
            </div>
          </div>
          
          <div class="footer">
            © ${year} Jewel Samarth. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  },

  welcome: (username) => {
    const year = new Date().getFullYear();
    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Welcome to Jewel Samarth</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          .header {
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9fa;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          .highlight {
            color: #fecc32;
            font-weight: bold;
          }
          
          .features {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-between;
            margin: 30px 0;
          }
          
          .feature {
            width: 30%;
            text-align: center;
            margin-bottom: 20px;
          }
          
          .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .button {
            display: inline-block;
            background-color: #fecc32;
            color: #060675 !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
          }
          
          .footer {
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" width="180" />
          </div>
          
          <div class="content">
            <h1>Welcome to Jewel Samarth!</h1>
            <p>Hello <span class="highlight">${username}</span>, we're thrilled to have you join our jewelry family!</p>
            
            <div class="features">
              <div class="feature">
                <div class="feature-icon">💎</div>
                <div>Premium Quality</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🚚</div>
                <div>Free Shipping</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🛡️</div>
                <div>Lifetime Warranty</div>
              </div>
            </div>
            
            <div style="text-align: center;">
              <a href="https://jewelsamarth.in" class="button">Explore Our Collections</a>
            </div>
          </div>
          
          <div class="footer">
            © ${year} Jewel Samarth. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  },

  otp: (username, otp) => {
    const year = new Date().getFullYear();
    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Your Verification Code | Jewel Samarth</title>
        <style type="text/css">
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
          }
          
          .header {
            padding: 40px 20px;
            text-align: center;
            background-color: #f8f9fa;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          .otp-box {
            background-color: #f8f9fa;
            border: 1px dashed #fecc32;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
          }
          
          .otp-code {
            font-size: 36px;
            letter-spacing: 5px;
            font-weight: bold;
            color: #060675;
            margin: 10px 0;
          }
          
          .expire-badge {
            display: inline-block;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: bold;
            background-color: #f59e0b;
            color: white;
          }
          
          .footer {
            padding: 20px;
            text-align: center;
            background-color: #f8f9fa;
            font-size: 12px;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" width="180" />
          </div>
          
          <div class="content">
            <h1>Your Verification Code</h1>
            <p>Hello ${username || "Valued Customer"}, please use this code to verify your account:</p>
            
            <div class="otp-box">
              <div style="font-size: 14px; margin-bottom: 10px;">VERIFICATION CODE</div>
              <div class="otp-code">${otp}</div>
              <div class="expire-badge">Expires in 10 minutes</div>
            </div>
            
            <p style="font-size: 14px; color: #666666;">
              For security reasons, do not share this code with anyone.
            </p>
          </div>
          
          <div class="footer">
            © ${year} Jewel Samarth. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
  }
};

// Helper Functions
const generateOrderNumber = async () => {
  const lastOrder = await Order.findOne().sort({ orderNumber: -1 }).limit(1);
  return lastOrder ? lastOrder.orderNumber + 1 : 10001;
};

// Controllers
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
    try {
      await transporter.sendMail({
        from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
        to: order.email,
        subject: "Payment Received - Jewel Samarth",
        html: emailTemplates.orderCreated(newOrder.toObject()),
      });
    } catch (emailError) {
      console.error("Failed to send payment confirmation email:", emailError);
    }

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

    if (!order_id || !payment_id || !signature || !userId) {
      return res.status(400).json({
        success: false,
        message: "Missing required payment verification details"
      });
    }

    // Step 1: Verify Razorpay signature
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

    // Step 2: Find the order first
    const order = await Order.findOne({ razorpayOrderId: order_id, userId });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found. Please check the Razorpay Order ID and User ID"
      });
    }

    // Step 3: Update order details
    order.payment_id = payment_id;
    order.paymentStatus = PAYMENT_STATUS.PAID;
    order.paymentDate = new Date();

    await order.save();

    // Step 4: Send confirmation email
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

    return res.status(200).json({
      success: true,
      message: "Payment verified and order updated successfully",
      order
    });

  } catch (error) {
    console.error("Payment verification error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to verify payment",
      error: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
};

const createCouponController = async (req, res) => {
  try {
    const { code, discount, expiryDate } = req.body;

    // Check if coupon already exists
    const existingCoupon = await Coupon.findOne({ code });
    if (existingCoupon) {
      return res.status(400).json({ error: 'Coupon code already exists' });
    }

    // Validate expiry date
    if (new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ error: 'Expiry date must be in the future' });
    }

    const coupon = new Coupon({ code, discount, expiryDate });
    await coupon.save();
    
    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const updateCouponController = async (req, res) => {
  try {
    const { couponId } = req.params;
    const { discount, expiryDate } = req.body;

    if (expiryDate && new Date(expiryDate) <= new Date()) {
      return res.status(400).json({ error: 'Expiry date must be in the future' });
    }

    const updatedCoupon = await Coupon.findByIdAndUpdate(
      couponId,
      { discount, expiryDate },
      { new: true, runValidators: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json(updatedCoupon);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteCouponController = async (req, res) => {
  try {
    const { couponId } = req.params;
    const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

    if (!deletedCoupon) {
      return res.status(404).json({ error: 'Coupon not found' });
    }

    res.json({ message: 'Coupon deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const couponDetailsController = async (req, res) => {
  try {
    const coupons = await Coupon.find({}).sort({ expiryDate: 1 });
    
    res.json({ success: true, coupons });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch coupon details' });
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
  createCouponController,
  couponDetailsController,
  updateCouponController,
  deleteCouponController,
  couponController,
  getOrderDetailsController,
  getAllOrdersController,
  getAllOrderDetailsController,
  changeOrderStatus,
  deleteOrderController
};