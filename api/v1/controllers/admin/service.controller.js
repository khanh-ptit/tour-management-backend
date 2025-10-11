const Service = require("../../models/service.model");

// [GET] /api/v1/admin/services
module.exports.index = async (req, res) => {
  try {
    if (!req.role.permissions.includes("services_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem danh sách dịch vụ",
      });
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    let sort = { createdAt: -1 };
    if (req.query.sortKey && req.query.sortValue) {
      sort = {};
      sort[req.query.sortKey] = req.query.sortValue === "asc" ? 1 : -1;
    }

    const find = { deleted: false };
    if (req.query.name) {
      find.name = new RegExp(req.query.name, "i"); // tìm kiếm gần đúng
    }

    const total = await Service.countDocuments(find);
    const services = await Service.find(find)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy.accountId", "fullName")
      .populate("updatedBy.accountId", "fullName");
    res.json({ services, total });
  } catch (error) {
    console.error("Lỗi lấy danh sách dịch vụ:", error);
    res.status(500).json({ message: "Lỗi máy chủ" });
  }
};

// [GET] /api/v1/admin/services/detail/:id
module.exports.detail = async (req, res) => {
  try {
    if (!req.role.permissions.includes("services_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem danh sách dịch vụ",
      });
    }
    const service = await Service.findById(req.params.id);
    if (!service || service.deleted) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy dịch vụ!" });
    }
    res.json(service);
  } catch (error) {
    console.error("Lỗi lấy chi tiết dịch vụ:", error);
    return res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
};

// [POST] /api/v1/admin/services/create
module.exports.createPost = async (req, res) => {
  try {
    if (!req.role.permissions.includes("services_create")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền tạo mới dịch vụ",
      });
    }
    const newService = new Service(req.body);
    newService.createdBy = {
      accountId: req.user.id,
      createdAt: new Date(),
    };
    await newService.save();
    res.status(201).json({
      code: 201,
      message: "Thêm dịch vụ thành công",
      service: newService,
    });
  } catch (error) {
    console.error("Lỗi thêm dịch vụ:", error);
    res.status(500).json({
      code: 500,
      message: "Thêm dịch vụ thất bại",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/admin/services/edit/:id
module.exports.editPatch = async (req, res) => {
  try {
    if (!req.role.permissions.includes("services_edit")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền chỉnh sửa dịch vụ",
      });
    }
    const updatedBy = {
      accountId: req.user.id,
      updatedAt: new Date(),
    };
    const result = await Service.updateOne(
      { _id: req.params.id },
      {
        $set: req.body,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy dịch vụ" });
    }
    res.status(200).json({ code: 200, message: "Cập nhật dịch vụ thành công" });
  } catch (error) {
    console.error("Lỗi cập nhật dịch vụ:", error);
    return res
      .status(500)
      .json({ code: 500, message: "Cập nhật thất bại", error: error.message });
  }
};

// [DELETE] /api/v1/admin/services/delete/:id
module.exports.deleteItem = async (req, res) => {
  try {
    if (!req.role.permissions.includes("services_delete")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xóa dịch vụ",
      });
    }
    const deletedBy = {
      accountId: req.user.id,
      deletedAt: new Date(),
    };
    const result = await Service.updateOne(
      { _id: req.params.id },
      { deleted: true, deletedBy }
    );
    if (result.matchedCount === 0) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy dịch vụ" });
    }
    res.status(200).json({ code: 200, message: "Xóa dịch vụ thành công" });
  } catch (error) {
    console.error("Lỗi xóa dịch vụ:", error);
    res.status(500).json({ code: 500, message: "Xóa dịch vụ thất bại" });
  }
};
