const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userInfo: {
      fullName: String,
      phone: String,
      address: String,
    },
    tours: [
      {
        tourId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tour", // Tham chiếu đến model Product
          required: true,
        },
        price: Number,
        discountPercentage: Number,
        peopleQuantity: Number,
      },
    ],
    isPaid: {
      type: Boolean,
      default: false,
    },
    totalPrice: Number,
    deleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Order = mongoose.model("Order", orderSchema, "orders");

module.exports = Order;
