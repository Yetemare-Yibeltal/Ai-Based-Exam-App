const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const cookieParser = require("cookie-parser");

// Load environment variables first
dotenv.config();

// Import database connection
const connectDB = require("./config/db");

// Import logger
const logger = require("./utils/logger");

// Import swagger
const setupSwagger = require("./config/swagger");

// Import middleware
const {
  httpLogger,
  requestLogger,
  slowRequestLogger,
} = require("./middleware/logger");
const { errorHandler } = require("./middleware/errorHandler");
const notFound = require("./middleware/notFound");
const { globalLimiter } = require("./middleware/rateLimiter");
const corsOptions = require("./config/corsOptions");

// Import routes
const routes = require("./routes/index");

// Connect to database
connectDB();

// Initialize express app
const app = express();

// ── SECURITY MIDDLEWARE ────────────────────────────────────

// Set security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false,
  }),
);

// Enable CORS
app.use(cors(corsOptions));

// Handle preflight requests
app.options("*", cors(corsOptions));

// ── PARSING MIDDLEWARE ─────────────────────────────────────

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Parse cookies
app.use(cookieParser());

// ── SANITIZATION MIDDLEWARE ────────────────────────────────

// Sanitize data against NoSQL query injection
app.use(mongoSanitize());

// ── COMPRESSION MIDDLEWARE ─────────────────────────────────

// Compress responses
app.use(compression());

// ── LOGGING MIDDLEWARE ─────────────────────────────────────

// HTTP request logging
app.use(httpLogger);

// Custom request logging
app.use(requestLogger);

// Slow request detection
app.use(slowRequestLogger);

// ── RATE LIMITING ──────────────────────────────────────────

// Apply global rate limiter to all routes
app.use(globalLimiter);

// ── HEALTH CHECK ───────────────────────────────────────────

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "HEROY API is running! 🚀🇪🇹",
    environment: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    uptime: `${Math.floor(process.uptime())} seconds`,
    version: "1.0.0",
  });
});

// ── API DOCUMENTATION ──────────────────────────────────────

// Setup Swagger docs at /api/docs
setupSwagger(app);

// ── API ROUTES ─────────────────────────────────────────────

// Mount all routes
app.use("/api", routes);

// ── ERROR HANDLING ─────────────────────────────────────────

// Handle undefined routes
app.use(notFound);

// Global error handler
app.use(errorHandler);

// ── START SERVER ───────────────────────────────────────────

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  logger.info(
    `🚀 HEROY Server running in ${process.env.NODE_ENV} mode on port ${PORT}`,
  );
  logger.info(`📄 API Docs available at http://localhost:${PORT}/api/docs`);
  logger.info(`❤️  Health check at http://localhost:${PORT}/health`);
});

// ── GRACEFUL SHUTDOWN ──────────────────────────────────────

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`💥 Unhandled Rejection: ${err.message}`);
  server.close(() => {
    logger.error("Server closed due to unhandled rejection");
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`💥 Uncaught Exception: ${err.message}`);
  server.close(() => {
    logger.error("Server closed due to uncaught exception");
    process.exit(1);
  });
});

// Handle SIGTERM signal (from hosting platforms like Railway)
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed gracefully");
    process.exit(0);
  });
});

// Handle SIGINT signal (Ctrl+C)
process.on("SIGINT", () => {
  logger.info("SIGINT received. Shutting down gracefully...");
  server.close(() => {
    logger.info("Server closed gracefully");
    process.exit(0);
  });
});

module.exports = server;
