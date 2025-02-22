const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const checkAdmin = async (req, res, next) => {
  const token = req.headers["x-auth-token"] || req.cookies.token;
  if (!token) {
    return res.json({ success: false, message: "User Not Authenticated" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const findUser = await User.findById(decodedToken.id);
    if (!findUser) {
      return res.json({ success: false, message: "User Not Authenticated" });
    }

    if (findUser.role === "admin") {
      return next();
    } else {
      return res.json({ success: false, message: "User Not Authenticated" });
    }
  } catch (error) {
    return res.json({
      success: false,
      message: "User Not Authenticated",
      error: error.message,
    });
  }
};

module.exports = checkAdmin;
