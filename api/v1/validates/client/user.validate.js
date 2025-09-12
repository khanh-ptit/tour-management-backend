const {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
  OTP_REGEX,
} = require("../../../../config/constant");

module.exports.login = (req, res, next) => {
  try {
    let { email, password } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập email!",
      });
    }

    if (!password) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập mật khẩu!",
      });
    }

    const emailRegex = EMAIL_REGEX;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email không hợp lệ!",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu phải có ít nhất 6 ký tự!",
      });
    }

    req.body.email = email.toLowerCase();

    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi validate!" });
  }
};

module.exports.register = (req, res, next) => {
  try {
    let { email, phone, password, confirmPassword } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập email!",
      });
    }

    if (!phone) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập số điện thoại!",
      });
    }

    if (!password) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập mật khẩu!",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng xác nhận mật khẩu!",
      });
    }

    const emailRegex = EMAIL_REGEX;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email không hợp lệ!",
      });
    }

    const phoneRegex = PHONE_REGEX;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: "Số điện thoại không hợp lệ!",
      });
    }

    const passwordRegex = PASSWORD_REGEX;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        code: 400,
        message:
          "Mật khẩu phải có ít nhất 6 ký tự và số, bao gồm chữ hoa và ký tự đặc biệt!",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: "Mật khẩu xác nhận không khớp!",
      });
    }

    req.body.email = email.toLowerCase();
    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi validate!" });
  }
};

module.exports.forgotPassword = (req, res, next) => {
  try {
    let { email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập email!",
      });
    }

    const emailRegex = EMAIL_REGEX;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email không hợp lệ!",
      });
    }

    req.body.email = email.toLowerCase();
    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi validate!" });
  }
};

module.exports.otpPassword = (req, res, next) => {
  try {
    let { otp, email } = req.body;

    if (!email) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập email!",
      });
    }

    const emailRegex = EMAIL_REGEX;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        code: 400,
        message: "Email không hợp lệ!",
      });
    }

    if (!otp) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập OTP!",
      });
    }

    const otpRegex = OTP_REGEX;
    if (!otpRegex.test(otp)) {
      return res.status(400).json({
        code: 400,
        message: "OTP không hợp lệ!",
      });
    }

    req.body.email = email.toLowerCase();
    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi validate!" });
  }
};

module.exports.resetPassword = (req, res, next) => {
  try {
    let { password, confirmPassword } = req.body;

    if (!password) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập mật khẩu!",
      });
    }

    if (!confirmPassword) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng xác nhận mật khẩu!",
      });
    }

    const passwordRegex = PASSWORD_REGEX;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        code: 400,
        message:
          "Mật khẩu phải có ít nhất 6 ký tự và số, bao gồm chữ hoa và ký tự đặc biệt!",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi validate!" });
  }
};
