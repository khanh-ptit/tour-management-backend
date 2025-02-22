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
  console.log(objectPagination);

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
