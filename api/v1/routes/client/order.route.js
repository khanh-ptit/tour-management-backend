const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/order.controller");
const authMiddleware = require("../../middlewares/client/auth.middleware");

router.post("/create", authMiddleware.requireAuth, controller.createOrder);

router.get("/detail/:id", authMiddleware.requireAuth, controller.detail);

router.get("/check-payment/:id", controller.checkPayment);

module.exports = router;
