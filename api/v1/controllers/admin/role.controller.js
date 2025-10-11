const Role = require("../../models/role.model");

// [POST] /api/v1/roles/create
module.exports.create = async (req, res) => {
  try {
    if (!req.role.permissions.includes("roles_create")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền tạo mới nhóm quyền",
      });
    }
    const newRole = new Role(req.body);
    newRole.createdBy = {
      accountId: req.user.id,
      createdAt: new Date(),
    };
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
    if (!req.role.permissions.includes("roles_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem danh sách nhóm quyền",
      });
    }
    const roles = await Role.find({ deleted: false })
      .populate("createdBy.accountId", "fullName")
      .populate("updatedBy.accountId", "fullName");
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
    if (!req.role.permissions.includes("roles_delete")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xóa nhóm quyền",
      });
    }
    const { id } = req.params;
    const deletedBy = {
      accountId: req.user.id,
      deletedAt: new Date(),
    };
    await Role.findByIdAndUpdate(id, {
      deleted: true,
      deletedBy,
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
    if (!req.role.permissions.includes("roles_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem chi tiết nhóm quyền",
      });
    }
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
    if (!req.role.permissions.includes("roles_edit")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem chỉnh sửa nhóm quyền",
      });
    }
    const { id } = req.params;
    const role = await Role.findOne({ _id: id });
    if (!role) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy nhóm quyền",
      });
    }
    const updatedBy = {
      accountId: req.user.id,
      updatedAt: new Date(),
    };
    await Role.findOneAndUpdate(
      { _id: id },
      {
        $set: req.body,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );
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
    if (!req.role.permissions.includes("roles_permissions")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền phân quyền",
      });
    }
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
