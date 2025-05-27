const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodeMailer");

const registerController = async (req, res) => {
  const { username, email, password } = req.body;

  // Validate required fields
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: "Missing required details: username, email, and password",
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    // Generate JWT token
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4d", // Token expires in 4 days
    });

    // Attempt to send welcome email
    try {
      const mailOptions = {
        from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
        to: email,
        subject: "Welcome to Jewel Samarth!",
        text: `Hello ${username}, welcome to Jewel Samarth! We are glad to have you.`,
        html: `<h1>Welcome to Jewel Samarth</h1><p>Hello ${username}, we are excited to have you with us!</p>`,
      };

      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      // Log the error but allow registration and login to proceed
    }

    // Auto-login user by returning the token and user details
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAccountVerified: newUser.isAccountVerified || false, // Assuming this field exists
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
    const user = await User.findById(userId);
    if (user.isAccountVerified) {
      return res.json({ success: false, message: "User Not Found" });
    }
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    user.verifyOtp = otp;
    user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
      to: user.email,
      subject: "Your Jewel Samarth Verification Code",
      text: `Your Jewel Samarth verification code is: ${otp}\n\nThis code will expire in 10 minutes.`,
      html: `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; padding: 20px 0; }
        .logo { max-width: 180px; }
        .content { background-color: #f9f9f9; padding: 30px; border-radius: 8px; }
        .otp-container { background: #ffffff; border: 1px dashed #d1d5db; padding: 20px; margin: 25px 0; text-align: center; }
        .otp-code { font-size: 28px; letter-spacing: 3px; color: #111827; font-weight: bold; }
        .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #6b7280; }
        .button { background-color: #b38b59; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <img src="https://jewelsamarth.in/logo.png" alt="Jewel Samarth" class="logo">
      </div>
      
      <div class="content">
        <h2 style="color: #111827;">Hello ${
          user.name || "Valued Customer"
        },</h2>
        <p>Thank you for choosing Jewel Samarth! Please use the following One-Time Password (OTP) to verify your account:</p>
        
        <div class="otp-container">
          <div class="otp-code">${otp}</div>
        </div>
        
        <p style="margin-bottom: 25px;">This code will expire in <strong>10 minutes</strong>. Please do not share this code with anyone.</p>
        
        <p>If you didn't request this code, you can safely ignore this email.</p>
      </div>
      
      <div class="footer">
        <p>© ${new Date().getFullYear()} Jewel Samarth. All rights reserved.</p>
        <p>Jewel Samarth, Mumbai, India</p>
      </div>
    </body>
    </html>
  `,
    };
    
    await transporter.sendMail(mailOptions);
    return res.json({
      success: true,
      message: "Verification OTP Sent Successfully",
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error Occurred While Sending OTP",
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
    user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000;
    await user.save();
    const mailOptions = {
      from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
      to: user.email,
      subject: "Reset Password OTP",
      text: "Hello, welcome to Jewel Samarth! We are send 6 Digit OTP.",
      html: `<h1>Test Email</h1><br><h2>Your OTP is: ${otp}</h2>`,
    };
    await transporter.sendMail(mailOptions);
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
