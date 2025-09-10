const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    fullName: String,
    email: String,
    password: String,
    phone: String,
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      default: "active",
    },
    avatar: {
      type: String,
      default:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjtCIImmPCzDznLfXakp92dvDbAVzkYdxhp5zZbPkGlTDC-YThDAkySJ7G0iXOQKQxb_k&usqp=CAU",
    },
  },
  {
    timestamps: true,
  }
);

const Account = mongoose.model("Account", accountSchema, "accounts");

module.exports = Account;
