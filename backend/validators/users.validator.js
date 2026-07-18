const { body, query, param } = require("express-validator");

const validGrades = ["Grade 11", "Grade 12"];
const validSubjects = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
];
const validLanguages = ["en", "am"];

const updateStudentValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u1200-\u137F\s\-']+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens and apostrophes",
    ),

  body("email")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  body("grade")
    .optional()
    .isIn(validGrades)
    .withMessage(`Grade must be one of: ${validGrades.join(", ")}`),

  body("school")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("School name must not exceed 100 characters"),

  body("isEmailVerified")
    .optional()
    .isBoolean()
    .withMessage("isEmailVerified must be a boolean"),

  body("isActive")
    .optional()
    .isBoolean()
    .withMessage("isActive must be a boolean"),
];

const banUserValidator = [
  body("reason")
    .notEmpty()
    .withMessage("Ban reason is required")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Reason must be between 5 and 500 characters"),
];

const getUsersQueryValidator = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must not exceed 100 characters"),

  query("grade")
    .optional()
    .isIn(validGrades)
    .withMessage(`Grade must be one of: ${validGrades.join(", ")}`),

  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isActive must be true or false"),

  query("isBanned")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isBanned must be true or false"),

  query("isEmailVerified")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isEmailVerified must be true or false"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("sortBy")
    .optional()
    .isIn(["createdAt", "name", "email", "averageScore", "totalQuizzesTaken"])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

const updateNotificationSettingsValidator = [
  body("notificationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("notificationsEnabled must be a boolean"),

  body("emailNotificationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("emailNotificationsEnabled must be a boolean"),
];

const updatePreferencesValidator = [
  body("preferredLanguage")
    .optional()
    .isIn(validLanguages)
    .withMessage(`Language must be one of: ${validLanguages.join(", ")}`),

  body("theme")
    .optional()
    .isIn(["light", "dark", "system"])
    .withMessage("Theme must be light, dark, or system"),
];

module.exports = {
  updateStudentValidator,
  banUserValidator,
  getUsersQueryValidator,
  updateNotificationSettingsValidator,
  updatePreferencesValidator,
  validGrades,
  validSubjects,
  validLanguages,
};
