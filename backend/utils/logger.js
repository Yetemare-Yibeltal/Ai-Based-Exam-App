const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, "../logs");
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level.toUpperCase()}: ${message}`;
  }),
);

// Console format with colors
const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    if (stack) {
      return `[${timestamp}] ${level}: ${message}\n${stack}`;
    }
    return `[${timestamp}] ${level}: ${message}`;
  }),
);

const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "warn" : "debug",
  format: logFormat,
  transports: [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),

    // Info log file
    new winston.transports.File({
      filename: path.join(logsDir, "info.log"),
      level: "info",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Error log file
    new winston.transports.File({
      filename: path.join(logsDir, "error.log"),
      level: "error",
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),

    // Combined log file
    new winston.transports.File({
      filename: path.join(logsDir, "combined.log"),
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],

  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "exceptions.log"),
    }),
  ],

  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(logsDir, "rejections.log"),
    }),
  ],
});

// Stream for Morgan HTTP logger
logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

// Helper methods
logger.logRequest = (req) => {
  logger.info(`${req.method} ${req.originalUrl} - IP: ${req.ip}`);
};

logger.logError = (err, req = null) => {
  if (req) {
    logger.error(
      `${err.message} - ${req.method} ${req.originalUrl} - IP: ${req.ip}`,
    );
  } else {
    logger.error(err.message);
  }
};

logger.logAI = (action, details) => {
  logger.info(`[AI] ${action}: ${JSON.stringify(details)}`);
};

logger.logDB = (action, collection) => {
  logger.debug(`[DB] ${action} on ${collection}`);
};

logger.logAuth = (action, userId, role) => {
  logger.info(`[AUTH] ${action} - User: ${userId} - Role: ${role}`);
};

module.exports = logger;
