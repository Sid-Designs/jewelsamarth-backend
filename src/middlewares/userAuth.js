const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const { token } = req.cookies;
  if (!token) {
    res.json({ success: false, message: "User Not Authenticated" });
  }
  try {
    const decodeToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodeToken.id) {
      req.body.userId = decodeToken.id;
    } else {
      return res.json({ success: false, message: "User Not Authenticated" });
    }
    next();
  } catch (error) {
    res.json({ success: false, message: "User Not Authenticated" });
  }
};

module.exports = userAuth;
