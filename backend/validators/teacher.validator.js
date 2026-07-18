const { body, query } = require("express-validator");

const validSubjects = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
  "all",
];
const validLanguages = ["en", "am"];

const createTeacherValidator = [
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

  body("subject")
    .notEmpty()
    .withMessage("Subject specialization is required")
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  body("school")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("School name must not exceed 100 characters"),

  body("experience")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience must be between 0 and 50 years"),

  body("qualification")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Qualification must not exceed 200 characters"),
];

const updateTeacherValidator = [
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

  body("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  body("subjects")
    .optional()
    .isArray()
    .withMessage("Subjects must be an array"),

  body("subjects.*")
    .optional()
    .isIn(["math", "english", "biology", "chemistry", "physics", "civics"])
    .withMessage("Invalid subject in subjects array"),

  body("school")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("School name must not exceed 100 characters"),

  body("experience")
    .optional()
    .isInt({ min: 0, max: 50 })
    .withMessage("Experience must be between 0 and 50 years"),

  body("qualification")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Qualification must not exceed 200 characters"),

  body("bio")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Bio must not exceed 500 characters"),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  body("preferredLanguage")
    .optional()
    .isIn(validLanguages)
    .withMessage(`Language must be one of: ${validLanguages.join(", ")}`),

  body("socialLinks")
    .optional()
    .isObject()
    .withMessage("Social links must be an object"),

  body("socialLinks.linkedin")
    .optional()
    .isURL()
    .withMessage("LinkedIn must be a valid URL"),

  body("socialLinks.twitter")
    .optional()
    .isURL()
    .withMessage("Twitter must be a valid URL"),

  body("socialLinks.website")
    .optional()
    .isURL()
    .withMessage("Website must be a valid URL"),

  body("notificationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("notificationsEnabled must be a boolean"),

  body("emailNotificationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("emailNotificationsEnabled must be a boolean"),
];

const getTeachersQueryValidator = [
  query("search")
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage("Search query must not exceed 100 characters"),

  query("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  query("isApproved")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isApproved must be true or false"),

  query("isActive")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isActive must be true or false"),

  query("isBanned")
    .optional()
    .isIn(["true", "false"])
    .withMessage("isBanned must be true or false"),

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
    .isIn([
      "createdAt",
      "name",
      "email",
      "totalQuestionsCreated",
      "totalQuestionsApproved",
    ])
    .withMessage("Invalid sort field"),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

const banTeacherValidator = [
  body("reason")
    .notEmpty()
    .withMessage("Ban reason is required")
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage("Reason must be between 5 and 500 characters"),
];

const teacherAnalyticsQueryValidator = [
  query("subject")
    .optional()
    .isIn(["math", "english", "biology", "chemistry", "physics", "civics"])
    .withMessage("Invalid subject"),

  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Days must be between 1 and 365"),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),
];

module.exports = {
  createTeacherValidator,
  updateTeacherValidator,
  getTeachersQueryValidator,
  banTeacherValidator,
  teacherAnalyticsQueryValidator,
  validSubjects,
  validLanguages,
};
