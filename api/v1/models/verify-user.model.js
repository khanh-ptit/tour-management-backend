const mongoose = require("mongoose");

const verifyUserSchema = new mongoose.Schema(
  {
    email: String,
    otp: String,
    expireAt: {
      type: Date,
      expires: 0,
    },
  },
  {
    timestamps: true,
  }
);

const VerifyUser = mongoose.model(
  "VerifyUser",
  verifyUserSchema,
  "verify-user"
);

module.exports = VerifyUser;
