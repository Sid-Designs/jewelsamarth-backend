const User = require("../models/userModel");

const registerController = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({username, email, password});
    await newUser.save();
    res.json({ message: "User Registered Successfully", user: newUser });
  } catch (err) {
    res.json({ message: "Error Occured While Registering User", error: err.message });
  }
};

module.exports = registerController;
