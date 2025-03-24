const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/room-chat.controller");

router.get("/", controller.getRoomChatAdmin);

module.exports = router;
