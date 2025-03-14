const TourCategory = require("../../models/tour-category.model");
const Tour = require("../../models/tour.model");
const Destination = require("../../models/destination.model");

// Hàm đệ quy để lấy tất cả danh mục con
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

// [GET] /home/tour-categories/:slug
module.exports.getTourByCategory = async (req, res) => {
  try {
    const slug = req.params.slug;

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

    // 3️⃣ Lấy danh sách tour thuộc danh mục cha & các danh mục con
    const tours = await Tour.find({
      status: "active",
      categoryId: { $in: categoryIds },
      deleted: false,
    })
      .populate("categoryId", "name price")
      .populate("services")
      .limit(8)
      .lean();

    for (const item of tours) {
      item.newPrice = parseInt(
        (item.totalPrice * (100 - item.discountPercentage)) / 100
      );
    }

    const total = tours.length;

    res.status(200).json({
      code: 200,
      tours,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách tour!",
    });
  }
};

// [GET] /api/v1/home/destination/:slug
module.exports.getDestination = async (req, res) => {
  try {
    const slug = req.params.slug;

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

    // 3️⃣ Lấy danh sách tour thuộc danh mục cha & các danh mục con
    const tours = await Tour.find({
      status: "active",
      categoryId: { $in: categoryIds },
      deleted: false,
    }).lean();

    let arrSlug = [];
    for (const item of tours) {
      let itemSlug = item.slug.split("-");
      itemSlug.pop();
      itemSlug.shift();
      arrSlug.push(itemSlug.join("-"));
    }

    // 4️⃣ Truy vấn danh sách destination có slug phù hợp
    let destinations = await Destination.find({
      slug: { $in: arrSlug },
    }).lean();

    // 5️⃣ Tính toán số lượng tour cho mỗi destination
    let destinationWithQuantity = destinations
      .map((destination) => ({
        ...destination,
        quantity: tours.filter((tour) => tour.slug.includes(destination.slug))
          .length,
      }))
      .sort((a, b) => b.quantity - a.quantity) // Sắp xếp giảm dần theo quantity
      .slice(0, 5); // Giới hạn tối đa 5 bản ghi

    // 6️⃣ Nếu chưa đủ 5 bản ghi, bổ sung destination khác từ DB
    if (destinationWithQuantity.length < 5) {
      const extraDestinations = await Destination.find({
        _id: { $nin: destinationWithQuantity.map((d) => d._id) }, // Tránh trùng
      })
        .limit(5 - destinationWithQuantity.length) // Lấy thêm cho đủ 5 bản ghi
        .lean();

      destinationWithQuantity = [
        ...destinationWithQuantity,
        ...extraDestinations,
      ];
    }

    res.status(200).json({
      code: 200,
      destinations: destinationWithQuantity,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy dữ liệu!",
    });
  }
};
