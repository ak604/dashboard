const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "My API",
            version: "1.0.0",
            description: "API documentation for authentication using JWT and user-id header",
        },
        components: {
            securitySchemes: {
                BearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                }
            },
        },
        security: [
            { BearerAuth: [] },  // JWT Token Authentication
        ],
    },
    apis: ["./routes/*.js"], // Adjust to your route files
};

const swaggerSpec = swaggerJsDoc(options);

module.exports = swaggerSpec;