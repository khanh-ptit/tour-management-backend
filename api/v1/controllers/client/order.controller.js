const Order = require("../../models/order.model");
const QRCode = require("qrcode");
const axios = require("axios");
const { default: mongoose } = require("mongoose");
const API_KEY = process.env.API_KEY;
const ACCOUNT_NUMBER = process.env.ACCOUNT_NUMBER;

// [GET] /api/v1/orders
module.exports.index = async (req, res) => {
  try {
    const userId = req.user.userId;
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort["createdAt"] = "desc";
    }

    let find = {};
    if (req.query.paidStatus) {
      if (req.query.paidStatus === "unPaid") {
        find.isPaid = false;
      } else if (req.query.paidStatus == "paid") {
        find.isPaid = true;
      }
    }

    const query = { userId, ...find };

    const orders = await Order.find(query).limit(limit).skip(skip).sort(sort);

    const total = await Order.countDocuments(query);
    res.status(200).json({
      code: 200,
      orders,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({});
  }
};

// [POST] /api/v1/orders/create
module.exports.createOrder = async (req, res) => {
  try {
    // console.log(req.body);
    const userId = req.user.userId;
    const newOrder = new Order(req.body);
    newOrder.userId = userId;
    // console.log(newOrder);
    await newOrder.save();

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
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        code: 400,
        message: "ID đơn hàng không hợp lệ",
      });
    }
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

    // Tạo transaction content
    const transactionContent = `Thanhtoanmadon-${order._id}`;

    // Tạo URL thanh toán với tài khoản chính
    const paymentUrl = `https://qr.sepay.vn/img?bank=MBBank&acc=${ACCOUNT_NUMBER}&template=compact&amount=${
      order.totalPrice
    }&des=${encodeURIComponent(transactionContent)}`;

    // console.log("🔗 Payment URL:", paymentUrl); // Debug URL

    // Tạo QR code từ URL
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl);

    res.status(200).json({
      code: 200,
      order,
      paymentUrl,
      qrCode: qrCodeDataUrl,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy thông tin đơn hàng!",
    });
  }
};

// [GET] /api/v1/orders/check-payment/:id
module.exports.checkPayment = async (req, res) => {
  try {
    const orderId = req.params.id;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({
        code: 404,
        message: "Đơn hàng không tồn tại",
      });
    }

    // Gọi API Sepay để lấy danh sách giao dịch
    const response = await axios.get(
      `https://my.sepay.vn/userapi/transactions/list?account_number=${ACCOUNT_NUMBER}&limit=10`,
      {
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const transactions = response.data.transactions || [];

    // Tìm giao dịch khớp với đơn hàng
    const matchedTransaction = transactions.find(
      (tx) =>
        tx.transaction_content.includes(`Thanhtoanmadon${orderId}`) && // ✅ Đã sửa
        parseFloat(tx.amount_in) === order.totalPrice
    );

    if (matchedTransaction) {
      console.log(`✅ Đơn hàng ${orderId} đã thanh toán!`);

      // Cập nhật trạng thái đơn hàng
      order.isPaid = true;
      await order.save();

      return res.status(200).json({
        code: 200,
        success: true,
        message: "Đơn hàng đã được thanh toán",
      });
    }

    return res.status(200).json({
      code: 200,
      success: false,
      message: "Đơn hàng chưa được thanh toán",
    });
  } catch (error) {
    console.error("Lỗi kiểm tra thanh toán:", error.message);
    return res.status(500).json({
      code: 500,
      message: "Lỗi khi kiểm tra trạng thái thanh toán!",
    });
  }
};
