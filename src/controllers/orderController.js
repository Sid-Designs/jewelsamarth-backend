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

// Email Templates with the exact same design style as provided
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
    `
    ).join("");

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
          
          p {
            font-size: 16px;
            line-height: 1.5;
            margin: 0 0 20px 0;
            text-align: center;
          }
          
          .highlight {
            color: #fecc32;
            font-weight: bold;
          }
          
          .order-details {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .order-details th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .order-details td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .total-row {
            font-weight: bold;
            background-color: #f9fafb;
          }
          
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
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
                    <h1>Your Order is Confirmed!</h1>
                    <p>
                      Thank you for your order, <span class="highlight">${orderDetails.firstName}</span>! 
                      We've received your order #${orderDetails.orderNumber} and it's now being processed.
                    </p>
                    
                    <table class="order-details">
                      <tr>
                        <th colspan="2">Order Summary</th>
                      </tr>
                      ${productsList}
                      <tr class="total-row">
                        <td>Subtotal</td>
                        <td style="text-align: right;">₹${orderDetails.totalAmt}</td>
                      </tr>
                      <tr class="total-row">
                        <td>Discount</td>
                        <td style="text-align: right;">-₹${orderDetails.discount || 0}</td>
                      </tr>
                      <tr class="total-row">
                        <td>Total</td>
                        <td style="text-align: right;">₹${orderDetails.finalAmt}</td>
                      </tr>
                    </table>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <span class="status-badge">Payment Pending</span>
                      <p style="font-size: 14px; margin-top: 10px;">
                        Please complete your payment to proceed with order processing.
                      </p>
                    </div>
                    
                    <div style="text-align: center;">
                      <a href="https://jewelsamarth.in/orders/${orderDetails._id}" class="button">View Order Details</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666666; text-align: center;">
                      We'll send you another email when your order ships. For any questions, contact us at 
                      <a href="mailto:support@jewelsamarth.in" style="color: #060675; text-decoration: none;">support@jewelsamarth.in</a>
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
          /* Same styles as orderCreated template */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; margin-top: 10px!important; margin-bottom: 10px!important;}
          
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
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
            text-align: center;
          }
          
          .highlight {
            color: #fecc32;
            font-weight: bold;
          }
          
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            background-color: #10b981;
            color: white;
          }
          
          .payment-details {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
          }
          
          .payment-details th {
            background-color: #f3f4f6;
            padding: 10px;
            text-align: left;
            border-bottom: 1px solid #e5e7eb;
          }
          
          .payment-details td {
            padding: 10px;
            border-bottom: 1px solid #e5e7eb;
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
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
                    <h1>Payment Successful!</h1>
                    <p>
                      Thank you for your payment, <span class="highlight">${orderDetails.firstName}</span>! 
                      Your order #${orderDetails.orderNumber} is now being processed.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <span class="status-badge">Payment Received</span>
                      <p style="font-size: 14px; margin-top: 10px;">
                        We've successfully received your payment of ₹${orderDetails.finalAmt}.
                      </p>
                    </div>
                    
                    <table class="payment-details">
                      <tr>
                        <th colspan="2">Payment Details</th>
                      </tr>
                      <tr>
                        <td>Order Number</td>
                        <td>#${orderDetails.orderNumber}</td>
                      </tr>
                      <tr>
                        <td>Payment Method</td>
                        <td>${orderDetails.paymentMethod}</td>
                      </tr>
                      <tr>
                        <td>Payment ID</td>
                        <td>${orderDetails.payment_id}</td>
                      </tr>
                      <tr>
                        <td>Amount Paid</td>
                        <td>₹${orderDetails.finalAmt}</td>
                      </tr>
                      <tr>
                        <td>Payment Date</td>
                        <td>${new Date().toLocaleDateString()}</td>
                      </tr>
                    </table>
                    
                    <div style="text-align: center;">
                      <a href="https://jewelsamarth.in/orders/${orderDetails._id}" class="button">Track Your Order</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666666; text-align: center;">
                      We'll notify you when your order ships. For any questions, contact us at 
                      <a href="mailto:support@jewelsamarth.in" style="color: #060675; text-decoration: none;">support@jewelsamarth.in</a>
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

  statusUpdate: (orderDetails, newStatus) => {
    const year = new Date().getFullYear();
    const statusMessages = {
      processing: "Your order is being prepared for shipment.",
      shipped: "Your order has been shipped and is on its way to you!",
      delivered: "Your order has been successfully delivered.",
      cancelled: "Your order has been cancelled as per your request.",
    };

    const statusColors = {
      processing: "#f59e0b",
      shipped: "#3b82f6",
      delivered: "#10b981",
      cancelled: "#ef4444",
    };

    return `
      <!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
      <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Order Status Update | Jewel Samarth</title>
        <style type="text/css">
          /* Same styles as previous templates */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; margin-top: 10px!important; margin-bottom: 10px!important;}
          
          a[x-apple-data-detectors] {
            color: inherit !important;
            text-decoration: none !important;
            font-size: inherit !important;
            font-family: inherit !important;
            font-weight: inherit !important;
            line-height: inherit !important;
          }
          
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
            text-align: center;
          }
          
          .highlight {
            color: #fecc32;
            font-weight: bold;
          }
          
          .status-badge {
            display: inline-block;
            padding: 5px 10px;
            border-radius: 20px;
            font-size: 12px;
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
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333;">
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
                    <h1>Order Status Updated</h1>
                    <p>
                      Hello <span class="highlight">${orderDetails.firstName}</span>, 
                      the status of your order #${orderDetails.orderNumber} has been updated.
                    </p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                      <span class="status-badge">${newStatus}</span>
                      <p style="font-size: 14px; margin-top: 10px;">
                        ${statusMessages[newStatus]}
                      </p>
                    </div>
                    
                    <div style="text-align: center;">
                      <a href="https://jewelsamarth.in/orders/${orderDetails._id}" class="button">View Order Details</a>
                    </div>
                    
                    <p style="font-size: 14px; color: #666666; text-align: center;">
                      For any questions about your order, please contact us at 
                      <a href="mailto:support@jewelsamarth.in" style="color: #060675; text-decoration: none;">support@jewelsamarth.in</a>
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