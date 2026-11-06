const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const crypto = require("crypto");
const { validationResult } = require("express-validator");
const RefreshToken = require("../models/refresh-token");
const sendEmail = require("../utils/email");
require("dotenv").config();
const {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
} = require("../utils/token");
const { json } = require("stream/consumers");

exports.postSignup = async (req, res) => {
  const email = req.body.email;
  const name = req.body.name;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: errors.array()[0].msg,
      success: false,
    });
  }

  try {
    crypto.randomBytes(32, async (err, buf) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ success: false, message: "خطا در ایجاد کد تصادفی رخ داد." });
      }

      const token = buf.toString("hex");

      const hashToken = crypto.createHash("sha256").update(token).digest("hex");

      const userDoc = await User.findOne({ email: email });

      if (userDoc) {
        return res.status(400).json({
          success: false,
          message: "این ایمیل قبلاً ثبت شده است.",
        });
      }

      const user = new User({
        email: email,
        name: name,
        password: await bcrypt.hash(password, 12),
        emailVerificationToken: hashToken,
        emailVerificationExpires: Date.now() + 86400000,
      });

      const result = await user.save();

      if (!result) {
        return res.status(400).json({
          success: false,
          message: "خطا در ذخیره اطلاعات کاربر رخ داد.",
        });
      }

      const sendEmailTo = sendEmail({
        html: `<p>تایید کردن ایمیل</p>
          
        ایمیل تا 24 ساعت اعتبار دارد و بعد از آن ایمیل شما درصورت تایید نشدن حذف میشود برای فعال کردن حساب خود روی لینک زیر کلیک کنید:
          <a href="http://localhost:3000/api/auth/email-verify/${token}">فعال سازی حساب</a>`,
        userEmail: req.body.email,
        subject: "فعال سازی ایمیل خود",
      });

      if (!sendEmailTo) {
        return res
          .status(400)
          .json({ success: false, message: "ارسال ایمیل با خطا مواجه شد." });
      }

      return res.status(201).json({
        success: true,
        message:
          "حساب کاربری شما با موفقیت ایجاد شد. لطفاً برای تأیید ایمیل خود، تا ۲۴ ساعت آینده صندوق ورودی ایمیلتان را بررسی کنید.",
      });
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "خطای داخلی سرور رخ داده است." });
  }
};

exports.postSignin = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "ایمیل اشتباه است.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "رمز عبور اشتباه است.",
      });
    }

    if (!user.isEmailVerified) {
      res.status(400).json({
        success: false,
        message:
          "حساب کاربری شما هنوز تأیید نشده است. لطفاً ایمیل خود را بررسی کنید و از طریق لینک ارسال‌شده، حساب خود را فعال کنید.",
      });
    }
    const accessToken = generateAccessToken(user._id);

    const { token: refreshToken, jti } = generateRefreshToken(user._id);

    const decoded = jwt.decode(refreshToken);

    await RefreshToken.create({
      userId: user._id,
      tokenHash: hashToken(refreshToken),
      jti,
      expiresAt: new Date(decoded.exp * 1000),
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "ورود به حساب کاربری با موفقیت انجام شد.",
      accessToken,
      refreshToken: "Saved",
    });
  } catch (err) {
    next(err);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "توکن تمدید اعتبار (Refresh Token) الزامی است.",
      });
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);

    //???????
    const storedToken = await RefreshToken.findOne({
      jti: decoded.jti,
      userId: decoded.userId,
      tokenHash: hashToken(refreshToken),
      revokedAt: null,
    });

    if (!storedToken) {
      return res.status(400).json({
        success: false,
        message: "توکن تمدید اعتبار نامعتبر است یا اعتبار آن لغو شده است.",
      });
    }

    //???????
    const revokedToken = await RefreshToken.findOneAndUpdate(
      {
        _id: storedToken._id,
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      },
      { returnDocument: "after" },
    );

    //????
    if (!revokedToken) {
      return res.status(400).json({
        success: false,
        message: "این توکن تمدید اعتبار قبلاً استفاده شده است.",
      });
    }

    const newAccessToken = generateAccessToken(decoded.userId);

    const { token: newRefreshToken, jti } = generateRefreshToken(
      decoded.userId,
    );

    const newDecoded = jwt.decode(newRefreshToken);

    await RefreshToken.create({
      userId: decoded.userId,
      tokenHash: hashToken(newRefreshToken),
      jti,

      //??????
      expiresAt: new Date(newDecoded.exp * 1000),
    });

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: true,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken,
      refreshToken: "Saved",
    });
  } catch (err) {
    if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
      return res.status(400).json({
        success: false,
        message: "توکن تمدید اعتبار نامعتبر است یا منقضی شده است.",
      });
    }

    next(err);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select(
      "email name role isEmailVerified",
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "کاربر موردنظر یافت نشد.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (err) {
    next(err);
  }
};

exports.postLogout = async (req, res, next) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: "ارسال توکن تمدید اعتبار الزامی است.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      if (
        err.name === "TokenExpiredError" ||
        err.name === "JsonWebTokenError"
      ) {
        return res.status(400).json({
          success: false,
          message: "توکن تمدید اعتبار نامعتبر است یا منقضی شده است.",
        });
      }

      throw err;
    }

    const result = await RefreshToken.findOneAndUpdate(
      {
        jti: decoded.jti,
        userId: decoded.userId,
        tokenHash: hashToken(refreshToken),
        revokedAt: null,
      },
      {
        revokedAt: new Date(),
      },
    );

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "توکن تمدید اعتبار پیدا نشد یا قبلاً باطل شده است.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "خروج از حساب کاربری با موفقیت انجام شد.",
    });
  } catch (err) {
    next(err);
  }
};

exports.postForgotPassword = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        success: false,
      });
    }

    crypto.randomBytes(32, async (err, buf) => {
      if (err) {
        console.log(err);
        return res
          .status(400)
          .json({ success: false, message: "خطا در تولید کد تصادفی رخ داد." });
      }

      const token = buf.toString("hex");

      const hashToken = crypto.createHash("sha256").update(token).digest("hex");

      const user = await User.findOne({ email: req.body.email });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "ایمیل موردنظر در سیستم ثبت نشده است.",
        });
      }

      user.passwordResetToken = hashToken;
      user.passwordResetExpires = Date.now() + 3600000;
      const result = await user.save();

      if (!result) {
        res.status(400).json({
          success: false,
          message:
            "خطا در ذخیره توکن بازیابی رمز عبور یا زمان انقضای آن رخ داد.",
        });
      }

      const sendEmailTo = sendEmail({
        html: `<p>درخواست بازیابی رمز عبور</p>
          
          برای بازیابی رمز عبور روی لینک کلیک کنید:
          <a href="http://localhost:3000/api/auth/forgot-password/${token}">بازیابی رمز</a>`,
        userEmail: req.body.email,
        subject: "بازیابی رمز عبور ",
      });

      if (!sendEmailTo) {
        return res
          .status(400)
          .json({ success: false, message: "ارسال ایمیل با خطا مواجه شد." });
      }

      return res.status(200).json({
        success: true,
        message: "لطفاً صندوق آدرس ایمیل خود را بررسی کنید.",
      });
    });
  } catch (err) {
    console.log(err);
  }
};

exports.postResetPassword = async (req, res) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: errors.array()[0].msg,
        success: false,
      });
    }

    const { newPassword } = req.body;
    const { passwordToken } = req.params;

    if (!newPassword) {
      return res.status(400).json({
        success: false,
        message: "وارد کردن رمز عبور جدید الزامی است.",
      });
    }

    const passwordHashToken = crypto
      .createHash("sha256")
      .update(passwordToken)
      .digest("hex");

    const user = await User.findOne({
      passwordResetToken: passwordHashToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message:
          "لینک بازیابی رمز عبور نامعتبر است یا اعتبار آن به پایان رسیده است.",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;

    const result = await user.save();

    if (!result) {
      return res.status(400).json({
        success: false,
        message: "خطا در ذخیره رمز عبور جدید رخ داد.",
      });
    }

    return res.status(200).json({
      success: true,
      message:
        "رمز عبور شما با موفقیت تغییر کرد. لطفاً برای ورود مجدد به حساب کاربری، به صفحه ورود مراجعه کنید.",
    });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ success: false, message: "خطای داخلی سرور رخ داده است." });
  }
};

exports.postEmailVerify = async (req, res) => {
  const { tokenEmailVerify } = req.params;

  if (!tokenEmailVerify) {
    return res.status(400).json({ success: false, message: "توکن ارسال نشده است." });
  }

  const hashTokenEmailVerify = crypto
    .createHash("sha256")
    .update(tokenEmailVerify)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashTokenEmailVerify,
    emailVerificationExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.status(400).json({
      success: false,
      message: "توکن نامعتبر است یا اعتبار آن به پایان رسیده است.",
    });
  }

  user.emailVerificationToken = null;
  user.emailVerificationExpires = null;
  user.isEmailVerified = true;

  const result = await user.save();

  if (!result) {
    return res
      .status(400)
      .json({ success: false, message: "خطا در ذخیره اطلاعات کاربر رخ داد." });
  }

  return res
    .status(200)
    .json({ success: true, message: "آدرس ایمیل شما با موفقیت تأیید شد." });
};
