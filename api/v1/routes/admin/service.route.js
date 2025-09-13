const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/service.controller");

router.get("/", controller.index);

router.get("/detail/:id", controller.detail)

router.patch("/edit/:id", controller.editPatch)

router.delete("/delete/:id", controller.deleteItem)

router.post("/create", controller.createPost)

module.exports = router;
/*router.get("/detail/:slug", controller.detail);*/
module.exports = router;
