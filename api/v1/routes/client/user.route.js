const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");
const validate = require("../../validates/client/user.validate");

router.post("/register", validate.register, controller.register);

router.post("/login", validate.login, controller.login);

router.post(
  "/password/forgot",
  validate.forgotPassword,
  controller.forgotPassword
);

router.post("/password/otp", validate.otpPassword, controller.otpPassword);

router.delete("/password/delete-otp/:email", controller.deleteAllOtp);

router.patch("/password/reset", controller.resetPassword);

module.exports = router;
