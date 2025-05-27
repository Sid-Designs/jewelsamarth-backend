const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodeMailer");

// Modern Email Templates
const emailTemplates = {
  welcome: (username) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        :root {
          --primary: #fecc32;
          --secondary: #060675;
          --text: #333333;
          --light-bg: #f8f9fa;
          --white: #ffffff;
          --gray: #6b7280;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: var(--text);
          max-width: 600px;
          margin: 0 auto;
          background-color: var(--light-bg);
          padding: 20px;
        }
        .email-container {
          background: linear-gradient(135deg, var(--white) 0%, #fafbfc 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(6, 6, 117, 0.1), 0 1px 3px rgba(0,0,0,0.05);
        }
        .header {
          background: linear-gradient(135deg, var(--secondary) 0%, #0a0a8a 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 10px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.1;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: 15px;
          left: 30px;
          width: 30px;
          height: 30px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.15;
        }
        .logo {
          max-width: 180px;
          height: auto;
          filter: brightness(0) invert(1);
        }
        .content {
          padding: 40px 30px;
        }
        .welcome-box {
          background: linear-gradient(135deg, rgba(254, 204, 50, 0.15) 0%, rgba(254, 204, 50, 0.05) 100%);
          border-radius: 20px;
          padding: 30px;
          margin-bottom: 30px;
          border: 2px solid rgba(254, 204, 50, 0.2);
        }
        h1 {
          color: var(--secondary);
          margin: 0 0 20px 0;
          font-size: 28px;
          font-weight: 700;
          text-align: center;
        }
        .username {
          color: var(--secondary);
          font-weight: 600;
        }
        .cta-button {
          display: inline-block;
          background: linear-gradient(135deg, var(--primary) 0%, #ffd700 100%);
          color: var(--secondary) !important;
          padding: 16px 40px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 8px 25px rgba(254, 204, 50, 0.4);
          transition: all 0.3s ease;
        }
        .cta-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 30px rgba(254, 204, 50, 0.5);
        }
        .info-box {
          background: var(--light-bg);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          border: 1px solid rgba(254, 204, 50, 0.1);
        }
        .footer {
          background: linear-gradient(135deg, var(--secondary) 0%, #0a0a8a 100%);
          padding: 25px;
          text-align: center;
        }
        .footer p {
          color: var(--white);
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        /* Mobile Responsive */
        @media (max-width: 600px) {
          body { padding: 10px; }
          .content { padding: 20px; }
          .welcome-box { padding: 20px; }
          h1 { font-size: 24px; }
          .cta-button { padding: 14px 30px; font-size: 14px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748376796/JewelSamarth_Logo_cluva5.png" alt="Jewel Samarth" class="logo">
        </div>
        <div class="content">
          <div class="welcome-box">
            <h1>Welcome to Jewel Samarth! ✨</h1>
            <p style="font-size: 18px; text-align: center; margin: 0 0 15px 0; color: var(--text);">
              Hello <span class="username">${username}</span>,
            </p>
            <p style="font-size: 16px; text-align: center; line-height: 1.7; margin: 0 0 25px 0; color: var(--text);">
              We're absolutely thrilled to have you join our exclusive family of jewelry enthusiasts! 
              Your journey into the world of exquisite craftsmanship begins now.
            </p>
          </div>
          
          <div style="text-align: center; margin-bottom: 30px;">
            <a href="https://jewelsamarth.in" class="cta-button">
              🛍️ Explore Our Collections
            </a>
          </div>
          
          <div class="info-box">
            <p style="margin: 0; font-size: 14px; color: var(--gray); line-height: 1.6;">
              💎 Follow us for the latest updates and exclusive offers.<br>
              Get ready to discover timeless elegance and modern sophistication.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jewel Samarth - Crafting Dreams into Reality</p>
        </div>
      </div>
    </body>
    </html>
  `,

  otp: (username, otp) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        :root {
          --primary: #fecc32;
          --secondary: #060675;
          --text: #333333;
          --light-bg: #f8f9fa;
          --white: #ffffff;
          --gray: #6b7280;
        }
        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: var(--text);
          max-width: 600px;
          margin: 0 auto;
          background-color: var(--light-bg);
          padding: 20px;
        }
        .email-container {
          background: linear-gradient(135deg, var(--white) 0%, #fafbfc 100%);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(6, 6, 117, 0.1), 0 1px 3px rgba(0,0,0,0.05);
        }
        .header {
          background: linear-gradient(135deg, var(--secondary) 0%, #0a0a8a 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
        }
        .header::before {
          content: '';
          position: absolute;
          top: 10px;
          right: 20px;
          width: 60px;
          height: 60px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.1;
        }
        .logo {
          max-width: 180px;
          height: auto;
          filter: brightness(0) invert(1);
        }
        .content {
          padding: 40px 30px;
        }
        .title {
          color: var(--secondary);
          margin: 0 0 20px 0;
          font-size: 24px;
          font-weight: 700;
          text-align: center;
        }
        .username {
          color: var(--secondary);
          font-weight: 600;
        }
        .otp-box {
          background: linear-gradient(135deg, var(--light-bg) 0%, var(--white) 100%);
          border-radius: 20px;
          padding: 30px;
          text-align: center;
          margin: 30px 0;
          border: 3px solid rgba(254, 204, 50, 0.4);
          position: relative;
          overflow: hidden;
        }
        .otp-box::before {
          content: '';
          position: absolute;
          top: -10px;
          left: -10px;
          width: 40px;
          height: 40px;
          background: var(--primary);
          border-radius: 50%;
          opacity: 0.1;
        }
        .otp-box::after {
          content: '';
          position: absolute;
          bottom: -15px;
          right: -15px;
          width: 60px;
          height: 60px;
          background: var(--secondary);
          border-radius: 50%;
          opacity: 0.05;
        }
        .otp {
          font-size: 42px;
          letter-spacing: 8px;
          color: var(--secondary);
          font-weight: 800;
          margin-bottom: 15px;
          font-family: 'Courier New', Consolas, monospace;
          position: relative;
          z-index: 1;
        }
        .expire-badge {
          background: linear-gradient(135deg, var(--primary) 0%, #ffd700 100%);
          color: var(--secondary);
          padding: 8px 20px;
          border-radius: 50px;
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          position: relative;
          z-index: 1;
        }
        .security-info {
          background: linear-gradient(135deg, rgba(254, 204, 50, 0.1) 0%, rgba(254, 204, 50, 0.05) 100%);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          border: 1px solid rgba(254, 204, 50, 0.2);
        }
        .footer {
          background: linear-gradient(135deg, var(--secondary) 0%, #0a0a8a 100%);
          padding: 25px;
          text-align: center;
        }
        .footer p {
          color: var(--white);
          margin: 0;
          font-size: 14px;
          opacity: 0.9;
        }
        /* Mobile Responsive */
        @media (max-width: 600px) {
          body { padding: 10px; }
          .content { padding: 20px; }
          .otp { font-size: 36px; letter-spacing: 6px; }
          .title { font-size: 20px; }
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://res.cloudinary.com/dplww7z06/image/upload/v1748376796/JewelSamarth_Logo_cluva5.png" alt="Jewel Samarth" class="logo">
        </div>
        <div class="content">
          <div style="text-align: center; margin-bottom: 30px;">
            <h2 class="title">🔐 Your Verification Code</h2>
            <p style="font-size: 16px; margin: 0 0 15px 0; color: var(--text);">
              Hello <span class="username">${username || 'Customer'}</span>,
            </p>
            <p style="font-size: 16px; margin: 0 0 30px 0; color: var(--gray);">
              Use this secure code to verify your account:
            </p>
          </div>
          
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <div class="expire-badge">⏰ Expires in 10 minutes</div>
          </div>
          
          <div class="security-info">
            <p style="margin: 0; font-size: 14px; color: var(--gray); line-height: 1.6;">
              🔒 <strong>Security Notice:</strong> For your protection, never share this code with anyone.<br>
              If you didn't request this verification, please ignore this email and contact our support team.
            </p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jewel Samarth - Secure & Trusted</p>
        </div>
      </div>
    </body>
    </html>
  `
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

    // Send welcome email with modern template
    try {
      await transporter.sendMail({
        from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
        to: email,
        subject: "Welcome to Jewel Samarth! ✨",
        html: emailTemplates.welcome(username)
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

    // Send OTP email with modern template
    await transporter.sendMail({
      from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
      to: user.email,
      subject: "🔐 Verify Your Jewel Samarth Account",
      html: emailTemplates.otp(user.username, otp)
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

    // Send password reset OTP with modern template
    await transporter.sendMail({
      from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
      to: user.email,
      subject: "🔒 Password Reset Code - Jewel Samarth",
      html: emailTemplates.otp(user.username, otp)
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