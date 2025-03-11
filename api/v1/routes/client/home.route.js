const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/home.controller");

router.get("/tour-categories/:slug", controller.getTourByCategory);

module.exports = router;
