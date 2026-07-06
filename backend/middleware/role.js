const {
  forbiddenResponse,
  unauthorizedResponse,
} = require("../utils/apiResponse");
const {
  ROLES,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isAdmin,
  isTeacher,
  isStudent,
  hasMinimumRole,
} = require("../utils/roleCheck");
const logger = require("../utils/logger");

// Restrict access to specific roles only
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    if (!roles.includes(req.role)) {
      logger.warn(
        `Unauthorized role access attempt — User: ${req.userId} — Role: ${req.role} — Required: ${roles.join(", ")} — URL: ${req.originalUrl}`,
      );
      return forbiddenResponse(
        res,
        `Access denied. This resource is only available to: ${roles.join(", ")}`,
      );
    }

    next();
  };
};

// Admin only access
const adminOnly = (req, res, next) => {
  if (!req.user || !req.role) {
    return unauthorizedResponse(res, "Please log in to access this resource");
  }

  if (!isAdmin(req.role)) {
    logger.warn(
      `Admin-only access attempt — User: ${req.userId} — Role: ${req.role} — URL: ${req.originalUrl}`,
    );
    return forbiddenResponse(
      res,
      "Access denied. This resource is only available to administrators",
    );
  }

  next();
};

// Teacher only access
const teacherOnly = (req, res, next) => {
  if (!req.user || !req.role) {
    return unauthorizedResponse(res, "Please log in to access this resource");
  }

  if (!isTeacher(req.role)) {
    return forbiddenResponse(
      res,
      "Access denied. This resource is only available to teachers",
    );
  }

  next();
};

// Student only access
const studentOnly = (req, res, next) => {
  if (!req.user || !req.role) {
    return unauthorizedResponse(res, "Please log in to access this resource");
  }

  if (!isStudent(req.role)) {
    return forbiddenResponse(
      res,
      "Access denied. This resource is only available to students",
    );
  }

  next();
};

// Teacher or Admin access
const teacherOrAdmin = (req, res, next) => {
  if (!req.user || !req.role) {
    return unauthorizedResponse(res, "Please log in to access this resource");
  }

  if (req.role !== ROLES.TEACHER && req.role !== ROLES.ADMIN) {
    return forbiddenResponse(
      res,
      "Access denied. This resource is only available to teachers and administrators",
    );
  }

  next();
};

// Check specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    if (!hasPermission(req.role, permission)) {
      logger.warn(
        `Permission denied — User: ${req.userId} — Role: ${req.role} — Permission: ${permission} — URL: ${req.originalUrl}`,
      );
      return forbiddenResponse(
        res,
        `Access denied. You do not have the required permission: ${permission}`,
      );
    }

    next();
  };
};

// Check multiple permissions — user must have ALL of them
const requireAllPermissions = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    if (!hasAllPermissions(req.role, permissions)) {
      logger.warn(
        `Multiple permissions denied — User: ${req.userId} — Role: ${req.role} — Permissions: ${permissions.join(", ")} — URL: ${req.originalUrl}`,
      );
      return forbiddenResponse(
        res,
        "Access denied. You do not have all required permissions for this action",
      );
    }

    next();
  };
};

// Check multiple permissions — user must have ANY of them
const requireAnyPermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    if (!hasAnyPermission(req.role, permissions)) {
      logger.warn(
        `Any permission denied — User: ${req.userId} — Role: ${req.role} — Permissions: ${permissions.join(", ")} — URL: ${req.originalUrl}`,
      );
      return forbiddenResponse(
        res,
        "Access denied. You do not have any of the required permissions for this action",
      );
    }

    next();
  };
};

// Check minimum role level
const requireMinimumRole = (minimumRole) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    if (!hasMinimumRole(req.role, minimumRole)) {
      logger.warn(
        `Minimum role not met — User: ${req.userId} — Role: ${req.role} — Required minimum: ${minimumRole} — URL: ${req.originalUrl}`,
      );
      return forbiddenResponse(
        res,
        `Access denied. Minimum required role is: ${minimumRole}`,
      );
    }

    next();
  };
};

// Dynamic role check — pass roles as array
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!allowedRoles.includes(req.role)) {
      logger.warn(
        `Dynamic role check failed — User: ${req.userId} — Role: ${req.role} — Allowed: ${allowedRoles.join(", ")} — URL: ${req.originalUrl}`,
      );
      return forbiddenResponse(
        res,
        `Access denied. This resource requires one of the following roles: ${allowedRoles.join(", ")}`,
      );
    }

    next();
  };
};

// Check if user is accessing their own resource or is admin
const ownerOrAdmin = (getUserId) => {
  return (req, res, next) => {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    // Admins always have access
    if (isAdmin(req.role)) {
      return next();
    }

    // Get the resource owner ID
    const resourceOwnerId =
      typeof getUserId === "function"
        ? getUserId(req)
        : req.params[getUserId] || req.params.id;

    if (!resourceOwnerId) {
      return forbiddenResponse(res, "Resource owner could not be determined");
    }

    if (req.userId.toString() !== resourceOwnerId.toString()) {
      logger.warn(
        `Owner check failed — User: ${req.userId} — Owner: ${resourceOwnerId} — URL: ${req.originalUrl}`,
      );
      return forbiddenResponse(
        res,
        "Access denied. You can only access your own resources",
      );
    }

    next();
  };
};

// Check if teacher owns the question or is admin
const questionOwnerOrAdmin = async (req, res, next) => {
  try {
    if (!req.user || !req.role) {
      return unauthorizedResponse(res, "Please log in to access this resource");
    }

    if (isAdmin(req.role)) {
      return next();
    }

    const Question = require("../models/Question");
    const question = await Question.findById(req.params.id);

    if (!question) {
      return forbiddenResponse(res, "Question not found");
    }

    if (question.createdBy.toString() !== req.userId.toString()) {
      return forbiddenResponse(
        res,
        "Access denied. You can only modify your own questions",
      );
    }

    req.question = question;
    next();
  } catch (error) {
    logger.error(`Question owner check error: ${error.message}`);
    return forbiddenResponse(res, "Could not verify question ownership");
  }
};

// Rate limit by role — admin gets more requests
const roleLimitedAccess = (req, res, next) => {
  if (isAdmin(req.role)) {
    req.rateLimit = { max: 500 };
  } else if (isTeacher(req.role)) {
    req.rateLimit = { max: 200 };
  } else {
    req.rateLimit = { max: 100 };
  }
  next();
};

module.exports = {
  restrictTo,
  adminOnly,
  teacherOnly,
  studentOnly,
  teacherOrAdmin,
  requirePermission,
  requireAllPermissions,
  requireAnyPermission,
  requireMinimumRole,
  requireRole,
  ownerOrAdmin,
  questionOwnerOrAdmin,
  roleLimitedAccess,
};
