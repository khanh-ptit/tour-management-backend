const express = require("express");
const router = express.Router();

const authMiddleware = require("../../middlewares/client/auth.middleware");
const controller = require("../../controllers/client/cart.controller");

router.post("/add", authMiddleware.requireAuth, controller.addToCart);

router.get("/", authMiddleware.requireAuth, controller.getCart);

router.patch(
  "/update",
  authMiddleware.requireAuth,
  controller.updateQuantity
);

module.exports = router;
