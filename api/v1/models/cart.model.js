const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Tham chiếu đến model User
      required: true,
      unique: true, // Mỗi người dùng chỉ có một giỏ hàng
    },
    tours: [
      {
        tourId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tour", // Tham chiếu đến model Product
          required: true,
        },
        peopleQuantity: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Cart = mongoose.model("cart", cartSchema, "carts");

module.exports = Cart;
