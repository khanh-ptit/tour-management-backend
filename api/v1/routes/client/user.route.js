const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/user.controller");

router.post("/register", controller.register);

router.post("/login", controller.login);

router.post("/password/forgot", controller.forgotPassword);

router.post("/password/otp", controller.otpPassword);

router.delete("/password/delete-otp/:email", controller.deleteAllOtp);

router.patch("/password/reset", controller.resetPassword);

module.exports = router;
