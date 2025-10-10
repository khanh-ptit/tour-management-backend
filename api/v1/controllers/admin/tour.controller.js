const Tour = require("../../models/tour.model");

// [GET] /api/v1/admin/tours
module.exports.index = async (req, res) => {
  try {
    if (!req.role.permissions.includes("tours_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem danh sách tour",
      });
    }
    let find = { deleted: false };

    if (req.query.status) {
      find.status = req.query.status;
    }

    if (req.query.name) {
      const keyword = req.query.name;
      const regex = new RegExp(keyword, "i");
      find.slug = regex;
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    let sort = {
      createdAt: "desc",
    };
    if (req.query.sortKey && req.query.sortValue) {
      sort = {};
      sort[req.query.sortKey] = req.query.sortValue;
    }

    const total = await Tour.countDocuments(find);
    const tours = await Tour.find(find)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .populate("categoryId", "name")
      .populate("services", "name price")
      .populate("createdBy.accountId", "fullName")
      .populate("updatedBy.accountId", "fullName")
      .lean();

    for (const item of tours) {
      let newPrice = parseInt(
        (item.totalPrice * (100 - item.discountPercentage)) / 100
      );
      item.newPrice = newPrice;
    }

    res.status(200).json({ code: 200, tours, total });
  } catch (error) {
    console.error("Lỗi khi lấy danh sách tour:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi server khi lấy danh sách tour",
      error: error.message,
    });
  }
};

// [POST] /api/v1/admin/tours/create
module.exports.createPost = async (req, res) => {
  try {
    if (!req.role.permissions.includes("tours_create")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền thêm tour",
      });
    }
    const newTour = new Tour(req.body);
    newTour.createdBy = {
      accountId: req.user.id,
      createdAt: new Date(),
    };
    await newTour.save();
    res.status(201).json({
      code: 201,
      message: "Thêm tour thành công",
    });
  } catch (error) {
    console.error("Lỗi khi thêm tour:", error);
    res.status(400).json({
      code: 400,
      message: "Thêm tour thất bại",
      error: error.message,
    });
  }
};

// [DELETE] /api/v1/admin/tours/delete/:slug
module.exports.deleteItem = async (req, res) => {
  try {
    if (!req.role.permissions.includes("tours_delete")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xóa tour",
      });
    }
    const slug = req.params.slug;
    const deletedBy = {
      accountId: req.user.id,
      deletedAt: new Date(),
    };
    await Tour.updateOne({ slug: slug }, { deleted: true, deletedBy });
    res.status(200).json({
      code: 200,
      message: "Xóa tour thành công!",
    });
  } catch (error) {
    console.log("Lỗi khi xóa tour: ", error);
    res.status(400).json({
      code: 400,
      message: "Xóa tour thất bại!",
      error: error.message,
    });
  }
};

// [GET] /api/v1/admin/tours/detail/:slug
module.exports.detail = async (req, res) => {
  try {
    if (!req.role.permissions.includes("tours_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem tour",
      });
    }
    const slug = req.params.slug;
    const tour = await Tour.findOne({ slug: slug })
      .populate("categoryId", "name")
      .populate("services", "name price")
      .lean();
    tour.newPrice = (tour.totalPrice * (100 - tour.discountPercentage)) / 100;
    res.status(200).json(tour);
  } catch (error) {
    console.log("Lỗi: ", error);
    res.status(400).json({
      code: 400,
      message: "Lỗi khi lấy thông tin tour!",
      error: error.message,
    });
  }
};

// [PATCH] /api/v1/admin/tours/edit/:slug
module.exports.editPatch = async (req, res) => {
  try {
    if (!req.role.permissions.includes("tours_edit")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền chỉnh sửa tour",
      });
    }
    const slug = req.params.slug;
    const updatedBy = {
      accountId: req.user.id,
      updatedAt: new Date(),
    };
    await Tour.updateOne(
      {
        slug: slug,
      },
      {
        $set: req.body,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật tour thành công!",
    });
  } catch (error) {
    console.log("Lỗi: ", error);
    res.status(400).json({
      code: 400,
      message: "Lỗi khi cập nhật tour!",
      error: error.message,
    });
  }
};
