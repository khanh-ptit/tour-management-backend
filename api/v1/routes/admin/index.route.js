const roomRoutes = require("./room.route");
const authRoutes = require("./auth.route");
const systemConfig = require("../../../../config/system.js");
const authMiddleware = require("../../middlewares/admin/auth.middleware.js");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(
    version + systemConfig.prefixAdmin + "/rooms",
    authMiddleware.requireAuth,
    roomRoutes
  );

  app.use(version + systemConfig.prefixAdmin + "/auth", authRoutes);
};
