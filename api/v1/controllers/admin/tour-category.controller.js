const TourCategory = require("../../models/tour-category.model");

// [GET] /api/v1/admin/tour-categories
module.exports.index = async (req, res) => {
  try {
    let find = {
      deleted: false,
    };
    const total = await TourCategory.countDocuments(find);
    const tourCategories = await TourCategory.find(find);
    res.json({
      tourCategories,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách danh mục",
      error: error.message,
    });
  }
};
