const RoomChat = require("../../models/room-chat.model");

// [GET] /api/v1/admin/rooms-chat
module.exports.getRoomChatAdmin = async (req, res) => {
  try {
    // console.log(req.user);
    const roomsChat = await RoomChat.find({ deleted: false }).populate(
      "user",
      "fullName"
    );
    res.status(200).json({
      code: 200,
      roomsChat,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy các đoạn chat!",
    });
  }
};
