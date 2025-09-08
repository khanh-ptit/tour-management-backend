module.exports.create = (req, res, next) => {
  try {
    if (!req.body.title) {
      return res.status(400).json({
        code: 400,
        message: "Vui lòng nhập tên nhóm quyền",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({ code: 500, message: "Lỗi validate!" });
  }
};
