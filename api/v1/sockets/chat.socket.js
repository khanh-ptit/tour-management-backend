const jwt = require("jsonwebtoken");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Account = require("../models/account.model");

module.exports = () => {
  console.log("📌 chat.socket.js has been imported and executed.");
  console.log("🛠️ _io inside chat.socket.js:", _io);

  _io.on("connection", async (socket) => {
    console.log(`🔗 Socket connected: ${socket.id}`);

    // Lấy token từ socket handshake
    const token = socket.handshake.auth?.token;
    if (!token) {
      console.log("⚠️ No token provided");
      socket.disconnect();
      return;
    }

    try {
      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId; // Gán userId vào socket
      console.log(`✅ User authenticated: ${socket.userId}`);
    } catch (error) {
      console.log("❌ Invalid token");
      socket.disconnect();
      return;
    }

    // Tham gia room chat
    socket.on("JOIN_ROOM", (roomChatId) => {
      socket.join(roomChatId);
      console.log(`✅ User ${socket.userId} joined room: ${roomChatId}`);
    });

    // Nhận tin nhắn từ client
    socket.on("CLIENT_SEND_MESSAGE", async (data) => {
      try {
        const newChat = new Chat({
          senderId: socket.userId,
          senderType: data.senderType,
          roomChatId: data.roomChatId,
          content: data.content,
        });

        await newChat.save();

        // Lấy senderName từ DB
        let senderName = "Ẩn danh";
        if (data.senderType === "User") {
          const user = await User.findById(socket.userId)
            .select("fullName")
            .lean();
          senderName = user ? user.fullName : "Người dùng ẩn danh";
        } else if (data.senderType === "Account") {
          const account = await Account.findById(socket.userId)
            .select("fullName")
            .lean();
          senderName = account ? account.fullName : "Quản trị viên ẩn danh";
        }

        // Gửi tin nhắn đến room kèm theo senderName
        _io.to(data.roomChatId).emit("SERVER_RETURN_MESSAGE", {
          ...newChat.toObject(),
          senderName,
        });
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });

    // Khi client ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
