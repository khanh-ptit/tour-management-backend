const Destination = require("../../models/destination.model");

// [GET] /api/v1/admin/destination
module.exports.index = async (req, res) => {
  try {
    let sort = {
      createdAt: "desc",
    };
    const destinations = await Destination.find({ deleted: false }).sort(sort);
    const total = await Destination.countDocuments({ deleted: false });
    res.status(200).json({
      destinations,
      total,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi lấy danh sách điểm đến!",
    });
  }
};

// [DELETE] /api/v1/admin/destinations/delete/:slug
module.exports.deleteItem = async (req, res) => {
  try {
    const slug = req.params.slug;
    await Destination.updateOne({ slug: slug }, { deleted: true });
    res.status(200).json({
      code: 200,
      message: "Xóa thành công điểm đến!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi xóa điểm đến!",
    });
  }
};

// [POST] /api/v1/admin/destinations/create
module.exports.createPost = async (req, res) => {
  try {
    const newDestination = new Destination(req.body);
    await newDestination.save();
    res.status(200).json({
      code: 200,
      message: "Thêm thành công điểm đến!",
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi thêm điểm đến!",
    });
  }
};

// [PATCH] /api/v1/admin/destinations/edit/:slug
module.exports.editPatch = async (req, res) => {
  try {
    const slug = req.params.slug;
    const updateDestination = await Destination.updateOne(
      { slug: slug },
      req.body
    );
    if (updateDestination) {
      res.status(200).json({
        code: 200,
        message: "Cập nhật điểm đến thành công!",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Lỗi khi chỉnh sửa điểm đến!",
    });
  }
};
