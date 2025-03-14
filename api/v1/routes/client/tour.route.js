const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/tour.controller");

router.get("/:slug", controller.getTourByCategory);

module.exports = router;
