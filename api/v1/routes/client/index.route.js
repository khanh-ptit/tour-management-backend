const homeRoutes = require("./home.route");
const tourRoutes = require("./tour.route");
const destinationRoutes = require("./destination.route");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(version + "/home", homeRoutes);

  app.use(version + "/tour-categories", tourRoutes);

  app.use(version + "/destinations", destinationRoutes);
};
