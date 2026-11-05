const express = require("express");
const authControllers = require("../controllers/authControllers");
const router = express.Router();
const { body } = require("express-validator");
const isAuth = require("../Middlewares/isAuth");

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

router.get("/me", isAuth, authControllers.getMe);

router.post("/logout", authControllers.postLogout);

router.post("/refresh-token", authControllers.refreshToken);

router.post(
  "/forgot-password",
  body("email", "ایمیل معتبر وارد کنید").isEmail(),
  authControllers.postForgotPassword,
);

router.post(
  "/reset-password/:passwordToken",
  body("newPassword", "رمز عبور باید حداقل 6 کاراکتر و شامل حروف و اعداد باشد")
    .isLength({ min: 6 })
    .isAlphanumeric(),
  authControllers.postResetPassword,
);

router.post("/email-verify/:tokenEmailVerify", authControllers.postEmailVerify);

module.exports = router;
