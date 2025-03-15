const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/destination.controller");

router.get("/:slug", controller.getToursByDestination);

module.exports = router;
