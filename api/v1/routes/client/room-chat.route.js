const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/room-chat.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

router.get("/", authMiddleware.requireAuth, controller.getRoomChatByUser);

module.exports = router;
