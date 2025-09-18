const express = require("express");
const router = express.Router();

const controller = require("../../controllers/admin/dashboard.controller");

router.get("/user-count", controller.userCount);

router.get("/tour-count", controller.tourCount);

router.get("/profit", controller.profit);

router.get("/debt", controller.debt);

router.get("/order-count", controller.orderCount);

router.get("/this-month-profit", controller.thisMonthProfit);

module.exports = router;
