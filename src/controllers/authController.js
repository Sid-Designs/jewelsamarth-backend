const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const transporter = require("../config/nodeMailer");

const registerController = async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.json({ success: false, message: "Missing Details" });
  }
  try {
    const existUser = await User.findOne({ email });
    if (existUser) {
      return res.json({ success: false, message: "User Already Exists" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4d",
    });

    // Send email
    const mailOptions = {
      from: process.env.SMTP_NO_REPLY_SENDER_EMAIL,
      to: email,
      subject: "Welcome to Jewel Samarth!",
      text: "Hello, welcome to Jewel Samarth! We are glad to have you.",
      html: "<h1>Test Email</h1>",
    };
    await transporter.sendMail(mailOptions);

    return res.json({
      success: true,
      message: "User Registered Successfully",
      token,
      user: newUser,
    });
  } catch (err) {
    return res.json({
      success: false,
      message: "Error Occurred While Registering User",
      error: err.message,
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
      subject: "Account Verification OTP",
      text: "Hello, welcome to Jewel Samarth! We are send 6 Digit OTP.",
      html: `<h1>Test Email</h1><br><h2>Your OTP is: ${otp}</h2>`,
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
