const roomRoutes = require("./room.route");
const authRoutes = require("./auth.route");
const tourRoutes = require("./tour.route.js");
const serviceRoutes = require("./service.route");
const destinationRoutes = require("./destination.route");
const tourCategoryRoutes = require("./tour-category.route");
const systemConfig = require("../../../../config/system.js");
const authMiddleware = require("../../middlewares/admin/auth.middleware.js");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(
    version + systemConfig.prefixAdmin + "/rooms",
    authMiddleware.requireAuth,
    roomRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/services",
    authMiddleware.requireAuth,
    serviceRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/tours",
    authMiddleware.requireAuth,
    tourRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/tour-categories",
    authMiddleware.requireAuth,
    tourCategoryRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/destinations",
    destinationRoutes
  );

  app.use(version + systemConfig.prefixAdmin + "/auth", authRoutes);
};
