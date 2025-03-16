const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/tour.controller");

router.get("/", controller.getToursByName);

router.get("/detail/:slug", controller.getTourDetail);

module.exports = router;
