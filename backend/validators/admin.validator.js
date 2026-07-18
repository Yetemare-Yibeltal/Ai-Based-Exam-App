const { body, query } = require("express-validator");

const validRoles = ["student", "teacher", "admin", "all"];
const validPriorities = ["low", "normal", "high", "urgent"];
const validSubjects = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
];

const updateSettingsValidator = [
  body("maintenance")
    .optional()
    .isBoolean()
    .withMessage("Maintenance must be a boolean"),

  body("maintenanceMessage")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Maintenance message must not exceed 500 characters"),

  body("allowRegistration")
    .optional()
    .isBoolean()
    .withMessage("allowRegistration must be a boolean"),

  body("allowTeacherRegistration")
    .optional()
    .isBoolean()
    .withMessage("allowTeacherRegistration must be a boolean"),

  body("maxQuestionsPerTeacher")
    .optional()
    .isInt({ min: 1, max: 10000 })
    .withMessage("Max questions must be between 1 and 10000"),

  body("aiGenerationLimit")
    .optional()
    .isInt({ min: 1, max: 1000 })
    .withMessage("AI generation limit must be between 1 and 1000"),

  body("maxQuizQuestions")
    .optional()
    .isInt({ min: 5, max: 100 })
    .withMessage("Max quiz questions must be between 5 and 100"),

  body("minQuizQuestions")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Min quiz questions must be between 1 and 50"),

  body("supportEmail")
    .optional()
    .trim()
    .isEmail()
    .withMessage("Support email must be a valid email address"),
];

const sendAnnouncementValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 100 })
    .withMessage("Title must not exceed 100 characters"),

  body("message")
    .trim()
    .notEmpty()
    .withMessage("Message is required")
    .isLength({ max: 500 })
    .withMessage("Message must not exceed 500 characters"),

  body("targetRole")
    .optional()
    .isIn(validRoles)
    .withMessage(`Target role must be one of: ${validRoles.join(", ")}`),

  body("priority")
    .optional()
    .isIn(validPriorities)
    .withMessage(`Priority must be one of: ${validPriorities.join(", ")}`),
];

const adminAnalyticsQueryValidator = [
  query("days")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Days must be between 1 and 365"),

  query("months")
    .optional()
    .isInt({ min: 1, max: 24 })
    .withMessage("Months must be between 1 and 24"),

  query("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  query("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be Grade 11 or Grade 12"),
];

const reportQueryValidator = [
  query("startDate")
    .optional()
    .isISO8601()
    .withMessage("Start date must be a valid ISO 8601 date"),

  query("endDate")
    .optional()
    .isISO8601()
    .withMessage("End date must be a valid ISO 8601 date")
    .custom((endDate, { req }) => {
      if (
        req.query.startDate &&
        new Date(endDate) < new Date(req.query.startDate)
      ) {
        throw new Error("End date must be after start date");
      }
      return true;
    }),

  query("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  query("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be Grade 11 or Grade 12"),

  query("status")
    .optional()
    .isIn(["draft", "pending", "approved", "rejected"])
    .withMessage("Status must be draft, pending, approved, or rejected"),
];

const adminUpdateProfileValidator = [
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be between 2 and 50 characters")
    .matches(/^[a-zA-Z\u1200-\u137F\s\-']+$/)
    .withMessage(
      "Name can only contain letters, spaces, hyphens and apostrophes",
    ),

  body("phone")
    .optional()
    .trim()
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage("Please provide a valid phone number"),

  body("preferredLanguage")
    .optional()
    .isIn(["en", "am"])
    .withMessage("Language must be en or am"),

  body("notificationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("notificationsEnabled must be a boolean"),

  body("emailNotificationsEnabled")
    .optional()
    .isBoolean()
    .withMessage("emailNotificationsEnabled must be a boolean"),
];

const approveQuestionValidator = [
  body("note")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Note must not exceed 500 characters"),
];

const rejectQuestionValidator = [
  body("reason")
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isIn([
      "wrong_answer",
      "unclear_question",
      "duplicate_question",
      "not_curriculum_aligned",
      "poor_quality",
      "inappropriate_content",
      "incorrect_difficulty",
      "missing_explanation",
      "other",
    ])
    .withMessage("Invalid rejection reason"),

  body("details")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Details must not exceed 500 characters"),
];

const exportQueryValidator = [
  query("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be Grade 11 or Grade 12"),

  query("minScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Min score must be between 0 and 100"),

  query("maxScore")
    .optional()
    .isInt({ min: 0, max: 100 })
    .withMessage("Max score must be between 0 and 100"),

  query("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  query("difficulty")
    .optional()
    .isIn(["easy", "medium", "hard"])
    .withMessage("Difficulty must be easy, medium, or hard"),
];

module.exports = {
  updateSettingsValidator,
  sendAnnouncementValidator,
  adminAnalyticsQueryValidator,
  reportQueryValidator,
  adminUpdateProfileValidator,
  approveQuestionValidator,
  rejectQuestionValidator,
  exportQueryValidator,
  validRoles,
  validPriorities,
  validSubjects,
};
