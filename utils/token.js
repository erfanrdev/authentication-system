const jwt = require("jsonwebtoken");
const crypto = require("crypto");
require("dotenv").config();


const generateAccessToken = (userId) => {
  return jwt.sign(
    { userId: userId.toString() },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRES_IN || "15m" }
  );
};

const generateRefreshToken = (userId) => {
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    { userId: userId.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
      jwtid: jti,
    }
  );

  return { token, jti };
};

const hashToken = (token) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
};