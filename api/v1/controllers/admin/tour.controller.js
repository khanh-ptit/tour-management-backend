const Tour = require("../../models/tour.model");

// [GET] /api/v1/admin/tours
module.exports.index = async (req, res) => {
  try {
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
      .populate("categoryId", "name") // Lấy tên danh mục tour
      .populate("services", "name price"); // Lấy tên các dịch vụ

    res.json({ tours, total });
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
    const newTour = new Tour(req.body);
    // console.log(newTour);
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
