const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/tour-category.controller");

router.get("/:slug", controller.getTourByCategory);

router.get("/", controller.index);

module.exports = router;
