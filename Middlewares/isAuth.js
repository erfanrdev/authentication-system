const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports = (req, res, next) => {
  const authHeader = req.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "برای دسترسی به این بخش، ابتدا باید وارد حساب کاربری خود شوید.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET
    );

    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "توکن دسترسی نامعتبر است یا اعتبار آن به پایان رسیده است.",
    });
  }
};