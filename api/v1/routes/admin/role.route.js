const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/role.controller");
const validate = require("../../validates/admin/role.validate");

router.post("/create", validate.create, controller.create);

router.get("/", controller.index);

router.get("/detail/:id", controller.detail);

router.delete("/delete/:id", controller.delete);

router.patch("/edit/:id", validate.create, controller.edit);

module.exports = router;
