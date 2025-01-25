const express = require("express");
const router = express.Router();
const userAuth = require("../middlewares/userAuth");
const {
  registerController,
  loginController,
  logoutController,
  sendVerifyOtpController,
  verifyOtpController,
  isAccountVerified,
  resetOtpController,
  resetPasswordController,
} = require("../controllers/authController");

router.post("/register", registerController);
router.post("/login", loginController);
router.get("/logout", logoutController);
router.post("/send-verify-otp", userAuth, sendVerifyOtpController);
router.post("/verify-otp", userAuth, verifyOtpController);
router.post("/is-auth", userAuth, isAccountVerified);
router.post("/send-reset-otp", resetOtpController);
router.post("/verify-reset-otp", resetOtpController);
router.post("/reset-password", resetPasswordController);

module.exports = router;
