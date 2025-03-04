const TourCategory = require("../../models/tour-category.model");

// [GET] /api/v1/admin/tour-categories
module.exports.index = async (req, res) => {
  try {
    let find = {
      deleted: false,
    };

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 4;
    const skip = (page - 1) * limit;

    const total = await TourCategory.countDocuments(find);
    const tourCategories = await TourCategory.find(find)
      .limit(limit)
      .skip(skip);
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

// [GET] /api/v1/admin/tour-categories/detail/:slug
module.exports.detail = async (req, res) => {
  try {
    const slug = req.params.slug;
    const tourCategory = await TourCategory.findOne({
      slug: slug,
      deleted: false,
    });
    res.status(200).json({
      code: 200,
      tourCategory,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy thông tin danh mục",
      error: error.message,
    });
  }
};

// [DELETE] /api/v1/admin/tour-categories/delete/:slug
module.exports.deleteItem = async (req, res) => {
  const slug = req.params.slug;
  const result = await TourCategory.updateOne(
    { slug: slug },
    { deleted: true }
  );
  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ code: 404, message: "Không tìm thấy danh mục!" });
  }
  res.json({
    code: 200,
    message: "Xóa danh mục thành công!",
  });
};

// [POST] /api/v1/admin/tour-categories/create
module.exports.createPost = async (req, res) => {
  try {
    const newTourCategory = new TourCategory(req.body);
    // console.log(newTourCategory);
    await newTourCategory.save();
    res.status(201).json({ message: "Tạo danh mục tour thành công!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi thêm danh mục tour",
    });
  }
};

// [PATCH] /api/v1/admin/tour-categories/edit/:slug
module.exports.editPatch = async (req, res) => {
  try {
    const slug = req.params.slug;

    await TourCategory.updateOne({ slug: slug }, req.body);
    res.status(201).json({ message: "Cập nhật danh mục tour thành công!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi cập nhật danh mục tour",
    });
  }
};
