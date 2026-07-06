const morgan = require("morgan");
const logger = require("../utils/logger");

// Custom Morgan token for request body (sanitized)
morgan.token("body", (req) => {
  const body = { ...req.body };

  // Remove sensitive fields from logs
  if (body.password) body.password = "***";
  if (body.confirmPassword) body.confirmPassword = "***";
  if (body.currentPassword) body.currentPassword = "***";
  if (body.token) body.token = "***";
  if (body.otp) body.otp = "***";

  return JSON.stringify(body);
});

// Custom Morgan token for user info
morgan.token("user", (req) => {
  if (req.user) {
    return `[${req.user.role}:${req.user.id}]`;
  }
  return "[guest]";
});

// Custom Morgan token for response time with color
morgan.token("status-colored", (req, res) => {
  const status = res.statusCode;
  if (status >= 500) return `\x1b[31m${status}\x1b[0m`; // red
  if (status >= 400) return `\x1b[33m${status}\x1b[0m`; // yellow
  if (status >= 300) return `\x1b[36m${status}\x1b[0m`; // cyan
  if (status >= 200) return `\x1b[32m${status}\x1b[0m`; // green
  return `${status}`;
});

// Development format — detailed with colors
const developmentFormat =
  ":method :url :status-colored :response-time ms — :user — body: :body";

// Production format — clean without body
const productionFormat =
  ":remote-addr :method :url :status :response-time ms :user-agent";

// Choose format based on environment
const morganFormat =
  process.env.NODE_ENV === "production" ? productionFormat : developmentFormat;

// Morgan middleware using winston stream
const httpLogger = morgan(morganFormat, {
  stream: logger.stream,

  // Skip health check routes to avoid log noise
  skip: (req) => {
    return req.url === "/health" || req.url === "/api/health";
  },
});

// Request logger middleware — logs start of every request
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Log when request comes in
  logger.debug(`→ ${req.method} ${req.originalUrl} from ${req.ip}`);

  // Override res.end to log when response is sent
  const originalEnd = res.end;
  res.end = function (...args) {
    const duration = Date.now() - start;
    const status = res.statusCode;

    if (status >= 500) {
      logger.error(
        `← ${req.method} ${req.originalUrl} ${status} ${duration}ms`,
      );
    } else if (status >= 400) {
      logger.warn(`← ${req.method} ${req.originalUrl} ${status} ${duration}ms`);
    } else {
      logger.debug(
        `← ${req.method} ${req.originalUrl} ${status} ${duration}ms`,
      );
    }

    originalEnd.apply(res, args);
  };

  next();
};

// Log slow requests (over 2 seconds)
const slowRequestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (duration > 2000) {
      logger.warn(
        `⚠️  SLOW REQUEST: ${req.method} ${req.originalUrl} took ${duration}ms`,
      );
    }
  });

  next();
};

// Log AI requests separately
const aiRequestLogger = (req, res, next) => {
  if (req.originalUrl.includes("/api/ai")) {
    logger.logAI("Request", {
      method: req.method,
      url: req.originalUrl,
      user: req.user ? req.user.id : "guest",
      subject: req.body.subject || "unknown",
    });
  }
  next();
};

module.exports = {
  httpLogger,
  requestLogger,
  slowRequestLogger,
  aiRequestLogger,
};
