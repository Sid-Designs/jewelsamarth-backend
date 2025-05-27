const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodeMailer");

// Email Templates
const emailTemplates = {
  welcome: (username) => `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        :root {
          --primary: #fecc32;
          --secondary: #060675;
          --text: #333333;
          --light-bg: #f8f9fa;
          --white: #ffffff;
        }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: var(--text);
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
        }
        .email-container {
          background: var(--white);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
          background: var(--secondary);
          padding: 30px;
          text-align: center;
        }
        .logo {
          max-width: 180px;
        }
        .content {
          padding: 30px;
        }
        h1 {
          color: var(--secondary);
          margin-top: 0;
        }
        .cta-button {
          display: inline-block;
          background: var(--primary);
          color: var(--secondary);
          padding: 12px 30px;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: var(--secondary);
          padding: 20px;
          text-align: center;
          color: var(--white);
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://jewelsamarth.in/logo.png" alt="Jewel Samarth" class="logo">
        </div>
        <div class="content">
          <h1>Welcome to Jewel Samarth!</h1>
          <p>Hello ${username},</p>
          <p>We're thrilled to have you join our family of jewelry enthusiasts!</p>
          <a href="https://jewelsamarth.in" class="cta-button">Explore Collections</a>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jewel Samarth</p>
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
      <style>
        :root {
          --primary: #fecc32;
          --secondary: #060675;
          --text: #333333;
          --light-bg: #f8f9fa;
          --white: #ffffff;
        }
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: var(--text);
          max-width: 600px;
          margin: 0 auto;
          padding: 0;
        }
        .email-container {
          background: var(--white);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .header {
          background: var(--secondary);
          padding: 30px;
          text-align: center;
        }
        .logo {
          max-width: 180px;
        }
        .content {
          padding: 30px;
        }
        .otp-box {
          background: var(--light-bg);
          border-radius: 15px;
          padding: 20px;
          text-align: center;
          margin: 20px 0;
        }
        .otp {
          font-size: 32px;
          letter-spacing: 5px;
          color: var(--secondary);
          font-weight: bold;
        }
        .footer {
          background: var(--secondary);
          padding: 20px;
          text-align: center;
          color: var(--white);
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <img src="https://jewelsamarth.in/logo.png" alt="Jewel Samarth" class="logo">
        </div>
        <div class="content">
          <h2>Your Verification Code</h2>
          <p>Hello ${username || 'Customer'},</p>
          <p>Use this OTP to verify your account:</p>
          <div class="otp-box">
            <div class="otp">${otp}</div>
            <p>Expires in 10 minutes</p>
          </div>
        </div>
        <div class="footer">
          <p>© ${new Date().getFullYear()} Jewel Samarth</p>
        </div>
      </div>
    </body>
    </html>
  `
};

// Controllers
const authControllers = {
  register: async (req, res) => {
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
          from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
          to: email,
          subject: "Welcome to Jewel Samarth!",
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
  },

  login: async (req, res) => {
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
  },

  logout: (req, res) => {
    res.clearCookie("token");
    return res.json({
      success: true,
      message: "Logged out successfully"
    });
  },

  sendVerificationOtp: async (req, res) => {
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

      await transporter.sendMail({
        from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
        to: user.email,
        subject: "Verify Your Jewel Samarth Account",
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
  },

  verifyOtp: async (req, res) => {
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
  },

  resetPasswordOtp: async (req, res) => {
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

      await transporter.sendMail({
        from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
        to: user.email,
        subject: "Password Reset OTP",
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
  },

  verifyResetOtp: async (req, res) => {
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
  },

  resetPassword: async (req, res) => {
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
  }
};

module.exports = authControllers;