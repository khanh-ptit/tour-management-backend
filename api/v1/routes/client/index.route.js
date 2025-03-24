const homeRoutes = require("./home.route");
const tourCategoryRoutes = require("./tour-category.route");
const destinationRoutes = require("./destination.route");
const tourRoutes = require("./tour.route");
const userRoutes = require("./user.route");
const authRoutes = require("./auth.route");
const cartRoutes = require("./cart.route");
const orderRoutes = require("./order.route");
const roomChatRoutes = require("./room-chat.route");
const chatRoutes = require("./chat.route");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(version + "/home", homeRoutes);

  app.use(version + "/tour-categories", tourCategoryRoutes);

  app.use(version + "/destinations", destinationRoutes);

  app.use(version + "/tours", tourRoutes);

  app.use(version + "/user", userRoutes);

  app.use(version + "/auth", authRoutes);

  app.use(version + "/cart", cartRoutes);

  app.use(version + "/orders", orderRoutes);

  app.use(version + "/room-chat", roomChatRoutes);

  app.use(version + "/chat", chatRoutes);
};
