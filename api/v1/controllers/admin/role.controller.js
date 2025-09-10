const Role = require("../../models/role.model");

// [POST] /api/v1/roles/create
module.exports.create = async (req, res) => {
  try {
    const newRole = new Role(req.body);
    await newRole.save();
    res.status(201).json({
      code: 201,
      message: "Tạo thành công nhóm quyền",
    });
  } catch (error) {
    console.error("Lỗi khi thêm nhóm quyền:", error);
    res.status(400).json({
      code: 400,
      message: "Thêm nhóm quyền thất bại",
      error: error.message,
    });
  }
};

// [GET] /api/v1/roles
module.exports.index = async (req, res) => {
  try {
    const roles = await Role.find({ deleted: false });
    const total = await Role.countDocuments({ deleted: false });
    res.status(200).json({
      code: 200,
      roles,
      total,
    });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách nhóm quyền:", error);
    res.status(400).json({
      code: 400,
      message: "Lỗi khi lấy danh sách nhóm quyền",
      error: error.message,
    });
  }
};

// [DELETE] /api/v1/roles/delete
module.exports.delete = async (req, res) => {
  try {
    const { id } = req.params;
    await Role.findByIdAndUpdate(id, {
      deleted: true,
    });
    res.status(200).json({
      code: 200,
      message: "Xóa nhóm quyền thành công",
    });
  } catch (error) {
    console.error("Lỗi khi xóa nhóm quyền:", error);
    res.status(400).json({
      code: 400,
      message: "Xóa nhóm quyền thất bại",
      error: error.message,
    });
  }
};

// [GET] /api/v1/roles/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findOne({ _id: id });
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy nhóm quyền",
      });
    }
    res.status(200).json({
      code: 200,
      role,
    });
  } catch (error) {
    console.error("Lỗi khi lấy thông tin nhóm quyền:", error);
    res.status(400).json({
      code: 400,
      message: "Lỗi khi lấy thông tin nhóm quyền:",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/roles/edit/:id
module.exports.edit = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await Role.findOne({ _id: id });
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy nhóm quyền",
      });
    }
    await Role.findOneAndUpdate({ _id: id }, req.body);
    res.status(200).json({
      code: 200,
      message: "Cập nhật nhóm quyền thành công",
      role,
    });
  } catch (error) {
    console.error("Lỗi khi sửa thông tin nhóm quyền:", error);
    res.status(400).json({
      code: 400,
      message: "Lỗi khi sửa thông tin nhóm quyền:",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/roles/permission
module.exports.permission = async (req, res) => {
  try {
    const updateObj = req.body;

    const bulkOps = Object.entries(updateObj).map(([roleId, perms]) => ({
      updateOne: {
        filter: { _id: roleId },
        update: { $set: { permissions: perms } },
      },
    }));

    if (bulkOps.length > 0) {
      await Role.bulkWrite(bulkOps);
    }

    const updatedRoles = await Role.find({ deleted: false });

    res.status(200).json({
      code: 200,
      message: "Cập nhật phân quyền thành công!",
      roles: updatedRoles,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật phân quyền:", error);
    res.status(400).json({
      code: 400,
      message: "Lỗi khi cập nhật phân quyền",
      error: error.message,
    });
  }
};
