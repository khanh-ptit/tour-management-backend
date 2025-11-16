const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");
const validate = require("../../validates/client/user.validate");
const authMiddleware = require("../../middlewares/client/auth.middleware");
const rateLimitMiddleware = require("../../middlewares/common/rate-limit.middleware");
const multer = require("multer");

/**
 * @swagger
 * /api/v1/user/register:
 *   post:
 *     summary: Đăng ký user mới
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - phone
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               phone:
 *                 type: string
 *                 example: "0123456789"
 *               password:
 *                 type: string
 *                 example: "Abc@1234"
 *     responses:
 *       201:
 *         description: Đăng ký thành công
 *       400:
 *         description: Email hoặc số điện thoại đã tồn tại
 *       500:
 *         description: Lỗi server
 */

const storage = multer.memoryStorage(); // Lưu file trong memory
const upload = multer({ storage });

router.post("/register", validate.register, controller.register);

router.post(
  "/login",
  // rateLimitMiddleware.loginLimiter,
  validate.login,
  controller.login
);

router.post("/verify-voice", upload.single("voice"), controller.verifyVoice);

router.post(
  "/password/forgot",
  validate.forgotPassword,
  controller.forgotPassword
);

router.post("/password/otp", validate.otpPassword, controller.otpPassword);

router.delete("/password/delete-otp/:email", controller.deleteAllOtp);

router.delete("/verify/delete-otp/:email", controller.deleteAllVerifyOtp);

router.post("/verify/resend-otp", controller.resendVerifyOtp);

router.post("/verify", controller.verifyUser);

router.patch(
  "/password/reset",
  authMiddleware.requireAuth,
  validate.resetPassword,
  controller.resetPassword
);

router.get("/profile", authMiddleware.requireAuth, controller.profile);

router.get(
  "/order-statistic",
  authMiddleware.requireAuth,
  controller.orderStatistic
);

router.patch(
  "/change-password",
  authMiddleware.requireAuth,
  validate.changePassword,
  controller.changePassword
);

router.patch(
  "/edit-info",
  authMiddleware.requireAuth,
  validate.editInfo,
  controller.editInfo
);

router.patch(
  "/toggle-two-fa/:id",
  authMiddleware.requireAuth,
  controller.toggleTwoFa
);

router.post(
  "/enable-two-fa/:id",
  authMiddleware.requireAuth,
  controller.enableTwoFa
);

module.exports = router;
