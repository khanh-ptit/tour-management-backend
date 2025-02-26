const jwt = require("jsonwebtoken");
const Account = require("../../models/account.model");
// require("dotenv").config();

// Tạo secret key cho JWT
const JWT_SECRET = process.env.JWT_SECRET;

// [POST] /api/v1/admin/auth/login
module.exports.login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Kiểm tra tài khoản có tồn tại không
    const account = await Account.findOne({ email, deleted: false });

    if (!account) {
      return res
        .status(400)
        .json({ message: "Email không hợp lệ hoặc chưa được đăng ký!" });
    }

    // So sánh mật khẩu
    const isMatch = password === account.password ? true : false;
    // const isMatch = await bcrypt.compare(password, account.password);
    if (!isMatch) {
      return res
        .status(400)
        .json({ message: "Email hoặc mật khẩu không đúng!" });
    }

    // Tạo token
    const token = jwt.sign(
      { id: account._id, roleId: account.roleId },
      JWT_SECRET,
      { expiresIn: "7d" } // Token hết hạn sau 7 ngày
    );

    // Lưu token vào cookies (httpOnly giúp bảo vệ chống XSS)
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production", // Chỉ bật trên HTTPS khi deploy
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày
    });

    res.json({
      message: "Đăng nhập thành công",
      user: {
        id: account._id,
        fullName: account.fullName,
        email: account.email,
        roleId: account.roleId,
        avatar: account.avatar,
      },
    });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// [POST] /api/v1/admin/auth/me
module.exports.me = (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
