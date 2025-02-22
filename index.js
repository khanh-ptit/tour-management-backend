const express = require("express");
const app = express();
require("dotenv").config();
const port = process.env.PORT;
const database = require("./config/database");
database.connect();
const routeAdmin = require("./api/v1/routes/admin/index.route");

const cors = require("cors");

app.use(cors());

routeAdmin(app);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});

