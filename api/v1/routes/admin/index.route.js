const roomRoutes = require("./room.route");
const authRoutes = require("./auth.route");
const tourRoutes = require("./tour.route.js");
const serviceRoutes = require("./service.route");
const destinationRoutes = require("./destination.route");
const tourCategoryRoutes = require("./tour-category.route");
const roomChatRoutes = require("./room-chat.route.js");
const chatRoutes = require("./chat.route.js");
const roleRoutes = require("./role.route.js");
const accountRoutes = require("./account.route.js");
const userRoutes = require("./user.route.js");
const orderRoutes = require("./order.route.js");
const dashboardRoutes = require("./dashboard.route.js");
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
    authMiddleware.requireAuth,
    destinationRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/room-chat",
    authMiddleware.requireAuth,
    roomChatRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/chats",
    authMiddleware.requireAuth,
    chatRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/roles",
    authMiddleware.requireAuth,
    roleRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/accounts",
    authMiddleware.requireAuth,
    accountRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/users",
    authMiddleware.requireAuth,
    userRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/orders",
    authMiddleware.requireAuth,
    orderRoutes
  );

  app.use(
    version + systemConfig.prefixAdmin + "/dashboard",
    authMiddleware.requireAuth,
    dashboardRoutes
  );

  app.use(version + systemConfig.prefixAdmin + "/auth", authRoutes);
};
