const express = require("express");
const authControllers = require("../controllers/authControllers");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../Middlewares/isAuth");

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: ثبت‌نام کاربر جدید
 *     description: دریافت اطلاعات اولیه، ایجاد حساب کاربری جدید در سامانه و ارسال ایمیل حاوی لینک فعال‌سازی.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 example: علی رضایی
 *               email:
 *                 type: string
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *               confirmPassword:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       201:
 *         description: حساب کاربری موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "حساب کاربری شما با موفقیت ایجاد شد. لطفاً برای تأیید ایمیل خود، تا ۲۴ ساعت آینده صندوق ورودی ایمیلتان را بررسی کنید."
 *       400:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ایمیل معتبر وارد کنید."
 *             examples:
 *               invalidEmail:
 *                 value:
 *                   success: false
 *                   message: "ایمیل معتبر وارد کنید."
 *               invalidPassword:
 *                 value:
 *                   success: false
 *                   message: "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد."
 *               passwordMismatch:
 *                 value:
 *                   success: false
 *                   message: "رمزهای عبور یکسان نیستند"
 *               randomTokenGenerationError:
 *                 value:
 *                   success: false
 *                   message: "خطا در ایجاد کد تصادفی رخ داد"
 *               emailAlreadyExists:
 *                 value:
 *                   success: false
 *                   message: "این ایمیل قبلاً ثبت شده است"
 *               userSaveError:
 *                 value:
 *                   success: false
 *                   message: "خطا در ذخیره اطلاعات کاربر رخ داد."
 *               emailSendingError:
 *                 value:
 *                   success: false
 *                   message: "ارسال ایمیل با خطا مواجه شد"
 *               
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "خطای داخلی سرور رخ داده است."
 */
router.post(
  "/signup",
  [
    body("email", "ایمیل معتبر وارد کنید").isEmail(),
    body("password", "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد")
      .isLength({ min: 6 })
      .isAlphanumeric(),
    body("confirmPassword").custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("رمزهای عبور یکسان نیستند");
      }
      return true;
    }),
  ],
  authControllers.postSignup,
);

/**
 * @swagger
 * /auth/signin:
 *   post:
 *     summary: ورود به سیستم
 *     description: اعتبارسنجی ایمیل و رمز عبور، بازگرداندن توکن دسترسی و ذخیره کوکی رفرش توکن.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@example.com
 *               password:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: ورود موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "ورود به حساب کاربری با موفقیت انجام شد."
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: Saved
 *       400:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ایمیل معتبر وارد کنید."
 *             examples:
 *               invalidEmail:
 *                 value:
 *                   success: false
 *                   message: "ایمیل معتبر وارد کنید."
 *               invalidPassword:
 *                 value:
 *                   success: false
 *                   message: "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد."
 *               incorrectEmail:
 *                 value:
 *                   success: false
 *                   message: "ایمیل اشتباه است"
 *               incorrectPassword:
 *                 value:
 *                   success: false
 *                   message: "رمز عبور اشتباه هست"
 *               emailNotVerified:
 *                 value:
 *                   success: false
 *                   message: "حساب کاربری شما هنوز تأیید نشده است. لطفاً ایمیل خود را بررسی کنید و از طریق لینک ارسال‌شده، حساب خود را فعال کنید."
 */
router.post(
  "/signin",
  [
    body("email", "ایمیل معتبر وارد کنید").isEmail(),
    body("password", "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد")
      .isLength({ min: 6 })
      .isAlphanumeric(),
  ],
  authControllers.postSignin,
);

/**
 * @swagger
 * /auth/refresh-token:
 *   post:
 *     summary: تمدید توکن دسترسی
 *     description: دریافت Refresh Token از طریق کوکی مرورگر و صدور یک Access Token جدید.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 accessToken:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 refreshToken:
 *                   type: string
 *                   example: Saved
 *       400:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "توکن تمدید اعتبار (Refresh Token) الزامی است."
 *             examples:
 *               refreshTokenRequired:
 *                 value:
 *                   success: false
 *                   message: "توکن تمدید اعتبار (Refresh Token) الزامی است."
 *               invalidOrRevokedRefreshToken:
 *                 value:
 *                   success: false
 *                   message: "توکن تمدید اعتبار نامعتبر است یا اعتبار آن لغو شده است"
 *               refreshTokenAlreadyUsed:
 *                 value:
 *                   success: false
 *                   message: "این توکن تمدید اعتبار قبلاً استفاده شده است"
 *               invalidOrExpiredRefreshToken:
 *                 value:
 *                   success: false
 *                   message: "توکن تمدید اعتبار نامعتبر است یا منقضی شده است"
 */
router.post("/refresh-token", authControllers.refreshToken);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: دریافت اطلاعات کاربر جاری
 *     description: ارسال توکن دسترسی در هدر با ساختار Authorization Bearer برای دریافت مشخصات کاربر.
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   type: object
 *                   example:
 *                     _id: "6aedaa1d415b0e544acada75"
 *                     name: "test"
 *                     email: "test@example.com"
 *                     isEmailVerified: true
 *                     role: "user"
 *       404:
 *         description: پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "کاربر موردنظر یافت نشد."
 *       401:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "برای دسترسی به این بخش، ابتدا باید وارد حساب کاربری خود شوید"
 *             examples:
 *               unAuthorized:
 *                 value:
 *                   success: false
 *                   message: "برای دسترسی به این بخش، ابتدا باید وارد حساب کاربری خود شوید"
 *               inValidToken:
 *                 value:
 *                   success: false
 *                   message: "توکن دسترسی نامعتبر است یا اعتبار آن به پایان رسیده است."
 */
router.get("/me", isAuth, authControllers.getMe);

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: خروج از سیستم
 *     description: پاک کردن کوکی و باطل کردن توکن تمدید اعتبار.
 *     tags: [Authentication]
 *     responses:
 *       200:
 *         description: موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "خروج از حساب کاربری با موفقیت انجام شد."
 *       400:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ارسال توکن تمدید اعتبار الزامی است"
 *             examples:
 *               refreshTokenRequired:
 *                 value:
 *                   success: false
 *                   message: "ارسال توکن تمدید اعتبار الزامی است"
 *               invalidOrExpiredRefreshToken:
 *                 value:
 *                   success: false
 *                   message: "توکن تمدید اعتبار نامعتبر است یا منقضی شده است"
 *               refreshTokenNotFoundOrRevoked:
 *                 value:
 *                   success: false
 *                   message: "توکن تمدید اعتبار پیدا نشد یا قبلاً باطل شده است"
 */
router.post("/logout", authControllers.postLogout);

/**
 * @swagger
 * /auth/forgot-password:
 *   post:
 *     summary: فراموشی رمز عبور
 *     description: درخواست بازیابی رمز عبور و ارسال لینک به ایمیل کاربر.
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: ali@example.com
 *     responses:
 *       200:
 *         description: موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "لطفاً صندوق آدرس ایمیل خود را بررسی کنید."
 *       404:
 *         description: پیدا نشد
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ایمیل موردنظر در سیستم ثبت نشده است."
 *       400:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "ایمیل معتبر وارد کنید."
 *             examples:
 *               invalidEmail:
 *                 value:
 *                   success: false
 *                   message: "ایمیل معتبر وارد کنید."
 *               randomTokenGenerationError:
 *                 value:
 *                   success: false
 *                   message: "خطا در تولید کد تصادفی رخ داد"
 *               resetTokenSaveError:
 *                 value:
 *                   success: false
 *                   message: "خطا در ذخیره توکن بازیابی رمز عبور یا زمان انقضای آن رخ داد"
 *               emailSendingError:
 *                 value:
 *                   success: false
 *                   message: "ارسال ایمیل با خطا مواجه شد"
 */
router.post(
  "/forgot-password",
  body("email", "ایمیل معتبر وارد کنید").isEmail(),
  authControllers.postForgotPassword,
);

/**
 * @swagger
 * /auth/reset-password/{passwordToken}:
 *   post:
 *     summary: بازنشانی رمز عبور
 *     description: دریافت توکن از لینک و ثبت رمز عبور جدید.
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: passwordToken
 *         required: true
 *         schema:
 *           type: string
 *         description: توکن بازیابی رمز عبور
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - newPassword
 *             properties:
 *               newPassword:
 *                 type: string
 *                 example: 12345678
 *     responses:
 *       200:
 *         description: موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "رمز عبور شما با موفقیت تغییر کرد. لطفاً برای ورود مجدد به حساب کاربری، به صفحه ورود مراجعه کنید."
 *       400:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد"
 *             examples:
 *               invalidPassword:
 *                 value:
 *                   success: false
 *                   message: "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد"
 *               newPasswordRequired:
 *                 value:
 *                   success: false
 *                   message: "وارد کردن رمز عبور جدید الزامی است"
 *               invalidOrExpiredResetToken:
 *                 value:
 *                   success: false
 *                   message: "لینک بازیابی رمز عبور نامعتبر است یا اعتبار آن به پایان رسیده است"
 *               passwordUpdateError:
 *                 value:
 *                   success: false
 *                   message: "خطا در ذخیره رمز عبور جدید رخ داد."
 *       500:
 *         description: خطای سرور
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "خطای داخلی سرور رخ داده است."
 */
router.post(
  "/reset-password/:passwordToken",
  body("newPassword", "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد")
    .isLength({ min: 6 })
    .isAlphanumeric(),
  authControllers.postResetPassword,
);

/**
 * @swagger
 * /auth/email-verify/{tokenEmailVerify}:
 *   post:
 *     summary: تأیید ایمیل
 *     description: فعال‌سازی حساب کاربری با استفاده از توکن تایید ایمیل.
 *     tags: [Authentication]
 *     parameters:
 *       - in: path
 *         name: tokenEmailVerify
 *         required: true
 *         schema:
 *           type: string
 *         description: توکن تأیید ایمیل
 *     responses:
 *       200:
 *         description: موفق
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "آدرس ایمیل شما با موفقیت تأیید شد."
 *       400:
 *         description: خطا
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "توکن ارسال نشده است"
 *             examples:
 *               tokenRequired:
 *                 value:
 *                   success: false
 *                   message: "توکن ارسال نشده است"
 *               invalidOrExpiredToken:
 *                 value:
 *                   success: false
 *                   message: "توکن نامعتبر است یا اعتبار آن به پایان رسیده است"
 *               userUpdateError:
 *                 value:
 *                   success: false
 *                   message: "خطا در ذخیره اطلاعات کاربر رخ داد"
 */
router.post("/email-verify/:tokenEmailVerify", authControllers.postEmailVerify);

module.exports = router;