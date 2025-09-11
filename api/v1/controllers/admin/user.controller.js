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
