const jwt = require("jsonwebtoken");

// [POST] /api/v1/auth/me
module.exports.me = (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  const token = authHeader.split(" ")[1]; // Lấy token từ "Bearer <token>"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ user: decoded });
  } catch (error) {
    res.status(401).json({ message: "Token không hợp lệ" });
  }
};
