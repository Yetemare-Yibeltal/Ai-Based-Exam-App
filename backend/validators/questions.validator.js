const { body, param, query } = require("express-validator");

const validSubjects = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
];
const validDifficulties = ["easy", "medium", "hard"];
const validGrades = ["Grade 11", "Grade 12", "Both"];
const validStatuses = ["draft", "pending", "approved", "rejected"];
const validReportReasons = [
  "wrong_answer",
  "unclear_question",
  "outdated",
  "duplicate",
  "inappropriate",
  "other",
];

const createQuestionValidator = [
  body("questionText")
    .trim()
    .notEmpty()
    .withMessage("Question text is required")
    .isLength({ min: 10 })
    .withMessage("Question text must be at least 10 characters")
    .isLength({ max: 1000 })
    .withMessage("Question text must not exceed 1000 characters"),

  body("options")
    .isArray({ min: 4, max: 4 })
    .withMessage("Question must have exactly 4 options"),

  body("options.*")
    .trim()
    .notEmpty()
    .withMessage("Each option must not be empty")
    .isLength({ max: 500 })
    .withMessage("Each option must not exceed 500 characters"),

  body("correctAnswer")
    .notEmpty()
    .withMessage("Correct answer index is required")
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be an index between 0 and 3"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  body("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),

  body("grade")
    .optional()
    .isIn(validGrades)
    .withMessage(`Grade must be one of: ${validGrades.join(", ")}`),

  body("explanation")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Explanation must not exceed 2000 characters"),

  body("year")
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1990 and ${new Date().getFullYear()}`),

  body("topic")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Topic must not exceed 200 characters"),

  body("tags").optional().isArray().withMessage("Tags must be an array"),

  body("tags.*")
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage("Each tag must not exceed 50 characters"),
];

const updateQuestionValidator = [
  body("questionText")
    .optional()
    .trim()
    .isLength({ min: 10 })
    .withMessage("Question text must be at least 10 characters")
    .isLength({ max: 1000 })
    .withMessage("Question text must not exceed 1000 characters"),

  body("options")
    .optional()
    .isArray({ min: 4, max: 4 })
    .withMessage("Question must have exactly 4 options"),

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
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  body("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),

  body("grade")
    .optional()
    .isIn(validGrades)
    .withMessage(`Grade must be one of: ${validGrades.join(", ")}`),

  body("explanation")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Explanation must not exceed 2000 characters"),

  body("year")
    .optional()
    .isInt({ min: 1990, max: new Date().getFullYear() })
    .withMessage(`Year must be between 1990 and ${new Date().getFullYear()}`),

  body("topic")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Topic must not exceed 200 characters"),

  body("status")
    .optional()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(", ")}`),
];

const reportQuestionValidator = [
  body("reason")
    .notEmpty()
    .withMessage("Report reason is required")
    .isIn(validReportReasons)
    .withMessage(`Reason must be one of: ${validReportReasons.join(", ")}`),

  body("details")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Details must not exceed 500 characters"),
];

const getQuestionsQueryValidator = [
  query("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  query("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),

  query("grade")
    .optional()
    .isIn(["Grade 11", "Grade 12"])
    .withMessage("Grade must be Grade 11 or Grade 12"),

  query("status")
    .optional()
    .isIn(validStatuses)
    .withMessage(`Status must be one of: ${validStatuses.join(", ")}`),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
];

const bulkActionValidator = [
  body("questionIds")
    .isArray({ min: 1 })
    .withMessage("Question IDs array is required and must not be empty")
    .custom((ids) => {
      if (ids.length > 50)
        throw new Error("Cannot process more than 50 questions at once");
      return true;
    }),

  body("questionIds.*")
    .isMongoId()
    .withMessage("Each question ID must be a valid MongoDB ID"),
];

const bulkRejectValidator = [
  ...bulkActionValidator,
  body("reason")
    .notEmpty()
    .withMessage("Rejection reason is required")
    .isLength({ max: 500 })
    .withMessage("Reason must not exceed 500 characters"),
];

const submitForApprovalValidator = [
  body("submissionNote")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Submission note must not exceed 500 characters"),
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

module.exports = {
  createQuestionValidator,
  updateQuestionValidator,
  reportQuestionValidator,
  getQuestionsQueryValidator,
  bulkActionValidator,
  bulkRejectValidator,
  submitForApprovalValidator,
  rejectQuestionValidator,
  validSubjects,
  validDifficulties,
  validGrades,
  validStatuses,
};
