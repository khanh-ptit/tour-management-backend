const RoomChat = require("../../models/room-chat.model");

// [GET] /room-chat/:userId
module.exports.getRoomChatByUser = async (req, res) => {
  try {
    const userId = req.user.userId;

    const roomChat = await RoomChat.findOne({
      user: userId,
    }).select("title _id");
    res.status(200).json({
      code: 200,
      roomChat,
      // title: roomChat.title,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy thông tin phòng chat!",
    });
  }
};
