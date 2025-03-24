const jwt = require("jsonwebtoken");
const Chat = require("../models/chat.model");
const User = require("../models/user.model");
const Account = require("../models/account.model");

module.exports = () => {
  // console.log("📌 chat.socket.js has been imported and executed.");

  _io.on("connection", async (socket) => {
    // console.log(`🔗 Socket connected: ${socket.id}`);

    // Lấy token từ socket handshake
    const { token, tokenAdmin } = socket.handshake.auth;

    if (!token && !tokenAdmin) {
      console.log("⚠️ No token provided");
      socket.disconnect();
      return;
    }

    try {
      if (tokenAdmin) {
        // Xác thực token admin
        const decodedAdmin = jwt.verify(tokenAdmin, process.env.JWT_SECRET);
        socket.userId = decodedAdmin.id;
        socket.userType = "Account";
        // console.log(`✅ Admin authenticated: ${socket.userId}`);
      } else {
        // Xác thực token user
        const decodedUser = jwt.verify(token, process.env.JWT_SECRET);
        socket.userId = decodedUser.userId;
        socket.userType = "User";
        // console.log(`✅ User authenticated: ${socket.userId}`);
      }
    } catch (error) {
      // console.log("❌ Invalid token:", error.message);
      socket.disconnect();
      return;
    }

    // 🏠 Tham gia room chat
    socket.on("JOIN_ROOM", (roomChatId) => {
      socket.join(roomChatId);
      console.log(`✅ User ${socket.userId} joined room: ${roomChatId}`);
    });

    // 📩 Nhận tin nhắn từ client và lưu vào database
    socket.on("CLIENT_SEND_MESSAGE", async (data) => {
      try {
        if (!data.roomChatId || !data.content) {
          console.log("⚠️ Missing roomChatId or content");
          return;
        }

        const newChat = new Chat({
          senderId: socket.userId,
          senderType: socket.userType, // Dùng socket.userType thay vì data.senderType để đảm bảo chính xác
          roomChatId: data.roomChatId,
          content: data.content,
        });

        await newChat.save();

        // 📛 Lấy tên người gửi từ DB
        let senderName = "Ẩn danh";
        if (socket.userType === "User") {
          const user = await User.findById(socket.userId)
            .select("fullName")
            .lean();
          senderName = user ? user.fullName : "Người dùng ẩn danh";
        } else if (socket.userType === "Account") {
          const account = await Account.findById(socket.userId)
            .select("fullName")
            .lean();
          senderName = account ? account.fullName : "Quản trị viên ẩn danh";
        }

        // 🚀 Gửi tin nhắn đến room
        _io.to(data.roomChatId).emit("SERVER_RETURN_MESSAGE", {
          ...newChat.toObject(),
          senderName,
        });

        // console.log(
        //   `📨 Message sent by ${socket.userType} ${socket.userId}: ${data.content}`
        // );
      } catch (error) {
        console.error("❌ Error sending message:", error);
      }
    });

    // ❌ Xử lý khi client ngắt kết nối
    socket.on("disconnect", () => {
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });
  });
};
