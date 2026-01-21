import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Auth API",
    version: "1.0.0",
    description: "OTP + JWT Authentication APIs",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Server",
    },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: "auth_token",
      },
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
};

const options = {
  swaggerDefinition,
  apis: ["./src/routes/*.js"], // ✅ yaha routes folder path
};

const swaggerSpec = swaggerJSDoc(options);

export default swaggerSpec;
