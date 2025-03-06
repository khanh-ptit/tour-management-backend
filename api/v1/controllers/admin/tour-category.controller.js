const TourCategory = require("../../models/tour-category.model");

// Đệ quy xây dựng danh mục cây
const buildCategoryTree = (categories, parentId = null, level = 0) => {
  let tree = [];
  categories
    .filter((cat) => String(cat.categoryParentId) === String(parentId))
    .forEach((cat) => {
      tree.push({
        _id: cat._id,
        name: `${"---".repeat(level)} ${cat.name}`,
        categoryParentId: cat.categoryParentId,
        description: cat.description, // Thêm mô tả
        thumbnail: cat.thumbnail, // Thêm ảnh đại diện
        slug: cat.slug,
      });

      // Gọi đệ quy để lấy danh mục con
      tree = tree.concat(buildCategoryTree(categories, cat._id, level + 1));
    });
  return tree;
};

// [GET] /api/v1/admin/tour-categories
module.exports.index = async (req, res) => {
  try {
    // Lấy tất cả danh mục không bị xóa mềm
    const categories = await TourCategory.find({ deleted: false });

    // Dùng đệ quy để tạo danh mục có phân cấp
    const formattedCategories = buildCategoryTree(categories);

    res.json({
      tourCategories: formattedCategories,
      total: categories.length,
    });
  } catch (error) {
    console.error(error);
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
