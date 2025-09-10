const {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
} = require("../../../../config/constant");

module.exports.create = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, roleId, status } = req.body;

    if (!fullName) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập họ và tên!",
      });
    }

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

    if (!roleId) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng chọn nhóm quyền!",
      });
    }

    if (!status) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng chọn trạng thái!",
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

    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi validate!" });
  }
};

module.exports.edit = async (req, res, next) => {
  try {
    const { fullName, email, phone, password, roleId, status } = req.body;

    if (!fullName) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập họ và tên!",
      });
    }

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

    if (!roleId) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng chọn nhóm quyền!",
      });
    }

    if (!status) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng chọn trạng thái!",
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
    if (password && !passwordRegex.test(password)) {
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
