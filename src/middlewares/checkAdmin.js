const jwt = require("jsonwebtoken");

const checkAdmin = async (req, res, next) => {
  const token = req.headers["x-auth-token"] || req.cookies.token;
  if (!token) {
    return res.json({ success: false, message: "User Not Authenticated" , token: token });
  }
  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    console.log(decodedToken);
     next();
  } catch (error) {
    return res.json({
      success: false,
      message: "User Not Authenticated",
      error: error.message,
    });
  }
};

module.exports = checkAdmin;
