const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    phone: String,
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "initial",
    },
    avatar: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjtCIImmPCzDznLfXakp92dvDbAVzkYdxhp5zZbPkGlTDC-YThDAkySJ7G0iXOQKQxb_k&usqp=CAU",
    },
    cartId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart", // Tham chiếu đến model Cart
    },
    lockedUntil: {
      type: Date,
      default: null, // Thời điểm mà tài khoản sẽ được mở khóa, null nếu không bị khóa
    },
    lockedBy: {
      type: String,
      enum: ["passwordForgot", "verifyEmail", null], // Thêm trường này
      default: null, // Lưu thông tin nguồn khóa tài khoản
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
