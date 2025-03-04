const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/tour-category.controller");

router.get("/", controller.index);

router.get("/detail/:slug", controller.detail);

router.delete("/delete/:slug", controller.deleteItem);

router.post("/create", controller.createPost);

router.patch("/edit/:slug", controller.editPatch)

module.exports = router;
