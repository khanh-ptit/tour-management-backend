const swaggerJsdoc = require("swagger-jsdoc");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0", // chuẩn OpenAPI
    info: {
      title: "Tour Management API",
      version: "1.0.0",
      description: "API tài liệu cho dự án Tour Management",
    },
  },
  // Chỉ định nơi swagger-jsdoc quét JSDoc comments
  apis: [
    path.resolve(__dirname, "../routes/admin/*.js"),
    path.resolve(__dirname, "../routes/client/*.js"),
    // "./api/models/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
