const Chat = require("../../models/chat.model");
const User = require("../../models/user.model");
const Account = require("../../models/account.model");

// [GET] /api/v1/chat/:roomChatId
module.exports.getChatByRoom = async (req, res) => {
  try {
    const roomChatId = req.params.roomChatId;

    // Lấy danh sách tin nhắn dưới dạng object thuần (plain JavaScript object)
    let chats = await Chat.find({
      roomChatId: roomChatId,
      deleted: false,
    }).lean(); // Dùng lean để giảm tải hiệu suất

    // Duyệt qua từng tin nhắn để lấy fullName
    for (const chat of chats) {
      if (chat.senderType === "User") {
        const user = await User.findById(chat.senderId)
          .select("fullName")
          .lean();
        chat.senderName = user ? user.fullName : "Người dùng ẩn danh";
      } else if (chat.senderType === "Account") {
        const account = await Account.findById(chat.senderId)
          .select("fullName")
          .lean();
        chat.senderName = account ? account.fullName : "Quản trị viên ẩn danh";
      }
    }

    res.status(200).json({
      code: 200,
      chats,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi khi lấy tin nhắn!",
    });
  }
};

// [POST] /api/v1/chat/create
module.exports.createChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    // console.log(req.body);
    const object = req.body;
    object.senderId = userId;
    const newChat = new Chat(object);
    // console.log(newChat);

    await newChat.save();
    res.status(200).json({
      code: 200,
      message: "Đã gửi tin nhắn!",
      chat: newChat, // ✅ Trả về tin nhắn đã lưu
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      code: 500,
      message: "Đã xảy ra lỗi ra gửi tin nhắn!",
    });
  }
};
