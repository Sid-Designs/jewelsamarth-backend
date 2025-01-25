const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
  const token = req.headers['x-auth-token'] || req.cookies.token;
  if (!token) {
    return res.json({ success: false, message: "User Not Authenticated" });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (decodedToken.id) {
      req.body.userId = decodedToken.id;
      next();
    } else {
      return res.json({ success: false, message: "User Not Authenticated" });
    }
  } catch (error) {
    return res.json({ success: false, message: "User Not Authenticated", error: error.message });
  }
};

module.exports = userAuth;
