const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/room.controller");

router.get("/", controller.index);

module.exports = router;
