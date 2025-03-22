const Order = require("../../models/order.model");
const QRCode = require("qrcode");
const axios = require("axios");
const API_KEY =
  "GR2NXF5EZGZHHD7TNQ8M6D6DRM1CY94I9IKOXXAVWKR3UZUMDLUJ3ONOI5OEFQVT";
const ACCOUNT_NUMBER = "0002033567932";

// [GET] /api/v1/orders
module.exports.index = async (req, res) => {
  try {
    const userId = req.user.userId;
    // console.log(userId);
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Thiết lập sắp xếp
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort["createdAt"] = "desc";
    }

    const orders = await Order.find({
      userId: userId,
    })
      .limit(limit)
      .skip(skip)
      .sort(sort);

    const total = await Order.countDocuments({
      userId: userId,
    });
    // console.log(orders);
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
    const paymentUrl = `https://qr.sepay.vn/img?bank=MBBank&acc=0002033567932&template=compact&amount=${
      order.totalPrice
    }&des=${encodeURIComponent(transactionContent)}`;

    // console.log("🔗 Payment URL:", paymentUrl); // Debug URL

    // Tạo QR code từ URL
    const qrCodeDataUrl = await QRCode.toDataURL(paymentUrl);
    // console.log("📷 QR Code Data URL:", qrCodeDataUrl.substring(0, 50)); // Debug QR Code

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
