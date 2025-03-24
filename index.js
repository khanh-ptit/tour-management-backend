const express = require("express");
const http = require("http"); // Import module HTTP để tạo server
const { Server } = require("socket.io"); // Import socket.io
const cookieParser = require("cookie-parser");
const cors = require("cors");
require("dotenv").config();
const database = require("./config/database");

database.connect();

const app = express();
const server = http.createServer(app); // Tạo HTTP server từ Express
const io = new Server(server, {
  cors: {
    origin: [
      "http://localhost:3000",
      "https://tour-management-frontend-khaki.vercel.app",
    ],
    credentials: true,
  },
});

// ✅ Biến global để dùng trong socket
global._io = io;

// Danh sách domain được phép CORS
const allowedOrigins = [
  "http://localhost:3000",
  "https://tour-management-frontend-khaki.vercel.app",
];

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Import routes
const routeAdmin = require("./api/v1/routes/admin/index.route");
const routeClient = require("./api/v1/routes/client/index.route");

routeAdmin(app);
routeClient(app);

// ✅ Import và khởi động socket
const chatSocket = require("./api/v1/sockets/chat.socket");
chatSocket();

// ✅ Khởi động server với socket
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
