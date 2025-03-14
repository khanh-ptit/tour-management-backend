const Tour = require("../../models/tour.model");
const TourCategory = require("../../models/tour-category.model");

const getAllSubCategories = async (parentId) => {
  const subCategories = await TourCategory.find({
    categoryParentId: parentId,
    deleted: false,
  }).select("_id");

  if (subCategories.length === 0) return []; // Không có danh mục con

  let allSubCategories = [...subCategories]; // Lưu danh mục con hiện tại

  for (const subCategory of subCategories) {
    const deeperSubCategories = await getAllSubCategories(subCategory._id);
    allSubCategories = allSubCategories.concat(deeperSubCategories);
  }

  return allSubCategories;
};

// [GET] /api/v1/tour-categories/:slug
module.exports.getTourByCategory = async (req, res) => {
  try {
    const slug = req.params.slug;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 8;
    const skip = (page - 1) * limit;

    // 1️⃣ Tìm danh mục cha theo slug
    const tourCategory = await TourCategory.findOne({
      slug: slug,
      deleted: false,
    });

    if (!tourCategory) {
      return res.status(404).json({
        code: 404,
        message: "Không tìm thấy danh mục yêu cầu!",
      });
    }

    // 2️⃣ Lấy tất cả danh mục con (bao gồm nhiều cấp)
    const subCategories = await getAllSubCategories(tourCategory._id);
    const categoryIds = [
      tourCategory._id,
      ...subCategories.map((cat) => cat._id),
    ];

    // 3️⃣ Tính tổng số tour để phân trang
    const total = await Tour.countDocuments({
      status: "active",
      categoryId: { $in: categoryIds },
      deleted: false,
    });

    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
      const sortKey = req.query.sortKey;
      const sortValue = req.query.sortValue;
      // console.log(sortKey, sortValue);
      sort[sortKey] = sortValue;
    } else {
      sort.createdAt = "asc";
    }

    // 4️⃣ Lấy danh sách tour theo phân trang
    const tours = await Tour.find({
      status: "active",
      categoryId: { $in: categoryIds },
      deleted: false,
    })
      .populate("categoryId", "name price")
      .populate("services")
      .sort(sort)
      .skip(skip)
      .limit(limit)
      .lean();

    // 5️⃣ Tính toán giá giảm
    for (const item of tours) {
      item.newPrice = parseInt(
        (item.totalPrice * (100 - item.discountPercentage)) / 100
      );
    }

    // 6️⃣ Sắp xếp theo newPrice nếu có yêu cầu
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
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      title: tourCategory.name,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách tour!",
    });
  }
};
