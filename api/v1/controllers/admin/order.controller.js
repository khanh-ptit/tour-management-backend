const { PHONE_REGEX } = require("../../../../config/constant");
const Order = require("../../models/order.model");

// [GET] /api/v1/admin/orders
module.exports.index = async (req, res) => {
  try {
    if (!req.role.permissions.includes("orders_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem đơn hàng",
      });
    }
    let find = { deleted: false };
    const {
      limit = 4,
      page = 1,
      sortKey,
      sortValue,
      keyword,
      paidStatus,
    } = req.query;
    let skip = (page - 1) * limit;
    let sort = {};
    if (sortKey && sortValue) {
      sort[`${sortKey}`] = sortValue;
    } else {
      sort[`createdAt`] = -1;
    }
    if (keyword) {
      if (PHONE_REGEX.test(keyword)) {
        find["userInfo.phone"] = keyword;
      } else {
        find["userInfo.fullName"] = new RegExp(keyword, "i");
      }
    }
    if (paidStatus === "unPaid") {
      find.isPaid = false;
    } else if (paidStatus === "paid") {
      find.isPaid = true;
    }

    const orders = await Order.find(find)
      .limit(Number(limit))
      .skip(Number(skip))
      .sort(sort)
      .populate({
        path: "tours.tourId",
        model: "Tour",
        select: "-totalPrice -price",
        populate: {
          path: "services",
          model: "Service",
          select: "name price",
        },
      })
      .lean();
    const total = await Order.countDocuments(find);
    res.status(200).json({
      code: 200,
      orders,
      total,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách đơn hàng",
    });
  }
};

// [GET] /api/v1/admin/orders/detail/:id
module.exports.detail = async (req, res) => {
  try {
    if (!req.role.permissions.includes("orders_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem đơn hàng",
      });
    }
    const { id } = req.params;
    const order = await Order.findOne({
      _id: id,
      deleted: false,
    }).populate({
      path: "tours.tourId",
      model: "Tour",
      select: "-totalPrice -price",
      populate: {
        path: "services",
        model: "Service",
        select: "name price",
      },
    });
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: "Đơn hàng không tồn tại",
      });
    }
    res.status(200).json({
      code: 200,
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy chi tiết đơn hàng",
    });
  }
};

// [PATCH] /api/v1/admin/orders/edit/:id
module.exports.edit = async (req, res) => {
  try {
    if (!req.role.permissions.includes("orders_edit")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền chỉnh sửa đơn hàng",
      });
    }
    const { id } = req.params;
    const data = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!updatedOrder) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy đơn hàng",
      });
    }

    res.status(200).json({
      code: 200,
      message: "Cập nhật đơn hàng thành công",
      order: updatedOrder,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi cập nhật đơn hàng",
    });
  }
};

// [DELETE] /api/v1/admin/orders/delete/:id
module.exports.delete = async (req, res) => {
  try {
    if (!req.role.permissions.includes("orders_delete")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xóa đơn hàng",
      });
    }
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, deleted: false });
    if (!order) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy đơn hàng",
      });
    }
    await Order.updateOne(
      {
        _id: id,
      },
      {
        deleted: true,
      }
    );
    res.status(200).json({
      code: 200,
      message: "Đã xóa đơn hàng",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi cập nhật đơn hàng",
    });
  }
};
