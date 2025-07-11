const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodeMailer");
const crypto = require("crypto");

// Email Templates
const emailTemplates = {
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
          
          .features {
            margin: 30px 0;
          }
          
          .feature {
            text-align: center;
            padding: 15px;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            margin-bottom: 15px;
          }
          
          .feature-icon {
            font-size: 24px;
            margin-bottom: 10px;
          }
          
          .feature-title {
            font-weight: bold;
            margin-bottom: 5px;
          }
          
          .footer {
            background: #E5E7EB;
            padding: 20px;
            text-align: center;
            color: #060675;
            font-size: 12px;
            margin-bottom: 20px;
          }
          
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
                    <h1>Welcome to Jewel Samarth!</h1>
                    <p>
                      Hello <span class="highlight">${username}</span>,
                    </p>
                    <p>
                      We're absolutely thrilled to have you join our exclusive family of jewelry enthusiasts! 
                      Your journey into the world of exquisite craftsmanship and timeless elegance begins now.
                    </p>
                    
                    <div style="text-align: center;">
                      <a href="https://jewelsamarth.in" class="button" style="color: #060675; text-decoration: none;">
                        Explore Our Collections
                      </a>
                    </div>
                    
                    <div class="features">
                      <table width="100%" border="0" cellpadding="0" cellspacing="0">
                        <tr>
                          <td width="33%" valign="top" class="feature">
                            <div class="feature-icon">💎</div>
                            <div class="feature-title">Premium Quality</div>
                            <div>Handcrafted jewelry with finest materials</div>
                          </td>
                          <td width="33%" valign="top" class="feature">
                            <div class="feature-icon">🚚</div>
                            <div class="feature-title">Free Shipping</div>
                            <div>Complimentary delivery on all orders</div>
                          </td>
                          <td width="33%" valign="top" class="feature">
                            <div class="feature-icon">🛡️</div>
                            <div class="feature-title">Lifetime Warranty</div>
                            <div>Protected investment with our guarantee</div>
                          </td>
                        </tr>
                      </table>
                    </div>
                    
                    <p style="font-size: 14px; color: #666666;">
                      <strong>💫 What's Next?</strong><br>
                      Follow us for exclusive offers, new arrivals, and jewelry care tips.<br>
                      Get ready to discover pieces that tell your unique story.
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
          
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; margin-top: 10px!important; margin-bottom: 10px!important; box-shadow: 0 0 1px 0 rgba(0, 0, 0, 0.15), 0 6px 12px 0 rgba(0, 0, 0, 0.15);}
          
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
            border: 1px solid #E5E7EB;
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
          
          .otp-box {
            background-color: #f9f9f9;
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
            background-color: #f59e0b;
            color: #ffffff;
            padding: 8px 15px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            margin: 10px 0;
          }
          
          .security-note {
            background-color: #f0f9f0;
            border: 1px solid #d0e8d0;
            border-radius: 20px;
            padding: 15px;
            margin: 20px 0;
          }
          
          .security-title {
            color: #10b981;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .footer {
            color: #060675;
            padding: 20px;
            text-align: center;
            background: #E5E7EB;
            font-size: 12px;
          }
          
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
            .otp-code {
              font-size: 28px !important;
              letter-spacing: 3px !important;
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
                    <h1>Account Verification Code</h1>
                    <p>
                      Hello <span class="highlight">${username || "Valued Customer"}</span>,<br>
                      Please use the following verification code to complete your secure login:
                    </p>
                    
                    <div class="otp-box">
                      <div style="font-size: 12px; color: #666666; margin-bottom: 10px;">VERIFICATION CODE</div>
                      <div class="otp-code">${otp}</div>
                      <div class="expire-badge">Expires in 10 minutes</div>
                      <div style="font-size: 12px; color: #666666; margin-top: 10px;">Please enter this code on our website to verify your account.</div>
                    </div>
                    
                    <div class="security-note">
                      <div class="security-title">Security Notice</div>
                      <p style="font-size: 14px; color: #333333; margin: 0;">
                        For your protection, never share this verification code with anyone. Jewel Samarth will never ask for your verification code via phone, email, or text message. If you didn't request this code, please secure your account immediately.
                      </p>
                    </div>
                    
                    <p style="font-size: 14px; color: #666666;">
                      Need assistance? Our team is here to help<br>
                      <a href="mailto:support@jewelsamarth.in" style="color: #060675; text-decoration: none; font-weight: bold;">support@jewelsamarth.in</a>
                    </p>
                  </td>
                </tr>
                <tr>
                  <td class="footer">
                    © ${year} Jewel Samarth. All rights reserved.
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
const sendEmail = async (to, subject, html, text = "") => {
  try {
    await transporter.sendMail({
      from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
      to,
      subject,
      html,
      text: text || subject
    });
    return true;
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
};

const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required details: username, email, and password",
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4d",
    });

    // Send welcome email (don't block response if it fails)
    sendEmail(
      email,
      "Welcome to Jewel Samarth! ✨",
      emailTemplates.welcome(username),
      `Welcome to Jewel Samarth, ${username}!\n\nWe're thrilled to have you join our exclusive family of jewelry enthusiasts.`
    );

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAccountVerified: newUser.isAccountVerified || false,
      },
    });
  } catch (error) {
    console.error("Error during registration:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred during registration",
      error: error.message,
    });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ success: false, message: "Invalid Credentials" });
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4d",
    });

    return res.json({
      success: true,
      message: "Logged In Successfully",
      username: user.username,
      email: user.email,
      auth: user.isAccountVerified,
      token,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Error Occurred While Logging In",
      error: err.message,
    });
  }
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("token", { httpOnly: true, secure: true });
    return res.json({ success: true, message: "Logged Out Successfully" });
  } catch (err) {
    res.json({
      success: false,
      message: "Error Occurred While Logging Out",
      error: err.message,
    });
  }
};

const sendVerifyOtpController = async (req, res) => {
  try {
    const { userId } = req.body;
    if (!userId) {
      return res.status(400).json({ 
        success: false, 
        message: "User ID is required" 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: "User not found" 
      });
    }

    if (user.isAccountVerified) {
      return res.status(400).json({ 
        success: false, 
        message: "Account is already verified" 
      });
    }

    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    console.log(`Generated OTP for ${user.email}: ${otp}`);

    // Send OTP email
    const emailSent = await sendEmail(
      user.email,
      "🔐 Verify Your Jewel Samarth Account",
      emailTemplates.otp(user.username, otp),
      `Your verification code is: ${otp}\nExpires in 10 minutes.`
    );

    if (!emailSent) {
      // Clear OTP if email fails
      user.verifyOtp = "";
      user.verifyOtpExpireAt = 0;
      await user.save();
      
      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    return res.json({
      success: true,
      message: "Verification OTP sent successfully",
    });
  } catch (error) {
    console.error("Error in sendVerifyOtpController:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const verifyOtpController = async (req, res) => {
  const { userId, otp } = req.body;
  if (!userId || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    if (user.verifyOtp === "" || user.verifyOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.verifyOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    user.isAccountVerified = true;
    user.verifyOtp = "";
    user.verifyOtpExpireAt = 0;
    await user.save();
    return res.json({
      success: true,
      message: "Account Verified Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error Occurred While Verifying OTP",
      error: error.message,
    });
  }
};

const isAccountVerified = async (req, res) => {
  try {
    return res.json({
      success: true,
      message: "Account Verified Successfully",
    });
  } catch (err) {
    res.json({
      success: false,
      error: err.message,
    });
  }
};

const resetOtpController = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    await user.save();

    // Send password reset OTP
    const emailSent = await sendEmail(
      user.email,
      "🔒 Password Reset Code - Jewel Samarth",
      emailTemplates.otp(user.username, otp),
      `Your Jewel Samarth password reset code is: ${otp}\nExpires in 10 minutes.`
    );

    if (!emailSent) {
      // Clear OTP if email fails
      user.resetOtp = "";
      user.resetOtpExpireAt = 0;
      await user.save();
      
      return res.json({
        success: false,
        message: "Failed to send OTP email",
      });
    }

    return res.json({
      success: true,
      message: "Reset OTP Sent Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error Occurred While Sending OTP",
      error: error.message,
    });
  }
};

const verifyResetOtpController = async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }
    return res.json({
      success: true,
      message: "OTP Verified Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error Occurred While Verifying OTP",
      error: error.message,
    });
  }
};

const resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Not Found" });
    }
    if (user.resetOtp === "" || user.resetOtp !== otp) {
      return res.json({ success: false, message: "Invalid OTP" });
    }
    if (user.resetOtpExpireAt < Date.now()) {
      return res.json({ success: false, message: "OTP Expired" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = "";
    user.resetOtpExpireAt = 0;
    await user.save();

    return res.json({
      success: true,
      message: "Password Reset Successfully",
    });
  } catch (error) {
    return res.json({
      success: false,
      message: "Error Occurred While Resetting Password",
      error: error.message,
    });
  }
};

module.exports = {
  registerController,
  loginController,
  logoutController,
  sendVerifyOtpController,
  verifyOtpController,
  isAccountVerified,
  resetOtpController,
  resetPasswordController,
  verifyResetOtpController,
};