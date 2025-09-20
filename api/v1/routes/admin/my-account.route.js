const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/my-account.controller");
const validate = require("../../validates/admin/my-account.validate");

router.get("/info", controller.info);

router.patch(
  "/change-password",
  validate.changePassword,
  controller.changePassword
);

router.patch("/edit", validate.editInfo, controller.editInfo);

module.exports = router;
