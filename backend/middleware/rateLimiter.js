const rateLimit = require("express-rate-limit");
const logger = require("../utils/logger");

// Custom handler for when rate limit is exceeded
const rateLimitExceededHandler = (req, res, next, options) => {
  logger.warn(
    `Rate limit exceeded — IP: ${req.ip} — URL: ${req.originalUrl} — Method: ${req.method}`,
  );

  return res.status(options.statusCode).json({
    success: false,
    message: options.message.message,
    retryAfter: Math.ceil(options.windowMs / 1000 / 60),
  });
};

// Global rate limiter — applies to all routes
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message:
      "Too many requests from this IP. Please try again after 15 minutes",
  },
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.url === "/health" || req.url === "/api/health";
  },
});

// Auth rate limiter — strict limit for login and register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message:
      "Too many login attempts from this IP. Please try again after 15 minutes",
  },
  skipSuccessfulRequests: true, // Don't count successful logins
});

// Registration rate limiter
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message:
      "Too many accounts created from this IP. Please try again after 1 hour",
  },
});

// Password reset rate limiter
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message: "Too many password reset attempts. Please try again after 1 hour",
  },
});

// OTP verification rate limiter
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message:
      "Too many OTP verification attempts. Please try again after 15 minutes",
  },
});

// AI generation rate limiter — expensive operation
const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message:
      "AI generation limit reached. You can generate up to 20 questions per hour. Please try again later",
  },
  keyGenerator: (req) => {
    // Rate limit by user ID if authenticated, otherwise by IP
    return req.userId || req.ip;
  },
});

// Quiz submission rate limiter
const quizLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message: "Too many quiz submissions. Please slow down and try again",
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
});

// File upload rate limiter
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message: "Too many file uploads. You can upload up to 20 files per hour",
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
});

// Admin operations rate limiter — relaxed
const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message: "Too many admin requests. Please try again after 15 minutes",
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
});

// Teacher operations rate limiter
const teacherLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message: "Too many requests. Please try again after 15 minutes",
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
});

// Search rate limiter
const searchLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message: "Too many search requests. Please slow down",
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
});

// Report generation rate limiter
const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message:
      "Too many report generation requests. You can generate up to 10 reports per hour",
  },
  keyGenerator: (req) => {
    return req.userId || req.ip;
  },
});

// Email sending rate limiter
const emailLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitExceededHandler,
  message: {
    success: false,
    message: "Too many email requests. You can request up to 5 emails per hour",
  },
  keyGenerator: (req) => {
    return req.body.email || req.userId || req.ip;
  },
});

module.exports = {
  globalLimiter,
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  otpLimiter,
  aiLimiter,
  quizLimiter,
  uploadLimiter,
  adminLimiter,
  teacherLimiter,
  searchLimiter,
  reportLimiter,
  emailLimiter,
};
