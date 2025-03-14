const homeRoutes = require("./home.route");
const tourRoutes = require("./tour.route");

module.exports = (app) => {
  const version = "/api/v1";

  app.use(version + "/home", homeRoutes);

  app.use(version + "/tour-categories", tourRoutes);
};
