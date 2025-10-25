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
      ref: "Cart",
    },
    lockedUntil: {
      type: Date,
      default: null,
    },
    lockedBy: {
      type: String,
      enum: ["passwordForgot", "verifyEmail", "exceedingLoginFail", null],
      default: null,
    },
    failedPasswordCount: {
      type: Number,
      default: 0,
    },
    isTwoFa: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema, "users");

module.exports = User;
