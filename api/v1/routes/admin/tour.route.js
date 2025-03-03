const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/tour.controller");

router.get("/", controller.index);

router.post("/create", controller.createPost);

router.delete("/delete/:slug", controller.deleteItem);

router.get("/detail/:slug", controller.detail);

router.patch("/edit/:slug", controller.editPatch);

module.exports = router;
