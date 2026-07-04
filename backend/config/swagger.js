const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HEROY AI Exam Practice API",
      version: "1.0.0",
      description:
        "Full REST API documentation for HEROY AI-Based Ethiopian Exam Practice App",
      contact: {
        name: "HEROY Team",
        email: "admin@heroy.com",
      },
    },
    servers: [
      {
        url: "http://localhost:5000",
        description: "Development Server",
      },
      {
        url: process.env.BACKEND_URL || "https://heroy-api.railway.app",
        description: "Production Server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      { name: "Auth", description: "Authentication for all roles" },
      { name: "Student", description: "Student quiz and profile routes" },
      { name: "Teacher", description: "Teacher question management routes" },
      { name: "Admin", description: "Admin dashboard and management routes" },
      { name: "AI", description: "AI question generation routes" },
      { name: "Leaderboard", description: "Leaderboard routes" },
      { name: "Notifications", description: "Notification routes" },
    ],
  },
  apis: [
    "./routes/*.js",
    "./routes/student/*.js",
    "./routes/teacher/*.js",
    "./routes/admin/*.js",
  ],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwagger = (app) => {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      explorer: true,
      customCss: ".swagger-ui .topbar { display: none }",
      customSiteTitle: "HEROY API Docs",
    }),
  );

  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log("📄 API Docs available at http://localhost:5000/api/docs");
};

module.exports = setupSwagger;
