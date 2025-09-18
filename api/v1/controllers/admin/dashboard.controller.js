const User = require("../../models/user.model");
const Tour = require("../../models/tour.model");
const Order = require("../../models/order.model");

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
