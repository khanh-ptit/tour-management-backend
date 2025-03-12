const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/home.controller");

router.get("/tour-categories/:slug", controller.getTourByCategory);

// router.get("/destination/:slug", controller.getDestination);

module.exports = router;
