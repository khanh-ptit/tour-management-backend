const jwt = require("jsonwebtoken");
const Role = require("../../models/role.model");

const JWT_SECRET = process.env.JWT_SECRET;

module.exports.requireAuth = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "Bạn chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    const role = await Role.findOne({ _id: decoded.roleId });
    req.role = role;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token không hợp lệ" });
  }
};
