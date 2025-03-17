const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/auth.controller");

router.post("/me", controller.me);

module.exports = router;
