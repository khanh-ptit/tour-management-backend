const Tour = require("../../models/tour.model");
const Destination = require("../../models/destination.model");

// [GET] /api/v1/destinations/:slug
module.exports.getToursByDestination = async (req, res) => {
  try {
    const destinationSlug = req.params.slug;
    const destination = await Destination.findOne({
      slug: destinationSlug,
    });

    if (!destination) {
      return res.status(404).json({
        code: 404,
        message: "Điểm đến không tồn tại!",
      });
    }

    let sort = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    if (req.query.sortKey && req.query.sortValue) {
      const sortKey = req.query.sortKey;
      const sortValue = req.query.sortValue;
      sort[sortKey] = sortValue;
    } else {
      sort.createdAt = "desc";
    }

    const tours = await Tour.find({
      destinationId: destination._id,
      deleted: false,
    })
      .limit(limit)
      .skip(skip)
      .sort(sort)
      .lean();
    const total = await Tour.countDocuments({
      destinationId: destination._id,
      deleted: false,
    });

    for (const item of tours) {
      item.newPrice = parseInt(
        (item.totalPrice * (100 - item.discountPercentage)) / 100
      );
    }

    if (req.query.sortKey === "newPrice") {
      tours.sort((a, b) => {
        return req.query.sortValue === "asc"
          ? a.newPrice - b.newPrice
          : b.newPrice - a.newPrice;
      });
    }

    res.status(200).json({
      code: 200,
      tours,
      title: destination.name,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 200,
      message: "Đã xảy ra lỗi khi lấy danh sách tour!",
    });
  }
};
