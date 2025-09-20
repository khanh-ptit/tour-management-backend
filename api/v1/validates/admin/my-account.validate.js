const {
  EMAIL_REGEX,
  PHONE_REGEX,
  PASSWORD_REGEX,
} = require("../../../../config/constant");

module.exports.changePassword = async (req, res, next) => {
  const { oldPassword, newPassword, confirmPassword } = req.body;
  if (!oldPassword) {
    return res.status(400).json({
      code: 400,
      message: "Vui lòng nhập mật khẩu cũ!",
    });
  }

  if (!newPassword) {
    return res.status(400).json({
      code: 400,
      message: "Vui lòng nhập mật khẩu mới!",
    });
  }

  if (!confirmPassword) {
    return res.status(400).json({
      code: 400,
      message: "Vui lòng nhập xác nhận mật khẩu!",
    });
  }

  if (newPassword !== confirmPassword) {
    return res.status(400).json({
      code: 400,
      message: "Mật khẩu không khớp!",
    });
  }

  const passwordRegex = PASSWORD_REGEX;
  if (!passwordRegex.test(newPassword)) {
    return res.status(400).json({
      code: 400,
      message:
        "Mật khẩu phải có ít nhất 6 ký tự và số, bao gồm chữ hoa và ký tự đặc biệt!",
    });
  }
  next();
};

module.exports.editInfo = async (req, res, next) => {
  const { fullName, phone, avatar } = req.body;
  if (!fullName) {
    return res.status(400).json({
      code: 400,
      message: "Họ và tên không được trống!",
    });
  }

  if (!phone) {
    return res.status(400).json({
      code: 400,
      message: "Vui lòng nhập số điện thoại!",
    });
  }

  const phoneRegex = PHONE_REGEX;
  if (!phoneRegex.test(phone)) {
    return res.status(400).json({
      code: 400,
      message: "Số điện thoại không hợp lệ!",
    });
  }

  next();
};
