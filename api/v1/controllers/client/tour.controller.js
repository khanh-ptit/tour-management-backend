const slugify = require("slugify");
const Tour = require("../../models/tour.model");

// [GET] /api/v1/tours
module.exports.getToursByName = async (req, res) => {
  try {
    const tourName = req.query.name;
    const limit = parseInt(req.query.limit) || 8;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    if (!tourName) {
      return res
        .status(400)
        .json({ code: 400, message: "Thiếu tham số name!" });
    }

    // Chuyển đổi tourName sang dạng slug để tìm kiếm
    const slugifiedName = slugify(tourName, { lower: true, strict: true });
    const regex = new RegExp(slugifiedName, "i");

    // Thiết lập bộ lọc tìm kiếm
    let find = {
      slug: regex,
      status: "active",
      deleted: false,
    };

    if (req.query.departureDate) {
      const departureDate = new Date(req.query.departureDate);
      find.departureDate = { $gte: departureDate };
    }

    // Thiết lập sắp xếp
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      sort[req.query.sortKey] = req.query.sortValue;
    } else {
      sort["createdAt"] = "desc";
    }

    // Tìm kiếm các tour phù hợp
    const tours = await Tour.find(find)
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // Tính tổng số kết quả phù hợp
    const total = await Tour.countDocuments(find);

    // Tính toán giá mới sau giảm giá
    for (const item of tours) {
      item.newPrice = parseInt(
        (item.totalPrice * (100 - item.discountPercentage)) / 100
      );
    }

    // Sắp xếp theo newPrice nếu được yêu cầu
    if (req.query.sortKey === "newPrice") {
      tours.sort((a, b) => {
        if (req.query.sortValue === "asc") {
          return a.newPrice - b.newPrice;
        }
        return b.newPrice - a.newPrice;
      });
    }

    res.status(200).json({
      code: 200,
      message: "Lấy danh sách tour thành công!",
      tours,
      total,
      title: tourName,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách tour!",
    });
  }
};
