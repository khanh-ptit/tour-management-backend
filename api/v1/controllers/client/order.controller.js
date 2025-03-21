const Order = require("../../models/order.model");

// [POST] /api/v1/orders/create
module.exports.createOrder = async (req, res) => {
  try {
    // console.log(req.body);
    const userId = req.user.userId;
    const newOrder = new Order(req.body);
    newOrder.userId = userId;
    // console.log(newOrder);
    // await newOrder.save();

    res.status(200).json({
      code: 200,
      message: "Tạo đơn hàng thành công. Vui lòng thanh toán để hoàn tất!",
      orderId: newOrder._id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi tạo đơn hàng!",
    });
  }
};

// [GET] /api/v1/orders/detail/:id
module.exports.detail = async (req, res) => {
  try {
    const id = req.params.id;
    const order = await Order.findOne({ _id: id }).populate(
      "tours.tourId",
      "name images departureDate returnDate slug"
    );
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
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy thông tin đơn hàng!",
    });
  }
};
