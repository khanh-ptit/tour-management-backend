const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/account.controller");
const validate = require("../../validates/admin/account.validate");

router.get("/", controller.index);

router.delete("/delete/:id", controller.delete);

router.post("/create", validate.create, controller.create);

router.get("/detail/:id", controller.detail);

router.patch("/edit/:id", validate.edit, controller.edit);

module.exports = router;
