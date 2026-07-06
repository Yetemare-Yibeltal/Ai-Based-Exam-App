const {
  verifyAccessToken,
  extractTokenFromHeader,
} = require("../utils/generateToken");
const {
  unauthorizedResponse,
  forbiddenResponse,
} = require("../utils/apiResponse");
const logger = require("../utils/logger");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");

// Get user model based on role
const getUserModel = (role) => {
  if (role === "teacher") return Teacher;
  if (role === "admin") return Admin;
  return User;
};

// Main authentication middleware — verifies JWT token
const protect = async (req, res, next) => {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      return unauthorizedResponse(
        res,
        "Access denied. No token provided. Please log in first",
      );
    }

    // Verify token
    const { valid, expired, decoded, error } = verifyAccessToken(token);

    if (!valid) {
      if (expired) {
        return unauthorizedResponse(
          res,
          "Your session has expired. Please log in again",
        );
      }
      return unauthorizedResponse(
        res,
        error || "Invalid token. Please log in again",
      );
    }

    // Get the correct model based on role in token
    const Model = getUserModel(decoded.role);

    // Find user in database
    const user = await Model.findById(decoded.id).select("-password");

    if (!user) {
      return unauthorizedResponse(
        res,
        "The user belonging to this token no longer exists",
      );
    }

    // Check if user account is active
    if (user.isActive === false) {
      return unauthorizedResponse(
        res,
        "Your account has been deactivated. Please contact support",
      );
    }

    // Check if user is banned
    if (user.isBanned === true) {
      return unauthorizedResponse(
        res,
        "Your account has been banned. Please contact support",
      );
    }

    // Check if password was changed after token was issued
    if (user.passwordChangedAt) {
      const passwordChangedTimestamp = parseInt(
        user.passwordChangedAt.getTime() / 1000,
        10,
      );
      if (decoded.iat < passwordChangedTimestamp) {
        return unauthorizedResponse(
          res,
          "Your password was recently changed. Please log in again",
        );
      }
    }

    // Attach user and role to request object
    req.user = user;
    req.role = decoded.role;
    req.userId = decoded.id;

    logger.logAuth("Authenticated", decoded.id, decoded.role);

    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return unauthorizedResponse(
      res,
      "Authentication failed. Please log in again",
    );
  }
};

// Optional authentication — does not block if no token
const optionalAuth = async (req, res, next) => {
  try {
    const token = extractTokenFromHeader(req.headers.authorization);

    if (!token) {
      req.user = null;
      req.role = null;
      return next();
    }

    const { valid, decoded } = verifyAccessToken(token);

    if (!valid) {
      req.user = null;
      req.role = null;
      return next();
    }

    const Model = getUserModel(decoded.role);
    const user = await Model.findById(decoded.id).select("-password");

    if (!user || user.isActive === false) {
      req.user = null;
      req.role = null;
      return next();
    }

    req.user = user;
    req.role = decoded.role;
    req.userId = decoded.id;

    next();
  } catch (error) {
    req.user = null;
    req.role = null;
    next();
  }
};

// Verify email middleware — checks if email is verified
const requireEmailVerification = (req, res, next) => {
  if (!req.user) {
    return unauthorizedResponse(res, "Please log in first");
  }

  if (!req.user.isEmailVerified) {
    return forbiddenResponse(
      res,
      "Please verify your email address before accessing this resource. Check your inbox for the verification code",
    );
  }

  next();
};

// Check if user is accessing their own resource
const requireOwnership = (paramName = "id") => {
  return (req, res, next) => {
    const resourceId = req.params[paramName];
    const userId = req.userId;
    const role = req.role;

    // Admins can access any resource
    if (role === "admin") {
      return next();
    }

    // Check ownership
    if (resourceId !== userId.toString()) {
      return forbiddenResponse(
        res,
        "You do not have permission to access this resource",
      );
    }

    next();
  };
};

// Refresh token middleware
const verifyRefreshToken = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return unauthorizedResponse(res, "Refresh token is required");
    }

    const {
      verifyRefreshToken: verifyToken,
    } = require("../utils/generateToken");

    const { valid, expired, decoded, error } = verifyToken(refreshToken);

    if (!valid) {
      if (expired) {
        return unauthorizedResponse(
          res,
          "Refresh token has expired. Please log in again",
        );
      }
      return unauthorizedResponse(res, error || "Invalid refresh token");
    }

    const Model = getUserModel(decoded.role);
    const user = await Model.findById(decoded.id).select("-password");

    if (!user || user.isActive === false) {
      return unauthorizedResponse(res, "User not found or account deactivated");
    }

    req.user = user;
    req.role = decoded.role;
    req.userId = decoded.id;

    next();
  } catch (error) {
    logger.error(`Refresh token middleware error: ${error.message}`);
    return unauthorizedResponse(
      res,
      "Token refresh failed. Please log in again",
    );
  }
};

module.exports = {
  protect,
  optionalAuth,
  requireEmailVerification,
  requireOwnership,
  verifyRefreshToken,
};
