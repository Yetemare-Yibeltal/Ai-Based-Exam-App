const { errorResponse } = require("../utils/apiResponse");
const logger = require("../utils/logger");

// Handle all requests to undefined routes
const notFound = (req, res, next) => {
  const message = `Route ${req.method} ${req.originalUrl} not found on this server`;

  logger.warn(`404 — ${req.method} ${req.originalUrl} — IP: ${req.ip}`);

  return errorResponse(res, message, 404);
};

module.exports = notFound;
