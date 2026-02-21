import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Healthko API",
    version: "1.0.0",
    description: "Healthko Backend APIs including Auth, Orders, and Services",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Development Server",
    },
    {
      url: "https://api.healthko.in/",
      description: "Production Server",
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
    schemas: {
      Order: {
        type: "object",
        properties: {
          _id: { type: "string" },
          user: { type: "string" },
          patientName: { type: "string" },
          patientAge: { type: "number" },
          patientGender: { type: "string", enum: ["male", "female", "other"] },
          address: { type: "string" },
          location: {
            type: "object",
            properties: {
              type: { type: "string", example: "Point" },
              coordinates: { type: "array", items: { type: "number" }, example: [75.8577, 22.7196] },
            },
          },
          services: {
            type: "array",
            items: {
              type: "object",
              properties: {
                service: { type: "string" },
                quantity: { type: "number" },
              },
            },
          },
          totalAmount: { type: "number" },
          appointmentDateTime: { type: "string", format: "date-time" },
          status: {
            type: "string",
            enum: ["pending", "paid", "notified", "accepted", "assigned", "completed", "cancelled"],
          },
          notes: { type: "string" },
          payment: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Payment: {
        type: "object",
        properties: {
          _id: { type: "string" },
          order: { type: "string" },
          amount: { type: "number" },
          status: { type: "string", enum: ["pending", "paid", "failed", "refunded"] },
          method: { type: "string", enum: ["card", "upi", "wallet", "razorpay", "paytm"] },
          transactionId: { type: "string" },
          gatewayResponse: { type: "object" },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
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
