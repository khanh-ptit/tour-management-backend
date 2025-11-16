const rateLimit = require("express-rate-limit");

module.exports.loginLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 phút
  max: 3, // tối đa 5 request
  message: {
    code: 429,
    message:
      "Bạn đã vượt quá số lần login cho phép. Vui lòng thử lại sau 10 phút.",
  },
  standardHeaders: true, // gửi thông tin limit trong header
  legacyHeaders: false, // tắt X-RateLimit-* cũ
});
