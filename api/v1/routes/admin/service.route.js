const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/service.controller");

router.get("/", controller.index);
/*router.get("/detail/:slug", controller.detail);*/
module.exports = router;
