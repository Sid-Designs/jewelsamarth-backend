const Order = require("../models/orderModel");
const Coupon = require("../models/couponModel");
const Cart = require("../models/cartModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const transporter = require("../config/nodeMailer");
require("dotenv").config();

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET_ID,
});

// Email Templates with consistent styling
const emailTemplates = {
  orderConfirmation: (username, orderNumber, orderDate, products, totalAmt, finalAmt, trackingNumber = null) => {
    const year = new Date().getFullYear();
    const formattedDate = new Date(orderDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const productRows = products.map(product => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: left; vertical-align: top;">
          ${product.name}<br>
          <small style="color: #6b7280;">Size: ${product.size || 'N/A'}, Qty: ${product.quantity}</small>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right; vertical-align: top;">
          ₹${(product.price * product.quantity).toLocaleString('en-IN')}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation #${orderNumber} | Jewel Samarth</title>
        <style type="text/css">
          /* Base styles */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important; 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            background-color: #f7f7f7;
          }
          
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }
          
          .email-header {
            background: #E5E7EB;
            padding: 30px 20px;
            text-align: center;
          }
          
          .logo-img {
            width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          
          .email-body {
            padding: 30px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          h2 {
            color: #060675;
            font-size: 18px;
            font-weight: bold;
            margin: 25px 0 15px 0;
          }
          
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 0 0 15px 0;
          }
          
          .highlight {
            color: #fecc32;
            font-weight: bold;
          }
          
          .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .order-table th {
            background-color: #f3f4f6;
            padding: 12px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .order-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .total-row {
            font-weight: bold;
            background-color: #f9fafb;
          }
          
          .cta-button {
            display: inline-block;
            background-color: #fecc32;
            color: #060675 !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            font-size: 16px;
          }
          
          .tracking-box {
            background-color: #f0f9ff;
            border: 1px solid #bae6fd;
            border-radius: 12px;
            padding: 15px;
            margin: 20px 0;
          }
          
          .email-footer {
            background: #E5E7EB;
            padding: 20px;
            text-align: center;
            color: #060675;
            font-size: 12px;
          }
          
          @media screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              border-radius: 0 !important;
            }
            .email-header, .email-body, .email-footer {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            .logo-img {
              width: 150px !important;
            }
            h1 {
              font-size: 22px !important;
            }
          }
        </style>
      </head>
      <body>
        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td class="email-header">
              <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" class="logo-img" />
            </td>
          </tr>
          <tr>
            <td class="email-body">
              <h1>Thank You For Your Order!</h1>
              <p>Hello <span class="highlight">${username}</span>,</p>
              <p>We're delighted to confirm your order <strong>#${orderNumber}</strong> placed on ${formattedDate}. Your jewelry is being carefully prepared by our craftsmen.</p>
              
              <h2>Order Summary</h2>
              <table class="order-table">
                <thead>
                  <tr>
                    <th style="text-align: left;">Item</th>
                    <th style="text-align: right;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${productRows}
                  <tr class="total-row">
                    <td style="text-align: left;">Subtotal</td>
                    <td style="text-align: right;">₹${totalAmt.toLocaleString('en-IN')}</td>
                  </tr>
                  ${finalAmt < totalAmt ? `
                  <tr class="total-row">
                    <td style="text-align: left;">Discount</td>
                    <td style="text-align: right;">-₹${(totalAmt - finalAmt).toLocaleString('en-IN')}</td>
                  </tr>
                  ` : ''}
                  <tr class="total-row">
                    <td style="text-align: left;">Total</td>
                    <td style="text-align: right;">₹${finalAmt.toLocaleString('en-IN')}</td>
                  </tr>
                </tbody>
              </table>
              
              ${trackingNumber ? `
              <div class="tracking-box">
                <h2>Tracking Information</h2>
                <p>Your order has been shipped with tracking number: <strong>${trackingNumber}</strong></p>
                <p>Expected delivery date: Within 3-5 business days</p>
              </div>
              ` : `
              <p>We'll notify you when your order ships. You can check the status of your order anytime by visiting our website.</p>
              `}
              
              <div style="text-align: center;">
                <a href="https://jewelsamarth.in/orders" class="cta-button">View Your Order</a>
              </div>
              
              <h2>Need Help?</h2>
              <p>If you have any questions about your order, please contact our customer service team at <a href="mailto:support@jewelsamarth.in" style="color: #060675; font-weight: bold;">support@jewelsamarth.in</a> or call us at +91 1234567890.</p>
            </td>
          </tr>
          <tr>
            <td class="email-footer">
              © ${year} Jewel Samarth - Crafting Dreams into Reality
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  },

  orderStatusUpdate: (username, orderNumber, oldStatus, newStatus, trackingNumber = null) => {
    const year = new Date().getFullYear();
    const statusDetails = {
      'processing': {
        icon: '🔄',
        title: 'Processing Your Order',
        message: 'Our team is carefully preparing your jewelry for shipment.'
      },
      'shipped': {
        icon: '🚚',
        title: 'Your Order Has Shipped!',
        message: 'Your precious jewelry is on its way to you.'
      },
      'delivered': {
        icon: '✅',
        title: 'Order Delivered',
        message: 'We hope you love your new jewelry!'
      },
      'cancelled': {
        icon: '❌',
        title: 'Order Cancelled',
        message: 'Your order has been cancelled as per your request.'
      }
    };

    const status = statusDetails[newStatus] || {
      icon: 'ℹ️',
      title: 'Order Status Updated',
      message: `Your order status has been updated to ${newStatus}.`
    };

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order #${orderNumber} Update | Jewel Samarth</title>
        <style type="text/css">
          /* Same base styles as order confirmation */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { 
            margin: 0 !important; 
            padding: 0 !important; 
            width: 100% !important; 
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            background-color: #f7f7f7;
          }
          
          .email-container {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            background: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
          }
          
          .email-header {
            background: #E5E7EB;
            padding: 30px 20px;
            text-align: center;
          }
          
          .logo-img {
            width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          
          .email-body {
            padding: 30px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          .status-card {
            background-color: #f8fafc;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            margin: 20px 0;
            border: 1px solid #e5e7eb;
          }
          
          .status-icon {
            font-size: 48px;
            margin-bottom: 15px;
          }
          
          .status-title {
            color: #060675;
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .status-message {
            font-size: 16px;
            margin-bottom: 15px;
          }
          
          .status-details {
            background-color: #ffffff;
            border-radius: 8px;
            padding: 15px;
            margin-top: 15px;
            text-align: left;
          }
          
          .detail-row {
            display: flex;
            margin-bottom: 8px;
          }
          
          .detail-label {
            font-weight: bold;
            width: 120px;
            color: #6b7280;
          }
          
          .cta-button {
            display: inline-block;
            background-color: #fecc32;
            color: #060675 !important;
            text-decoration: none;
            padding: 12px 30px;
            border-radius: 30px;
            font-weight: bold;
            margin: 20px 0;
            text-align: center;
            font-size: 16px;
          }
          
          .email-footer {
            background: #E5E7EB;
            padding: 20px;
            text-align: center;
            color: #060675;
            font-size: 12px;
          }
          
          @media screen and (max-width: 600px) {
            .email-container {
              width: 100% !important;
              border-radius: 0 !important;
            }
            .email-header, .email-body, .email-footer {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            .logo-img {
              width: 150px !important;
            }
            h1 {
              font-size: 22px !important;
            }
          }
        </style>
      </head>
      <body>
        <table class="email-container" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td class="email-header">
              <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" class="logo-img" />
            </td>
          </tr>
          <tr>
            <td class="email-body">
              <h1>Order #${orderNumber} Update</h1>
              <p>Hello <span class="highlight">${username}</span>,</p>
              <p>We want to inform you about an update to your order status.</p>
              
              <div class="status-card">
                <div class="status-icon">${status.icon}</div>
                <div class="status-title">${status.title}</div>
                <div class="status-message">${status.message}</div>
                
                <div class="status-details">
                  <div class="detail-row">
                    <div class="detail-label">Order Number:</div>
                    <div>#${orderNumber}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">Previous Status:</div>
                    <div>${oldStatus}</div>
                  </div>
                  <div class="detail-row">
                    <div class="detail-label">New Status:</div>
                    <div><strong>${newStatus}</strong></div>
                  </div>
                  ${trackingNumber ? `
                  <div class="detail-row">
                    <div class="detail-label">Tracking Number:</div>
                    <div><strong>${trackingNumber}</strong></div>
                  </div>
                  ` : ''}
                </div>
              </div>
              
              ${newStatus === 'shipped' ? `
              <p>Your order is on its way! You can track your shipment using the tracking number above.</p>
              <p>Expected delivery: Within 3-5 business days</p>
              ` : ''}
              
              ${newStatus === 'delivered' ? `
              <p>We hope you're delighted with your purchase. If you have any questions about your jewelry or need assistance, please don't hesitate to contact us.</p>
              ` : ''}
              
              <div style="text-align: center;">
                <a href="https://jewelsamarth.in/orders" class="cta-button">View Order Details</a>
              </div>
              
              <p>If you have any questions about this update, please contact our customer service team at <a href="mailto:support@jewelsamarth.in" style="color: #060675; font-weight: bold;">support@jewelsamarth.in</a>.</p>
            </td>
          </tr>
          <tr>
            <td class="email-footer">
              © ${year} Jewel Samarth - Crafting Dreams into Reality
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
};

// Helper function to send emails
const sendOrderEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
      to,
      subject,
      html,
      text: subject // Fallback text content
    });
  } catch (error) {
    console.error('Error sending order email:', error);
  }
};

// Order Controller Methods
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

    // Validate required fields
    const requiredFields = [
      'userId', 'firstName', 'lastName', 'phone', 'pincode', 
      'address', 'city', 'state', 'email', 'products', 
      'totalAmt', 'finalAmt', 'paymentMethod'
    ];
    
    const missingFields = requiredFields.filter(field => !req.body[field]);
    
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missingFields.join(', ')}`
      });
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: finalAmt * 100, // Amount in paise
      currency: "INR",
      receipt: `JSO_${Date.now()}_${crypto.randomBytes(10).toString("hex")}`,
      payment_capture: 1,
    });

    // Generate order number (10001, 10002, etc.)
    const totalOrders = await Order.countDocuments();
    const newOrderNumber = 10001 + totalOrders;

    // Create new order
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
      products: products.map(p => ({
        productId: p.productId,
        name: p.name,
        price: p.price,
        quantity: p.quantity,
        size: p.size,
        image: p.image
      })),
      totalAmt,
      discount,
      finalAmt,
      paymentMethod,
      razorpayOrderId: razorpayOrder.id,
      status: "pending",
      orderNumber: newOrderNumber,
    });

    await newOrder.save();

    // Clear user's cart
    await Cart.findOneAndDelete({ userId });

    // Send order confirmation email
    const emailHtml = emailTemplates.orderConfirmation(
      firstName,
      newOrderNumber,
      newOrder.createdAt,
      products,
      totalAmt,
      finalAmt
    );
    
    await sendOrderEmail(
      email,
      `Your Jewel Samarth Order #${newOrderNumber} - Confirmation`,
      emailHtml
    );

    res.status(201).json({
      success: true,
      message: "Order created successfully",
      order: newOrder,
      razorpayOrder,
    });
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while creating order",
      error: error.message
    });
  }
};

const verifyPaymentController = async (req, res) => {
  try {
    const { order_id, payment_id, signature, userId } = req.body;
    
    // Validate payment signature
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET_ID)
      .update(`${order_id}|${payment_id}`)
      .digest("hex");
      
    if (generatedSignature !== signature) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed - invalid signature"
      });
    }

    // Update order payment status
    const order = await Order.findOneAndUpdate(
      { razorpayOrderId: order_id, userId },
      { 
        paymentId: payment_id, 
        paymentStatus: "paid",
        status: "processing" // Move to next status
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
    const emailHtml = emailTemplates.orderStatusUpdate(
      order.firstName,
      order.orderNumber,
      "pending",
      "processing"
    );
    
    await sendOrderEmail(
      order.email,
      `Payment Received for Order #${order.orderNumber}`,
      emailHtml
    );

    res.json({
      success: true,
      message: "Payment verified successfully",
      order
    });
  } catch (error) {
    console.error('Payment verification error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while verifying payment",
      error: error.message
    });
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status, trackingNumber } = req.body;
    
    // Validate status
    const validStatuses = ['processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status"
      });
    }

    // Find and update order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found"
      });
    }

    const oldStatus = order.status;
    order.status = status;
    
    if (status === 'shipped' && trackingNumber) {
      order.trackingNumber = trackingNumber;
    }
    
    await order.save();

    // Send status update email
    const emailHtml = emailTemplates.orderStatusUpdate(
      order.firstName,
      order.orderNumber,
      oldStatus,
      status,
      status === 'shipped' ? order.trackingNumber : null
    );
    
    await sendOrderEmail(
      order.email,
      `Order #${order.orderNumber} Status Update - ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      emailHtml
    );

    res.json({
      success: true,
      message: `Order status updated to ${status}`,
      order
    });
  } catch (error) {
    console.error('Status update error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while updating order status",
      error: error.message
    });
  }
};

// Other controller methods (coupon, get orders, etc.)
const couponController = async (req, res) => {
  try {
    const { couponCode } = req.body;

    if (!couponCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required"
      });
    }

    const coupon = await Coupon.findOne({ 
      code: couponCode.toUpperCase(),
      isActive: true
    });

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or expired coupon code"
      });
    }

    if (new Date() > new Date(coupon.expiryDate)) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired"
      });
    }

    res.json({
      success: true,
      discount: coupon.discount,
      couponType: coupon.type,
      couponId: coupon._id
    });
  } catch (error) {
    console.error('Coupon validation error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while validating coupon",
      error: error.message
    });
  }
};

const getOrderDetailsController = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('products.productId', 'name images');
      
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
    console.error('Order details error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching order details",
      error: error.message
    });
  }
};

const getAllOrdersController = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    
    const query = {};
    if (status) query.status = status;
    
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
      
    const totalOrders = await Order.countDocuments(query);

    res.json({
      success: true,
      orders,
      total: totalOrders,
      page: parseInt(page),
      pages: Math.ceil(totalOrders / limit)
    });
  } catch (error) {
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching orders",
      error: error.message
    });
  }
};

const getAllOrderDetailsController = async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "User ID is required"
      });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .populate('products.productId', 'name images');

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('User orders error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while fetching user orders",
      error: error.message
    });
  }
};

const deleteOrderController = async (req, res) => {
  try {
    const { orderId } = req.params;
    
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
    console.error('Delete order error:', error);
    res.status(500).json({
      success: false,
      message: "Error occurred while deleting order",
      error: error.message
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