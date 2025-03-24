const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/chat.controller");

router.get("/:roomChatId", controller.getChatByRoom);

module.exports = router;
