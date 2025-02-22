const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/room.controller");

router.get("/", controller.index);

router.get("/detail/:slug", controller.detail)

router.patch("/edit/:slug", controller.editPatch)

router.delete("/delete/:slug", controller.deleteItem)

router.post("/create", controller.createPost)

module.exports = router;
