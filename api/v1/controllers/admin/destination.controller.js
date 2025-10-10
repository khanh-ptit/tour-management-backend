const Destination = require("../../models/destination.model");

// [GET] /api/v1/admin/destination
module.exports.index = async (req, res) => {
  try {
    if (!req.role.permissions.includes("destinations_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem danh sách điểm đến",
      });
    }
    let find = { deleted: false };
    let sort = {
      createdAt: "desc",
    };
    if (req.query.sortKey && req.query.sortValue) {
      sort = {};
      sort[req.query.sortKey] = req.query.sortValue;
    }
    if (req.query.keyword) {
      const keyword = req.query.keyword;
      const regex = new RegExp(keyword, "i");
      find.slug = regex;
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const destinations = await Destination.find(find)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("createdBy.accountId", "fullName")
      .populate("updatedBy.accountId", "fullName");
    const total = await Destination.countDocuments(find);
    res.status(200).json({
      destinations,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách điểm đến!",
    });
  }
};

// [DELETE] /api/v1/admin/destinations/delete/:slug
module.exports.deleteItem = async (req, res) => {
  try {
    if (!req.role.permissions.includes("destinations_delete")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xoá điểm đến",
      });
    }
    const slug = req.params.slug;
    const deletedBy = {
      accountId: req.user.id,
      deletedAt: new Date(),
    };
    await Destination.updateOne({ slug: slug }, { deleted: true, deletedBy });
    res.status(200).json({
      code: 200,
      message: "Xóa thành công điểm đến!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi xóa điểm đến!",
    });
  }
};

// [POST] /api/v1/admin/destinations/create
module.exports.createPost = async (req, res) => {
  try {
    if (!req.role.permissions.includes("destinations_create")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền tạo điểm đến",
      });
    }
    const newDestination = new Destination(req.body);
    newDestination.createdBy = {
      accountId: req.user.id,
      createdAt: new Date(),
    };
    await newDestination.save();
    res.status(200).json({
      code: 200,
      message: "Thêm thành công điểm đến!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi thêm điểm đến!",
    });
  }
};

// [PATCH] /api/v1/admin/destinations/edit/:slug
module.exports.editPatch = async (req, res) => {
  try {
    if (!req.role.permissions.includes("destinations_edit")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền chỉnh sửa điểm đến",
      });
    }
    const slug = req.params.slug;
    const updatedBy = {
      accountId: req.user.id,
      updatedAt: new Date(),
    };
    const updateDestination = await Destination.updateOne(
      { slug: slug },
      {
        $set: req.body,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );
    if (updateDestination) {
      res.status(200).json({
        code: 200,
        message: "Cập nhật điểm đến thành công!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi chỉnh sửa điểm đến!",
    });
  }
};
