const mongoose = require("mongoose");

const chatSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "senderType", // Tham chiếu động dựa vào senderType
    },
    senderType: {
      type: String,
      enum: ["User", "Account"], // Phải khớp với tên model đã đăng ký
      required: true,
    },
    roomChatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RoomChat",
      required: true,
    },
    content: { type: String, required: true },
    deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Chat = mongoose.model("Chat", chatSchema, "chats");

module.exports = Chat;
