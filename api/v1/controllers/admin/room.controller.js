const Room = require("../../models/room.model");
const searchHelper = require("../../../../helpers/search");
const paginationHelper = require("../../../../helpers/pagination");

// [GET] /api/v1/rooms
module.exports.index = async (req, res) => {
  let find = {
    deleted: false,
  };

  console.log(req.query);

  const objectSearch = searchHelper(req.query, "name");
  if (req.query.name) {
    find.slug = objectSearch.regex;
  }

  if (req.query.status) {
    find.status = req.query.status;
  }

  // Pagination
  const objectPagination = paginationHelper(req.query);

  let sort = {};
  if (req.query.sortKey && req.query.sortValue) {
    sort[req.query.sortKey] = req.query.sortValue;
  }
  // console.log(sort);

  const rooms = await Room.find(find)
    .sort(sort)
    .skip(objectPagination.skip)
    .limit(objectPagination.limitedItem);
  res.json(rooms);
};

// [GET] /api/v1/admin/rooms/detail/:slug
module.exports.detail = async (req, res) => {
  const slug = req.params.slug;
  const room = await Room.findOne({ slug: slug });

  if (!room) {
    return res.status(404).json({ message: "Room not found" });
  }

  res.json(room);
};

// [PATCH] /api/v1/admin/rooms/edit/:slug
module.exports.editPatch = async (req, res) => {
  const slug = req.params.slug;
  const result = await Room.updateOne({ slug: slug }, req.body);
  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ code: 404, message: "Không tìm thấy phòng!" });
  }
  res.json({
    code: 200,
    message: "Cập nhật thành công cho phòng!",
  });
};

// [DELETE] /api/v1/admin/rooms/patch/:slug
module.exports.deleteItem = async (req, res) => {
  const slug = req.params.slug;
  const result = await Room.updateOne({ slug: slug }, { deleted: true });
  if (result.matchedCount === 0) {
    return res
      .status(404)
      .json({ code: 404, message: "Không tìm thấy phòng!" });
  }
  res.json({
    code: 200,
    message: "Xóa phòng thành công!",
  });
};

// [POST] /api/v1/admin/rooms/create
module.exports.createPost = async (req, res) => {
  try {
    console.log(req.body);
    const newRoom = new Room(req.body);
    console.log(newRoom);
    await newRoom.save();
    res.status(201).json({
      code: 201,
      message: "Thêm phòng thành công",
    });
  } catch (error) {
    console.error("Lỗi khi thêm phòng:", error);
    res.status(400).json({
      code: 400,
      message: "Thêm phòng thất bại",
      error: error.message,
    });
  }
};
