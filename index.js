const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const cookieParser = require("cookie-parser");
const database = require("./config/database");
database.connect();
const routeAdmin = require("./api/v1/routes/admin/index.route");
const routeClient = require("./api/v1/routes/client/index.route");

const cors = require("cors");
const allowedOrigins = [
  "http://localhost:3000",
  "https://admin.mysite.com", // Domain chính thức
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

routeAdmin(app);
routeClient(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
