const express = require("express");
const app = express();
require("dotenv").config();
const cookieParser = require("cookie-parser");
const database = require("./config/database");
const cors = require("cors");

database.connect();

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

// Import route
const routeAdmin = require("./api/v1/routes/admin/index.route");
const routeClient = require("./api/v1/routes/client/index.route");

routeAdmin(app);
routeClient(app);

// Giải phóng cổng trước khi restart (Fix lỗi EADDRINUSE)
const PORT = process.env.PORT || 5000;
let server;

const startServer = () => {
  if (server) {
    server.close(() => {
      console.log("🔄 Server restarting...");
    });
  }

  server = app
    .listen(PORT, () => {
      console.log(`✅ Server is running on port ${PORT}`);
    })
    .on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.log(`⚠️ Cổng ${PORT} bị chiếm. Đang thử cổng khác...`);
        server = app.listen(PORT + 1);
      }
    });
};

startServer();
