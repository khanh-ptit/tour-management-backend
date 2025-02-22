const roomRoutes = require("./room.route");
const systemConfig = require("../../../../config/system.js")

module.exports = (app) => {
  const version = "/api/v1";

  app.use(version + systemConfig.prefixAdmin + "/rooms", roomRoutes);
};
