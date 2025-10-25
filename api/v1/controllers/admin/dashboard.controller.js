const User = require("../../models/user.model");
const Tour = require("../../models/tour.model");
const Order = require("../../models/order.model");
const Service = require("../../models/service.model");
const ExcelJS = require("exceljs");
const {
  headerExcel,
  setDefaultFont,
} = require("../../../../helpers/formatExcel");
const { STATUS_MAP } = require("../../../../config/constant");
const moment = require("moment");

// [GET] /api/v1/admin/dashboard/user-count
module.exports.userCount = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ deleted: false });
    const activeUsers = await User.countDocuments({
      status: "active",
      deleted: false,
    });
    const inactiveUsers = await User.countDocuments({
      status: "inactive",
      deleted: false,
    });
    const initialUsers = await User.countDocuments({
      status: "initial",
      deleted: false,
    });
    const forgotPasswordUsers = await User.countDocuments({
      status: "forgot",
      deleted: false,
    });
    // Tính % và trả ra 4 biến activeUserPercentage, ... để tôi sẽ piechart

    const activeUserPercentage =
      totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(2) : 0;
    const inactiveUserPercentage =
      totalUsers > 0 ? ((inactiveUsers / totalUsers) * 100).toFixed(2) : 0;
    const initialUserPercentage =
      totalUsers > 0 ? ((initialUsers / totalUsers) * 100).toFixed(2) : 0;
    const forgotPasswordUserPercentage =
      totalUsers > 0
        ? ((forgotPasswordUsers / totalUsers) * 100).toFixed(2)
        : 0;

    res.status(200).json({
      code: 200,
      totalUsers,
      activeUsers,
      inactiveUsers,
      initialUsers,
      forgotPasswordUsers,
      activeUserPercentage,
      inactiveUserPercentage,
      initialUserPercentage,
      forgotPasswordUserPercentage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [GET] /api/v1/admin/dashboard/tour-count
module.exports.tourCount = async (req, res) => {
  try {
    const totalTours = await Tour.countDocuments({ deleted: false });
    const activeTours = await Tour.countDocuments({
      status: "active",
      deleted: false,
    });
    const inactiveTours = await Tour.countDocuments({
      status: "inactive",
      deleted: false,
    });

    res.status(200).json({
      code: 200,
      totalTours,
      activeTours,
      inactiveTours,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [GET] /api/v1/admin/dashboard/profit
module.exports.profit = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const profits = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalProfit: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const profitMap = {};
    profits.forEach((p) => {
      profitMap[`${p._id.month}-${p._id.year}`] = {
        totalProfit: p.totalProfit,
        orders: p.orders,
      };
    });

    const result = [];
    for (let i = 6; i > 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getMonth() + 1}-${d.getFullYear()}`;

      result.push({
        month: key,
        totalProfit: profitMap[key]?.totalProfit || 0,
        orders: profitMap[key]?.orders || 0,
      });
    }

    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [GET] /api/v1/admin/dashboard/debt
module.exports.debt = async (req, res) => {
  try {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const debts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lt: endDate },
          isPaid: false,
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            year: { $year: "$createdAt" },
          },
          totalDebt: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const debtMap = {};
    debts.forEach((p) => {
      debtMap[`${p._id.month}-${p._id.year}`] = {
        totalDebt: p.totalDebt,
        orders: p.orders,
      };
    });

    const result = [];
    for (let i = 6; i > 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getMonth() + 1}-${d.getFullYear()}`;

      result.push({
        month: key,
        totalDebt: debtMap[key]?.totalDebt || 0,
        orders: debtMap[key]?.orders || 0,
      });
    }

    res.status(200).json({
      code: 200,
      data: result,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [GET] /api/v1/admin/dashboard/order-count
module.exports.orderCount = async (req, res) => {
  try {
    const totalUnPaidOrder = await Order.countDocuments({
      deleted: false,
      isPaid: false,
    });
    const totalPaidOrder = await Order.countDocuments({
      deleted: false,
      isPaid: true,
    });
    const totalOrder = await Order.countDocuments({
      deleted: false,
    });

    const totalUnPaidOrderPercentage = (
      (totalUnPaidOrder / totalOrder) *
      100
    ).toFixed(2);
    const totalPaidOrderPercentage = (
      (totalPaidOrder / totalOrder) *
      100
    ).toFixed(2);
    res.status(200).json({
      code: 200,
      totalPaidOrder,
      totalUnPaidOrder,
      totalUnPaidOrderPercentage,
      totalPaidOrderPercentage,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [GET] /api/v1/admin/dashboard/this-month-profit
module.exports.thisMonthProfit = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth, $lte: now },
          isPaid: true,
        },
      },
      {
        $group: {
          _id: null,
          totalProfit: { $sum: "$totalPrice" },
          orders: { $sum: 1 },
        },
      },
    ]);

    const data =
      result.length > 0
        ? {
            totalProfit: result[0].totalProfit,
            orders: result[0].orders,
          }
        : {
            totalProfit: 0,
            orders: 0,
          };

    res.status(200).json({
      code: 200,
      data,
    });
  } catch (error) {
    console.error("Lỗi khi tính doanh thu tháng này:", error);
    res.status(500).json({
      code: 500,
      message: "Lỗi máy chủ",
    });
  }
};

// [GET] /api/v1/admin/dashboard/export
module.exports.exportExcel = async (req, res) => {
  try {
    const workbook = new ExcelJS.Workbook();

    const tourSheet = workbook.addWorksheet("Danh sách tour du lịch");

    tourSheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Tên tour", key: "name", width: 40 },
      { header: "Thời gian", key: "duration", width: 20 },
      { header: "Ngày đi", key: "departureDate", width: 20 },
      { header: "Ngày về", key: "returnDate", width: 20 },
      { header: "Trạng thái", key: "status", width: 20 },
      { header: "Giá niêm yết (VNĐ)", key: "totalPrice", width: 25 },
      { header: "Giá mới (VNĐ)", key: "newPrice", width: 25 },
      { header: "Giảm giá (%)", key: "discountPercentage", width: 20 },
      { header: "Người tạo", key: "createdBy", width: 30 },
      { header: "Thời gian tạo", key: "createdAt", width: 30 },
    ];

    const tourData = await Tour.find({ deleted: false })
      .populate("createdBy.accountId", "fullName")
      .lean();

    for (const item of tourData) {
      let newPrice = parseInt(
        (item.totalPrice * (100 - item.discountPercentage)) / 100
      );
      item.newPrice = newPrice;
    }

    tourData.forEach((item, index) => {
      tourSheet.addRow({
        ...item,
        stt: index + 1,
        departureDate: moment(item.departureDate).format("DD/MM/YYYY"),
        returnDate: moment(item.returnDate).format("DD/MM/YYYY"),
        totalPrice: item.totalPrice,
        newPrice: item.newPrice,
        status: STATUS_MAP[item.status],
        createdBy: item.createdBy.accountId.fullName,
        createdAt: moment(item.createdAt).format("hh:mm DD/MM/YYYY"),
      });
    });

    tourSheet.getColumn("totalPrice").numFmt = "#,##0";
    tourSheet.getColumn("newPrice").numFmt = "#,##0";
    headerExcel(tourSheet);
    setDefaultFont(tourSheet);

    const serviceSheet = workbook.addWorksheet("Danh sách dịch vụ");

    serviceSheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Tên dịch vụ", key: "name", width: 35 },
      { header: "Mô tả", key: "description", width: 100 },
      { header: "Giá (VNĐ)", key: "price", width: 30 },
      { header: "Nguời tạo", key: "createdBy", width: 30 },
      { header: "Thời gian tạo", key: "createdAt", width: 30 },
    ];

    const serviceData = await Service.find({ deleted: false }).populate(
      "createdBy.accountId",
      "fullName"
    );
    serviceData.forEach((item, index) => {
      return serviceSheet.addRow({
        stt: index + 1,
        name: item.name,
        description: item.description,
        price: item.price,
        createdBy: item.createdBy.accountId.fullName,
        createdAt: moment(item.createdAt).format("HH:mm DD/MM/YYYY"),
      });
    });
    serviceSheet.getColumn("price").numFmt = "#,##0";

    headerExcel(serviceSheet);
    setDefaultFont(serviceSheet);

    const orderSheet = workbook.addWorksheet("Danh sách đơn hàng");

    orderSheet.columns = [
      { header: "STT", key: "stt", width: 8 },
      { header: "Tên khách hàng", key: "customerName", width: 35 },
      { header: "Số điện thoại", key: "phone", width: 25 },
      { header: "Địa chỉ", key: "address", width: 80 },
      { header: "Giá (VNĐ)", key: "price", width: 20 },
      { header: "Trạng thái", key: "status", width: 25 },
      { header: "Số lượng tour", key: "totalTour", width: 20 },
      { header: "Thời gian tạo", key: "createdAt", width: 30 },
    ];

    const orderData = await Order.find({
      deleted: false,
    });
    orderData.forEach((item, index) => {
      return orderSheet.addRow({
        stt: index + 1,
        customerName: item.userInfo.fullName,
        phone: item.userInfo.phone,
        address: item.userInfo.address,
        price: item.totalPrice,
        status: item.isPaid ? "Đã thanh toán" : "Chưa thanh toán",
        totalTour: item.tours.length,
        createdAt: moment(item.createdAt).format("HH:mm DD/MM/YYYY"),
      });
    });
    orderSheet.getColumn("price").numFmt = "#,##0";

    headerExcel(orderSheet);
    setDefaultFont(orderSheet);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=danh_sach_tong_hop.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Lỗi máy chủ:", error);
    res.status(500).json({ code: 500, message: "Lỗi máy chủ" });
  }
};
