const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "HEROY API",
      version: "1.0.0",
      description:
        "AI-Based Ethiopian University Entrance Exam Practice App API",
      contact: {
        name: "HEROY Support",
        email: "support@heroy.com",
      },
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? "https://heroy-api.railway.app/api"
            : "http://localhost:5000/api",
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Development",
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
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string" },
            email: { type: "string", format: "email" },
            grade: { type: "string", enum: ["Grade 11", "Grade 12"] },
            school: { type: "string" },
            avatar: { type: "string" },
            averageScore: { type: "number" },
            totalQuizzesTaken: { type: "number" },
            studyStreak: { type: "number" },
          },
        },
        Question: {
          type: "object",
          properties: {
            id: { type: "string" },
            questionText: { type: "string" },
            options: {
              type: "array",
              items: { type: "string" },
              minItems: 4,
              maxItems: 4,
            },
            subject: {
              type: "string",
              enum: [
                "math",
                "english",
                "biology",
                "chemistry",
                "physics",
                "civics",
              ],
            },
            difficulty: { type: "string", enum: ["easy", "medium", "hard"] },
            grade: { type: "string", enum: ["Grade 11", "Grade 12", "Both"] },
            topic: { type: "string" },
            isAIGenerated: { type: "boolean" },
          },
        },
        Score: {
          type: "object",
          properties: {
            id: { type: "string" },
            subject: { type: "string" },
            totalQuestions: { type: "number" },
            correctAnswers: { type: "number" },
            percentage: { type: "number" },
            grade: { type: "string" },
            timeTaken: { type: "number" },
            feedback: { type: "string" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Student Auth", description: "Student authentication" },
      { name: "Teacher Auth", description: "Teacher authentication" },
      { name: "Admin Auth", description: "Admin authentication" },
      { name: "Quiz", description: "Quiz and question endpoints" },
      { name: "Scores", description: "Score management endpoints" },
      { name: "Leaderboard", description: "Leaderboard endpoints" },
      { name: "Profile", description: "Profile management endpoints" },
      { name: "Study Tips", description: "AI study tips endpoints" },
      { name: "Teacher Questions", description: "Teacher question management" },
      { name: "AI", description: "AI generation endpoints" },
      { name: "Admin Users", description: "Admin user management" },
      { name: "Admin Questions", description: "Admin question management" },
      { name: "Admin Analytics", description: "Admin analytics endpoints" },
      { name: "Admin Reports", description: "Admin report endpoints" },
      { name: "Admin Settings", description: "Admin settings endpoints" },
      { name: "Notifications", description: "Notification endpoints" },
    ],
  },
  apis: ["./routes/**/*.js", "./controllers/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(options);

const setupSwaggerDocs = (app) => {
  app.use(
    "/api/docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, {
      customCss: ".swagger-ui .topbar { background-color: #1B3A6B; }",
      customSiteTitle: "HEROY API Docs",
      customfavIcon: "/favicon.ico",
      swaggerOptions: {
        persistAuthorization: true,
        displayRequestDuration: true,
        filter: true,
        tryItOutEnabled: true,
      },
    }),
  );

  app.get("/api/docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  console.log(
    `📄 API Docs: http://localhost:${process.env.PORT || 5000}/api/docs`,
  );
};

module.exports = setupSwaggerDocs;
