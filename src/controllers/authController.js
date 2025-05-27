const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodeMailer");

// Professional Email Templates with Gmail-compatible styling
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
          /* Client-specific styles */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          /* Reset styles */
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
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
            background-color: #f7f7f7;
          }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          
          .header {
            background: #060675;
            padding: 30px 20px;
            text-align: center;
          }
          
          .logo {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            padding: 10px 20px;
            background-color: #ffffff;
            color: #060675;
            border-radius: 8px;
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
            background: #060675;
            padding: 20px;
            text-align: center;
            color: #ffffff;
            font-size: 12px;
          }
          
          /* Responsive styles */
          @media screen and (max-width: 600px) {
            .container {
              width: 100% !important;
            }
            .header, .content, .footer {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; background-color: #f7f7f7;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" valign="top">
              <table class="container" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                  <td class="header">
                    <a href="https://jewelsamarth.in" class="logo">JEWEL SAMARTH</a>
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
          /* Client-specific styles */
          body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
          table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
          img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
          
          /* Reset styles */
          body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
          
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
            background-color: #f7f7f7;
          }
          
          .container {
            width: 100%;
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
          }
          
          .header {
            background: #060675;
            padding: 30px 20px;
            text-align: center;
          }
          
          .logo {
            color: #ffffff;
            font-size: 24px;
            font-weight: bold;
            text-decoration: none;
            display: inline-block;
            padding: 10px 20px;
            background-color: #ffffff;
            color: #060675;
            border-radius: 8px;
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
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
          }
          
          .security-title {
            color: #10b981;
            font-weight: bold;
            margin-bottom: 10px;
          }
          
          .footer {
            background: #060675;
            padding: 20px;
            text-align: center;
            color: #ffffff;
            font-size: 12px;
          }
          
          /* Responsive styles */
          @media screen and (max-width: 600px) {
            .container {
              width: 100% !important;
            }
            .header, .content, .footer {
              padding-left: 15px !important;
              padding-right: 15px !important;
            }
            .otp-code {
              font-size: 28px !important;
              letter-spacing: 3px !important;
            }
          }
        </style>
      </head>
      <body style="margin: 0; padding: 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333333; background-color: #f7f7f7;">
        <table border="0" cellpadding="0" cellspacing="0" width="100%">
          <tr>
            <td align="center" valign="top">
              <table class="container" border="0" cellpadding="0" cellspacing="0" width="600">
                <tr>
                  <td class="header">
                    <a href="https://jewelsamarth.in" class="logo">JEWEL SAMARTH</a>
                  </td>
                </tr>
                <tr>
                  <td class="content">
                    <h1>Account Verification Code</h1>
                    <p>
                      Hello <span class="highlight">${username || 'Valued Customer'}</span>,<br>
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

// Register Controller
const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Please provide all required fields"
    });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists"
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
      username, 
      email, 
      password: hashedPassword 
    });
    
    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4d"
    });

    // Send welcome email
    try {
      await transporter.sendMail({
        from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
        to: email,
        subject: "Welcome to Jewel Samarth! ✨",
        html: emailTemplates.welcome(username),
        text: `Welcome to Jewel Samarth, ${username}!\n\nWe're thrilled to have you join our exclusive family of jewelry enthusiasts. Your journey into the world of exquisite craftsmanship and timeless elegance begins now.\n\nVisit us at: https://jewelsamarth.in`
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
    }

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: {
        id: newUser._id,
        username,
        email,
        isAccountVerified: false
      }
    });

  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({
      success: false,
      message: "Registration failed",
      error: error.message
    });
  }
};

// Login Controller
const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password are required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials"
      });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4d"
    });

    return res.json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        isAccountVerified: user.isAccountVerified
      }
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
      error: error.message
    });
  }
};

// Logout Controller
const logoutController = (req, res) => {
  res.clearCookie("token");
  return res.json({
    success: true,
    message: "Logged out successfully"
  });
};

// Send Verification OTP Controller
const sendVerifyOtpController = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.isAccountVerified) {
      return res.json({
        success: false,
        message: "Account already verified"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send OTP email
    await transporter.sendMail({
      from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
      to: user.email,
      subject: "🔐 Verify Your Jewel Samarth Account",
      html: emailTemplates.otp(user.username, otp),
      text: `Your Jewel Samarth verification code is: ${otp}\n\nThis code will expire in 10 minutes. Please enter it on our website to verify your account.\n\nIf you didn't request this code, please contact our support team immediately.`
    });

    return res.json({
      success: true,
      message: "Verification OTP sent"
    });

  } catch (error) {
    console.error("OTP sending error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
      error: error.message
    });
  }
};

// Verify OTP Controller
const verifyOtpController = async (req, res) => {
  const { userId, otp } = req.body;

  if (!userId || !otp) {
    return res.status(400).json({
      success: false,
      message: "User ID and OTP are required"
    });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.verifyOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > user.verifyOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    user.isAccountVerified = true;
    user.verifyOtp = null;
    user.verifyOtpExpireAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Account verified successfully"
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message
    });
  }
};

// Reset Password OTP Controller
const resetOtpController = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Email is required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.resetOtpExpireAt = Date.now() + 600000; // 10 minutes
    await user.save();

    // Send password reset OTP
    await transporter.sendMail({
      from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
      to: user.email,
      subject: "🔒 Password Reset Code - Jewel Samarth",
      html: emailTemplates.otp(user.username, otp),
      text: `Your Jewel Samarth password reset code is: ${otp}\n\nThis code will expire in 10 minutes. Please enter it on our website to reset your password.\n\nIf you didn't request this code, please contact our support team immediately.`
    });

    return res.json({
      success: true,
      message: "Password reset OTP sent"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send reset OTP",
      error: error.message
    });
  }
};

// Verify Reset OTP Controller
const verifyResetOtpController = async (req, res) => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    return res.status(400).json({
      success: false,
      message: "Email and OTP are required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > user.resetOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    return res.json({
      success: true,
      message: "OTP verified"
    });

  } catch (error) {
    console.error("OTP verification error:", error);
    return res.status(500).json({
      success: false,
      message: "OTP verification failed",
      error: error.message
    });
  }
};

// Reset Password Controller
const resetPasswordController = async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({
      success: false,
      message: "All fields are required"
    });
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    if (user.resetOtp !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP"
      });
    }

    if (Date.now() > user.resetOtpExpireAt) {
      return res.status(400).json({
        success: false,
        message: "OTP expired"
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetOtp = null;
    user.resetOtpExpireAt = null;
    await user.save();

    return res.json({
      success: true,
      message: "Password reset successful"
    });

  } catch (error) {
    console.error("Password reset error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
      error: error.message
    });
  }
};

// Account Verification Check Controller
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

module.exports = {
  registerController,
  loginController,
  logoutController,
  sendVerifyOtpController,
  verifyOtpController,
  resetOtpController,
  verifyResetOtpController,
  resetPasswordController,
  isAccountVerified
};