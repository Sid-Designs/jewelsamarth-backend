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
      await transporter.sendMail({
        from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
        to: email,
        subject: "Welcome to Jewel Samarth! ✨",
        html: emailTemplates.welcome(username),
        text: `Welcome to Jewel Samarth, ${username}!\n\nWe're thrilled to have you join our exclusive family of jewelry enthusiasts. Your journey into the world of exquisite craftsmanship and timeless elegance begins now.\n\nVisit us at: https://jewelsamarth.in`,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
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
    user.verifyOtpExpireAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    await user.save();

    console.log(`Generated OTP for ${user.email}: ${otp}`);

    try {
      await transporter.sendMail({
        from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
        to: user.email,
        subject: "🔐 Verify Your Jewel Samarth Account",
        html: emailTemplates.otp(user.username, otp),
        text: `Your verification code is: ${otp}\nExpires in 5 minutes.`,
      });

      return res.json({
        success: true,
        message: "Verification OTP sent successfully",
      });
    } catch (emailError) {
      console.error("Failed to send OTP email:", emailError);
      // Optionally: clear the OTP if email fails
      user.verifyOtp = "";
      user.verifyOtpExpireAt = 0;
      await user.save();

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email",
      });
    }
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
    user.resetOtpExpireAt = Date.now() + 5 * 60 * 1000;
    await user.save();
    // Send password reset OTP
    await transporter.sendMail({
      from: `"Jewel Samarth" <${process.env.SMTP_NO_REPLY_SENDER_EMAIL}>`,
      to: user.email,
      subject: "🔒 Password Reset Code - Jewel Samarth",
      html: emailTemplates.otp(user.username, otp),
      text: `Your Jewel Samarth password reset code is: ${otp}\n\nThis code will expire in 10 minutes. Please enter it on our website to reset your password.\n\nIf you didn't request this code, please contact our support team immediately.`,
    });
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
