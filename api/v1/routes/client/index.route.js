const homeRoutes = require("./home.route");
const tourCategoryRoutes = require("./tour-category.route");
const destinationRoutes = require("./destination.route");
const tourRoutes = require("./tour.route");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(version + "/home", homeRoutes);

  app.use(version + "/tour-categories", tourCategoryRoutes);

  app.use(version + "/destinations", destinationRoutes);

  app.use(version + "/tours", tourRoutes);
};
