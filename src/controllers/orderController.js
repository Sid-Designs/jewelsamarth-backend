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

// Email Templates
const emailTemplates = {
  // ... (keep your existing welcome and otp templates)

  orderConfirmation: (username, orderNumber, orderDate, products, totalAmt, finalAmt) => {
    const year = new Date().getFullYear();
    const formattedDate = new Date(orderDate).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    
    const productRows = products.map(product => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: left;">
          ${product.name} (${product.quantity} ${product.quantity > 1 ? 'items' : 'item'})
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #e0e0e0; text-align: right;">
          ₹${product.price * product.quantity}
        </td>
      </tr>
    `).join('');

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Confirmation | Jewel Samarth</title>
        <style type="text/css">
          /* Client-specific styles */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          /* Reset styles */
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; margin-top: 10px!important; margin-bottom: 10px!important;}
          
          /* iOS BLUE LINKS */
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
          /* Main styles */
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15), 0 6px 12px 0 rgba(0, 0, 0, 0.15);
          }
          
          .outer-table {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
          }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            margin-top: 20px;
            background: #E5E7EB;
            padding: 40px 20px;
            text-align: center;
          }
          
          .logo-img {
            width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          
          .content {
            padding: 30px 20px;
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
            font-size: 20px;
            font-weight: bold;
            margin: 20px 0 10px 0;
            text-align: left;
          }
          
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 0 0 20px 0;
            text-align: left;
          }
          
          .highlight {
            color: #fecc32;
            font-weight: bold;
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
            text-align: center;
          }
          
          .order-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .order-table th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            font-weight: bold;
            border-bottom: 2px solid #e5e7eb;
          }
          
          .order-table td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .total-row {
            font-weight: bold;
          }
          
          .footer {
            background: #E5E7EB;
            padding: 20px;
            text-align: center;
            color: #060675;
            font-size: 12px;
            margin-bottom: 20px;
          }
          
          /* Responsive styles */
          @media screen and (max-width: 600px) {
            .outer-table {
              width: 100% !important;
              margin: 10px auto !important;
            }
            .container {
              width: 100% !important;
              border-radius: 0 !important;
            }
            .header, .content, .footer {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            .header {
              padding-top: 30px !important;
              padding-bottom: 30px !important;
            }
            .logo-img {
              width: 150px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15), 0 6px 12px 0 rgba(0, 0, 0, 0.15);">
        <table class="outer-table" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" valign="top">
              <table class="container" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                  <td class="header">
                    <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" class="logo-img" />
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <h1>Thank You For Your Order!</h1>
                    <p>
                      Hello <span class="highlight">${username}</span>,
                    </p>
                    <p>
                      We're delighted to confirm your order #${orderNumber} placed on ${formattedDate}. 
                      Your jewelry is being carefully prepared by our craftsmen.
                    </p>
                    
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
                          <td style="text-align: left;">Total Amount</td>
                          <td style="text-align: right;">₹${totalAmt}</td>
                        </tr>
                        ${finalAmt < totalAmt ? `
                        <tr class="total-row">
                          <td style="text-align: left;">Discount Applied</td>
                          <td style="text-align: right;">-₹${totalAmt - finalAmt}</td>
                        </tr>
                        <tr class="total-row">
                          <td style="text-align: left;">Final Amount</td>
                          <td style="text-align: right;">₹${finalAmt}</td>
                        </tr>
                        ` : ''}
                      </tbody>
                    </table>
                    
                    <p>
                      We'll notify you when your order ships. You can check the status of your order anytime by visiting our website.
                    </p>
                    
                    <div style="text-align: center;">
                      <a href="https://jewelsamarth.in/orders" class="button" style="color: #060675; text-decoration: none;">
                        View Your Order
                      </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666666;">
                      <strong>Need Help?</strong><br>
                      If you have any questions about your order, please contact our customer service team at <a href="mailto:support@jewelsamarth.in" style="color: #060675; text-decoration: none; font-weight: bold;">support@jewelsamarth.in</a>.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    © ${year} Jewel Samarth - Crafting Dreams into Reality
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  },

  orderStatusUpdate: (username, orderNumber, oldStatus, newStatus) => {
    const year = new Date().getFullYear();
    const statusMessages = {
      'processing': 'is being processed by our team',
      'shipped': 'has been shipped',
      'delivered': 'has been delivered',
      'cancelled': 'has been cancelled'
    };
    
    const statusIcons = {
      'processing': '🔄',
      'shipped': '🚚',
      'delivered': '✅',
      'cancelled': '❌'
    };
    
    const actionText = statusMessages[newStatus] || `status has been updated to ${newStatus}`;
    const statusIcon = statusIcons[newStatus] || 'ℹ️';

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Update | Jewel Samarth</title>
        <style type="text/css">
          /* Client-specific styles */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          /* Reset styles */
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; margin-top: 10px!important; margin-bottom: 10px!important;}
          
          /* iOS BLUE LINKS */
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
          /* Main styles */
          body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            color: #333333;
            box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15), 0 6px 12px 0 rgba(0, 0, 0, 0.15);
          }
          
          .outer-table {
            width: 100%;
            max-width: 600px;
            margin: 20px auto;
            border: 1px solid #e5e7eb;
            border-radius: 20px;
          }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          
          .header {
            margin-top: 20px;
            background: #E5E7EB;
            padding: 40px 20px;
            text-align: center;
          }
          
          .logo-img {
            width: 180px;
            height: auto;
            display: block;
            margin: 0 auto;
          }
          
          .content {
            padding: 30px 20px;
          }
          
          h1 {
            color: #060675;
            font-size: 24px;
            font-weight: bold;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 0 0 20px 0;
            text-align: left;
          }
          
          .highlight {
            color: #fecc32;
            font-weight: bold;
          }
          
          .status-box {
            background-color: #f9f9f9;
            border: 1px solid #e0e0e0;
            border-radius: 12px;
            padding: 20px;
            margin: 20px 0;
            text-align: center;
          }
          
          .status-icon {
            font-size: 40px;
            margin-bottom: 15px;
          }
          
          .status-text {
            font-size: 18px;
            font-weight: bold;
            color: #060675;
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
            text-align: center;
          }
          
          .footer {
            background: #E5E7EB;
            padding: 20px;
            text-align: center;
            color: #060675;
            font-size: 12px;
            margin-bottom: 20px;
          }
          
          /* Responsive styles */
          @media screen and (max-width: 600px) {
            .outer-table {
              width: 100% !important;
              margin: 10px auto !important;
            }
            .container {
              width: 100% !important;
              border-radius: 0 !important;
            }
            .header, .content, .footer {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            .header {
              padding-top: 30px !important;
              padding-bottom: 30px !important;
            }
            .logo-img {
              width: 150px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15), 0 6px 12px 0 rgba(0, 0, 0, 0.15);">
        <table class="outer-table" border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" valign="top">
              <table class="container" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                  <td class="header">
                    <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748378717/Jewel_Samarth_Logo_tvtavg.png" alt="Jewel Samarth" class="logo-img" />
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <h1>Your Order Status Has Been Updated</h1>
                    <p>
                      Hello <span class="highlight">${username}</span>,
                    </p>
                    <p>
                      We wanted to inform you about the status of your order #${orderNumber}.
                    </p>
                    
                    <div class="status-box">
                      <div class="status-icon">${statusIcon}</div>
                      <div class="status-text">Your order ${actionText}</div>
                      <div>Previous status: ${oldStatus}</div>
                      <div>New status: ${newStatus}</div>
                    </div>
                    
                    <p>
                      ${newStatus === 'shipped' ? 'Your package is on its way! You can track your shipment using the link provided in your shipping confirmation email.' : ''}
                      ${newStatus === 'delivered' ? 'We hope you love your new jewelry! If you have any questions or need assistance, please don\'t hesitate to contact us.' : ''}
                      ${newStatus === 'cancelled' ? 'If you didn\'t request this cancellation or have any questions, please contact our customer service team immediately.' : ''}
                    </p>
                    
                    <div style="text-align: center;">
                      <a href="https://jewelsamarth.in/orders" class="button" style="color: #060675; text-decoration: none;">
                        View Order Details
                      </a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666666;">
                      <strong>Need Help?</strong><br>
                      Contact our customer service team at <a href="mailto:support@jewelsamarth.in" style="color: #060675; text-decoration: none; font-weight: bold;">support@jewelsamarth.in</a> for any assistance.
                    </p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    © ${year} Jewel Samarth - Crafting Dreams into Reality
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `;
  }
};

// Helper function to send emails
const sendEmail = async (to, subject, html, text) => {
  try {
    await transporter.sendMail({
      from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
      to,
      subject,
      html,
      text
    });
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

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
    const totalOrders = await Order.countDocuments();
    const newOrderNumber = totalOrders + 1 + 10000;

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

    // Clear the user's cart
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
    
    const emailText = `Thank you for your order #${newOrderNumber} from Jewel Samarth. Your order total is ₹${finalAmt}. We'll notify you when your order ships.`;
    
    await sendEmail(email, `Order Confirmation - #${newOrderNumber}`, emailHtml, emailText);

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

const changeOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;
    const order = await Order.findById(orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const oldStatus = order.status;
    order.status = status;
    await order.save();

    // Send status update email
    const emailHtml = emailTemplates.orderStatusUpdate(
      order.firstName,
      order.orderNumber,
      oldStatus,
      status
    );
    
    const emailText = `Your order #${order.orderNumber} status has been updated from ${oldStatus} to ${status}.`;
    
    await sendEmail(order.email, `Order Update - #${order.orderNumber}`, emailHtml, emailText);

    res.json({
      success: true,
      message: `Order is ${status}`,
    });
  } catch (e) {
    res.json({
      success: false,
      message: "Error occurred while updating order status",
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
