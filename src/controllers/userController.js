const User = require("../models/userModel");

const userData = async (req, res) => {
  const { userId } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.json({
        success: false,
        message: "User Not Found",
      });
    }
    res.json({
      success: true,
      message: "User Data Fetched Successfully",
      data: {username: user.username, email: user.isAccountVerified},
    });
  } catch (error) {
    res.json({
      success: false,
      message: "Error Occured While Fetching User Data",
      error: error.message,
    });
  }
};

module.exports = userData;
