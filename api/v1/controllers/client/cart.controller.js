const Cart = require("../../models/cart.model");

// [POST] /api/v1/cart/add
module.exports.addToCart = async (req, res) => {
  try {
    const { tourId, peopleQuantity } = req.body;
    const userId = req.user.userId;

    const cart = await Cart.findOne({ userId: userId });

    if (!cart) {
      return res
        .status(404)
        .json({ code: 404, message: "Không tìm thấy giỏ hàng!" });
    }

    // Kiểm tra tourId đã tồn tại chưa
    if (
      cart.tours.some((tour) => tour.tourId.toString() === tourId.toString())
    ) {
      return res.status(400).json({
        code: 400,
        message: "Tour đã tồn tại trong giỏ hàng. Vui lòng kiểm tra lại!",
      });
    }

    // Thêm tour vào giỏ hàng
    await Cart.updateOne(
      { _id: cart._id },
      {
        $push: {
          tours: {
            tourId: tourId,
            peopleQuantity: peopleQuantity,
          },
        },
      }
    );

    res.status(200).json({ code: 200, message: "Đã thêm tour vào giỏ hàng!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi thêm vào giỏ hàng!",
    });
  }
};

// [GET] /api/v1/cart
module.exports.getCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({
      userId: userId,
    })
      .select("-createdAt -updatedAt")
      .populate(
        "tours.tourId",
        "name images discountPercentage totalPrice description departureDate returnDate slug"
      )
      .lean();
    for (const item of cart.tours) {
      let tour = item.tourId;
      const newPrice = parseInt(
        (tour.totalPrice * (100 - tour.discountPercentage)) / 100
      );
      tour.newPrice = newPrice;
    }
    // console.log(cart);
    res.status(200).json({
      code: 200,
      cart,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy thông tin giỏ hàng!",
    });
  }
};

// [PATCH] /api/v1/cart/update-quantity
module.exports.updateQuantity = async (req, res) => {
  try {
    const userId = req.user.userId;
    const cart = await Cart.findOne({
      userId: userId,
    });

    cart.tours = req.body.tours;
    await Cart.updateOne(
      {
        _id: cart._id,
      },
      {
        tours: cart.tours,
      }
    );
    res.status(200).json({
      code: 200,
      message: "Cập nhật số lượng thành công!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi cập nhật số lượng!",
    });
  }
};
