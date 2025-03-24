const mongoose = require("mongoose");

const roomChatSchema = new mongoose.Schema(
  {
    title: { type: String, required: true }, // Tiêu đề phòng chat
    typeRoom: { type: String, required: true }, // Loại phòng (private, group,...)
    status: { type: String, default: "active" }, // Trạng thái phòng chat
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người dùng
    admins: [
      {
        adminId: { type: mongoose.Schema.Types.ObjectId, ref: "Account" }, // Danh sách admin
      },
    ],
    deleted: { type: Boolean, default: false }, // Cờ xóa mềm
    deletedAt: { type: Date }, // Thời gian bị xóa
  },
  { timestamps: true }
);

const RoomChat = mongoose.model("RoomChat", roomChatSchema, "rooms-chat");

module.exports = RoomChat;
