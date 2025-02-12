// config/swaggerConfig.js
const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Real Estate Sales Agent Performance API",
      version: "1.0.0",
      description: "API documentation for tracking sales agents' call performance",
    },
    servers: [
      {
        url: "http://localhost:3000", // Change this to your production URL
      },
    ],
  },
  apis: ["./routes/*.js"], // Load all route files for documentation
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = swaggerSpec;
