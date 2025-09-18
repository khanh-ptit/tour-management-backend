const User = require("../../models/user.model");

// [GET] /api/v1/admin/users
module.exports.index = async (req, res) => {
  try {
    let find = { deleted: false };

    let sort = {};
    if (req.query.status) {
      find.status = req.query.status;
    }
    if (req.query.name) {
      find.fullName = new RegExp(req.query.name, "i");
    }
    const { sortKey, sortValue, page = 1, limit = 4 } = req.query;
    if (sortKey && sortValue) {
      sort[`${sortKey}`] = sortValue;
    } else {
      sort.createdAt = 1;
    }
    const skip = (page - 1) * limit;

    const users = await User.find(find)
      .sort(sort)
      .limit(limit)
      .skip(skip)
      .select("-password");
    const total = await User.countDocuments(find);
    res.status(200).json({
      code: 200,
      users,
      total,
    });
  } catch (error) {
    console.error("Đã xảy ra lỗi khi lấy danh sách người dùng", error);
    return res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy danh sách người dùng",
    });
  }
};

// [GET] /api/v1/admin/users/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user || user.deleted) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy người dùng!" });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error("Lỗi lấy thông tin chi tiết người dùng:", error);
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
};

module.exports.editPatch = async (req, res) => {
  try {
    const result = await User.updateOne({ _id: req.params.id }, req.body);

    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy user" });
    }

    res.status(200).json({ code: 200, message: "Cập nhật user thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật user:", error);
    return res.status(500).json({
      code: 500,
      message: "Cập nhật thất bại",
      error: error.message,
    });
  }
};

module.exports.deleteItem = async (req, res) => {
  try {
    const result = await User.updateOne(
      { _id: req.params.id },
      { deleted: true }
    );
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy user" });
    }
    res.status(200).json({ code: 200, message: "Xóa user thành công" });
  } catch (error) {
    console.error("Lỗi xóa user:", error);
    return res.status(500).json({ code: 500, message: "Xóa user thất bại" });
  }
};
