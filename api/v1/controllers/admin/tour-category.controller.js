const TourCategory = require("../../models/tour-category.model");
const Account = require("../../models/account.model");
const lodash = require("lodash");

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
        createdBy: cat?.createdBy || null,
        updatedBy: cat?.updatedBy || null,
      });

      // Gọi đệ quy để lấy danh mục con
      tree = tree.concat(buildCategoryTree(categories, cat._id, level + 1));
    });
  return tree;
};

// [GET] /api/v1/admin/tour-categories
module.exports.index = async (req, res) => {
  try {
    if (!req.role.permissions.includes("tour-categories_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem danh mục tour",
      });
    }
    // Lấy tất cả danh mục không bị xóa mềm
    const categories = await TourCategory.find({ deleted: false });

    // Dùng đệ quy để tạo danh mục có phân cấp
    const formattedCategories = buildCategoryTree(categories);
    const accounts = await Account.find({ deleted: false }).select(
      "fullName email"
    );
    const accountMap = lodash.keyBy(accounts, "_id");
    for (const category of formattedCategories) {
      if (category.createdBy?.accountId) {
        const acc = accountMap[category.createdBy.accountId];
        if (acc) {
          category.createdBy = {
            accountId: {
              _id: acc._id,
              fullName: acc.fullName,
            },
            createdAt: category.createdBy.createdAt,
          };
        }
      }

      if (Array.isArray(category.updatedBy) && category.updatedBy.length > 0) {
        category.updatedBy = category.updatedBy.map((upd) => {
          const acc = accountMap[upd.accountId];
          return acc
            ? {
                accountId: {
                  _id: acc._id,
                  fullName: acc.fullName,
                },
                updatedAt: upd.updatedAt,
                _id: upd._id,
              }
            : upd;
        });
      }
    }

    res.status(200).json({
      code: 200,
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
    if (!req.role.permissions.includes("tour-categories_view")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền xem chi tiết danh mục tour",
      });
    }
    const slug = req.params.slug;
    const tourCategory = await TourCategory.findOne({
      slug: slug,
      deleted: false,
    });
    if (!tourCategory) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy danh mục",
      });
    }
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
  if (!req.role.permissions.includes("tour-categories_delete")) {
    return res.status(403).json({
      code: 403,
      message: "Không có quyền xoá danh mục tour",
    });
  }
  const slug = req.params.slug;
  const deletedBy = {
    accountId: req.user.id,
    deletedAt: new Date(),
  };
  const result = await TourCategory.updateOne(
    { slug: slug },
    { deleted: true, deletedBy }
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
    if (!req.role.permissions.includes("tour-categories_create")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền tạo danh mục tour",
      });
    }
    const newTourCategory = new TourCategory(req.body);
    newTourCategory.createdBy = {
      accountId: req.user.id,
      createdAt: new Date(),
    };
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
    if (!req.role.permissions.includes("tour-categories_edit")) {
      return res.status(403).json({
        code: 403,
        message: "Không có quyền chỉnh sửa danh mục tour",
      });
    }
    const slug = req.params.slug;
    const updatedBy = {
      accountId: req.user.id,
      updatedAt: new Date(),
    };
    await TourCategory.updateOne(
      { slug: slug },
      {
        $set: req.body,
        $push: {
          updatedBy: updatedBy,
        },
      }
    );
    res.status(201).json({ message: "Cập nhật danh mục tour thành công!" });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi cập nhật danh mục tour",
    });
  }
};
