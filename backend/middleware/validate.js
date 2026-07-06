const { validationResult, body, param, query } = require("express-validator");
const { validationErrorResponse } = require("../utils/apiResponse");
const logger = require("../utils/logger");

// Run validation and return errors if any
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((error) => ({
      field: error.path,
      message: error.msg,
      value: error.value,
    }));

    logger.warn(
      `Validation failed — ${req.method} ${req.originalUrl} — Errors: ${JSON.stringify(formattedErrors)}`,
    );

    return validationErrorResponse(res, formattedErrors);
  }

  next();
};

// ── AUTH VALIDATORS ────────────────────────────────────────

const validateRegister = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u1200-\u137F\s\-']+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens and apostrophes",
    ),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail()
    .isLength({ max: 100 })
    .withMessage("Email must not exceed 100 characters"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 128 })
    .withMessage("Password must not exceed 128 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your password")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  body("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be either Grade 11 or Grade 12"),

  body("school")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("School name must not exceed 100 characters"),

  validate,
];

const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 1 })
    .withMessage("Password cannot be empty"),

  validate,
];

const validateForgotPassword = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  validate,
];

const validateResetPassword = [
  body("otp")
    .notEmpty()
    .withMessage("OTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 128 })
    .withMessage("Password must not exceed 128 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validate,
];

const validateChangePassword = [
  body("currentPassword")
    .notEmpty()
    .withMessage("Current password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long")
    .isLength({ max: 128 })
    .withMessage("Password must not exceed 128 characters")
    .matches(/[A-Z]/)
    .withMessage("Password must contain at least one uppercase letter")
    .matches(/[a-z]/)
    .withMessage("Password must contain at least one lowercase letter")
    .matches(/[0-9]/)
    .withMessage("Password must contain at least one number")
    .matches(/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/)
    .withMessage("Password must contain at least one special character")
    .custom((value, { req }) => {
      if (value === req.body.currentPassword) {
        throw new Error("New password must be different from current password");
      }
      return true;
    }),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Please confirm your new password")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),

  validate,
];

const validateVerifyOTP = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address")
    .normalizeEmail(),

  body("otp")
    .notEmpty()
    .withMessage("OTP code is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("OTP must be exactly 6 digits")
    .isNumeric()
    .withMessage("OTP must contain only numbers"),

  validate,
];

// ── QUESTION VALIDATORS ────────────────────────────────────

const validateCreateQuestion = [
  body("questionText")
    .trim()
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 10 })
    .withMessage("Question text must be at least 10 characters long")
    .isLength({ max: 1000 })
    .withMessage("Question text must not exceed 1000 characters"),

  body("options")
    .isArray({ min: 4, max: 4 })
    .withMessage("Question must have exactly 4 answer options"),

  body("options.*")
    .trim()
    .notEmpty()
    .withMessage("Each option must not be empty")
    .isLength({ min: 1, max: 500 })
    .withMessage("Each option must be between 1 and 500 characters"),

  body("correctAnswer")
    .notEmpty()
    .withMessage("Correct answer index is required")
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be an index between 0 and 3"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isIn(["math", "english", "biology", "chemistry", "physics", "civics"])
    .withMessage(
      "Subject must be one of: math, english, biology, chemistry, physics, civics",
    ),

  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be one of: easy, medium, hard"),

  body("explanation")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Explanation must not exceed 2000 characters"),

  body("year")
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1990 and ${new Date().getFullYear()}`),

  validate,
];

const validateUpdateQuestion = [
  body("questionText")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Question text must be at least 10 characters long")
    .isLength({ max: 1000 })
    .withMessage("Question text must not exceed 1000 characters"),

  body("options")
    .optional()
    .isArray({ min: 4, max: 4 })
    .withMessage("Question must have exactly 4 answer options"),

  body("options.*")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Each option must not be empty")
    .isLength({ max: 500 })
    .withMessage("Each option must not exceed 500 characters"),

  body("correctAnswer")
    .optional()
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be an index between 0 and 3"),

  body("subject")
    .optional()
    .isIn(["math", "english", "biology", "chemistry", "physics", "civics"])
    .withMessage(
      "Subject must be one of: math, english, biology, chemistry, physics, civics",
    ),

  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be one of: easy, medium, hard"),

  body("explanation")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Explanation must not exceed 2000 characters"),

  validate,
];

// ── SCORE VALIDATORS ───────────────────────────────────────

const validateSubmitScore = [
  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isIn(["math", "english", "biology", "chemistry", "physics", "civics"])
    .withMessage(
      "Subject must be one of: math, english, biology, chemistry, physics, civics",
    ),

  body("totalQuestions")
    .notEmpty()
    .withMessage("Total questions is required")
    .isInt({ min: 1, max: 100 })
    .withMessage("Total questions must be between 1 and 100"),

  body("correctAnswers")
    .notEmpty()
    .withMessage("Correct answers count is required")
    .isInt({ min: 0 })
    .withMessage("Correct answers must be a non-negative number")
    .custom((value, { req }) => {
      if (parseInt(value) > parseInt(req.body.totalQuestions)) {
        throw new Error("Correct answers cannot exceed total questions");
      }
      return true;
    }),

  body("answers")
    .isArray()
    .withMessage("Answers must be an array")
    .notEmpty()
    .withMessage("Answers array cannot be empty"),

  body("answers.*.questionId")
    .notEmpty()
    .withMessage("Question ID is required for each answer")
    .isMongoId()
    .withMessage("Invalid question ID format"),

  body("answers.*.selectedAnswer")
    .notEmpty()
    .withMessage("Selected answer is required for each question")
    .isInt({ min: 0, max: 3 })
    .withMessage("Selected answer must be an index between 0 and 3"),

  body("timeTaken")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time taken must be a non-negative number in seconds"),

  validate,
];

// ── USER VALIDATORS ────────────────────────────────────────

const validateUpdateProfile = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u1200-\u137F\s\-']+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens and apostrophes",
    ),

  body("school")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("School name must not exceed 100 characters"),

  body("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be either Grade 11 or Grade 12"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  validate,
];

// ── AI VALIDATORS ──────────────────────────────────────────

const validateAIGenerate = [
  body("subject")
    .notEmpty()
    .withMessage("Subject is required for AI generation")
    .isIn(["math", "english", "biology", "chemistry", "physics", "civics"])
    .withMessage(
      "Subject must be one of: math, english, biology, chemistry, physics, civics",
    ),

  body("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be one of: easy, medium, hard"),

  body("count")
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage("Count must be between 1 and 10 questions per generation"),

  body("topic")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Topic must not exceed 200 characters"),

  body("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be either Grade 11 or Grade 12"),

  validate,
];

// ── PARAM VALIDATORS ───────────────────────────────────────

const validateMongoId = (paramName = "id") => [
  param(paramName)
    .notEmpty()
    .withMessage(`${paramName} is required`)
    .isMongoId()
    .withMessage(`Invalid ${paramName} format`),

  validate,
];

// ── QUERY VALIDATORS ───────────────────────────────────────

const validatePaginationQuery = [
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
    .isString()
    .withMessage("Sort field must be a string"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be either asc or desc"),

  validate,
];

const validateSearchQuery = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must not exceed 100 characters"),

  validate,
];

module.exports = {
  validate,
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateVerifyOTP,
  validateCreateQuestion,
  validateUpdateQuestion,
  validateSubmitScore,
  validateUpdateProfile,
  validateAIGenerate,
  validateMongoId,
  validatePaginationQuery,
  validateSearchQuery,
};
