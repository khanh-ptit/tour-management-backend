const roomRoutes = require("./room.route");
const authRoutes = require("./auth.route");
const tourRoutes = require("./tour.route.js");
const systemConfig = require("../../../../config/system.js");
const authMiddleware = require("../../middlewares/admin/auth.middleware.js");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(
    version + systemConfig.prefixAdmin + "/rooms",
    authMiddleware.requireAuth,
    roomRoutes
  );

  app.use(version + systemConfig.prefixAdmin + "/tours", tourRoutes);

  app.use(version + systemConfig.prefixAdmin + "/auth", authRoutes);
};
