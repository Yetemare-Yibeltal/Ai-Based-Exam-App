const logger = require("../utils/logger");
const {
  errorResponse,
  validationErrorResponse,
} = require("../utils/apiResponse");

// Handle Mongoose CastError (invalid ObjectId)
const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return { message, statusCode: 400 };
};

// Handle Mongoose duplicate key error
const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue)[0];
  const value = err.keyValue[field];
  const message = `${field} '${value}' already exists. Please use a different ${field}`;
  return { message, statusCode: 409 };
};

// Handle Mongoose validation error
const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((error) => ({
    field: error.path,
    message: error.message,
  }));
  return { errors, statusCode: 422 };
};

// Handle JWT invalid token error
const handleJWTError = () => {
  const message = "Invalid token. Please log in again";
  return { message, statusCode: 401 };
};

// Handle JWT expired token error
const handleJWTExpiredError = () => {
  const message = "Your session has expired. Please log in again";
  return { message, statusCode: 401 };
};

// Handle Multer file upload errors
const handleMulterError = (err) => {
  if (err.code === "LIMIT_FILE_SIZE") {
    return {
      message: "File size too large. Maximum allowed size is 5MB",
      statusCode: 400,
    };
  }
  if (err.code === "LIMIT_FILE_COUNT") {
    return {
      message: "Too many files uploaded at once",
      statusCode: 400,
    };
  }
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return {
      message: `Unexpected file field: ${err.field}`,
      statusCode: 400,
    };
  }
  return {
    message: "File upload error. Please try again",
    statusCode: 400,
  };
};

// Handle syntax errors in JSON body
const handleSyntaxError = () => {
  return {
    message: "Invalid JSON in request body. Please check your request format",
    statusCode: 400,
  };
};

// Development error response — includes full stack trace
const sendDevError = (err, res) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message,
    error: err,
    stack: err.stack,
    statusCode: err.statusCode || 500,
  });
};

// Production error response — clean message only
const sendProdError = (err, res) => {
  // Operational errors — safe to send to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Programming or unknown errors — don't leak details
  logger.error("💥 UNHANDLED ERROR:", err);
  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again later",
  });
};

// Global error handling middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.message = err.message || "Internal Server Error";

  // Log all errors
  logger.logError(err, req);

  // Development — send full error details
  if (process.env.NODE_ENV === "development") {
    // Handle specific error types even in development
    if (err.name === "CastError") {
      const { message, statusCode } = handleCastError(err);
      return errorResponse(res, message, statusCode);
    }

    if (err.code === 11000) {
      const { message, statusCode } = handleDuplicateKeyError(err);
      return errorResponse(res, message, statusCode);
    }

    if (err.name === "ValidationError") {
      const { errors, statusCode } = handleValidationError(err);
      return validationErrorResponse(res, errors);
    }

    if (err.name === "JsonWebTokenError") {
      const { message, statusCode } = handleJWTError();
      return errorResponse(res, message, statusCode);
    }

    if (err.name === "TokenExpiredError") {
      const { message, statusCode } = handleJWTExpiredError();
      return errorResponse(res, message, statusCode);
    }

    return sendDevError(err, res);
  }

  // Production — handle specific error types
  if (process.env.NODE_ENV === "production") {
    let error = { ...err, message: err.message };

    if (error.name === "CastError") {
      const { message, statusCode } = handleCastError(error);
      error.message = message;
      error.statusCode = statusCode;
      error.isOperational = true;
    }

    if (error.code === 11000) {
      const { message, statusCode } = handleDuplicateKeyError(error);
      error.message = message;
      error.statusCode = statusCode;
      error.isOperational = true;
    }

    if (error.name === "ValidationError") {
      const { errors, statusCode } = handleValidationError(error);
      return validationErrorResponse(res, errors);
    }

    if (error.name === "JsonWebTokenError") {
      const { message, statusCode } = handleJWTError();
      error.message = message;
      error.statusCode = statusCode;
      error.isOperational = true;
    }

    if (error.name === "TokenExpiredError") {
      const { message, statusCode } = handleJWTExpiredError();
      error.message = message;
      error.statusCode = statusCode;
      error.isOperational = true;
    }

    if (error.name === "MulterError") {
      const { message, statusCode } = handleMulterError(error);
      error.message = message;
      error.statusCode = statusCode;
      error.isOperational = true;
    }

    if (error instanceof SyntaxError && error.status === 400) {
      const { message, statusCode } = handleSyntaxError();
      error.message = message;
      error.statusCode = statusCode;
      error.isOperational = true;
    }

    return sendProdError(error, res);
  }

  // Fallback for other environments
  return errorResponse(res, err.message, err.statusCode || 500);
};

// Custom AppError class for operational errors
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Async error wrapper — eliminates try/catch in controllers
const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Handle unhandled promise rejections
process.on("unhandledRejection", (err) => {
  logger.error(`💥 UNHANDLED REJECTION: ${err.message}`);
  logger.error(err.stack);
});

// Handle uncaught exceptions
process.on("uncaughtException", (err) => {
  logger.error(`💥 UNCAUGHT EXCEPTION: ${err.message}`);
  logger.error(err.stack);
  process.exit(1);
});

module.exports = {
  errorHandler,
  AppError,
  catchAsync,
};
