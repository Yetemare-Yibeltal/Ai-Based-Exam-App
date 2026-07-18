const { body, query, param } = require("express-validator");

const validSubjects = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
];
const validDifficulties = ["easy", "medium", "hard", "mixed"];

const submitScoreValidator = [
  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

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
    .isArray({ min: 1 })
    .withMessage("Answers array is required and must not be empty"),

  body("answers.*.questionId")
    .notEmpty()
    .withMessage("Question ID is required for each answer")
    .isMongoId()
    .withMessage("Invalid question ID format"),

  body("answers.*.selectedAnswer")
    .notEmpty()
    .withMessage("Selected answer is required for each question")
    .isInt({ min: 0, max: 3 })
    .withMessage("Selected answer must be between 0 and 3"),

  body("answers.*.timeToAnswer")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time to answer must be a non-negative number"),

  body("timeTaken")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time taken must be a non-negative number in seconds"),

  body("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),

  body("sessionId")
    .optional()
    .isString()
    .withMessage("Session ID must be a string"),
];

const getScoresQueryValidator = [
  query("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  query("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),

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
    .isIn(["createdAt", "percentage", "subject", "timeTaken"])
    .withMessage(
      "Sort field must be one of: createdAt, percentage, subject, timeTaken",
    ),

  query("sortOrder")
    .optional()
    .isIn(["asc", "desc"])
    .withMessage("Sort order must be asc or desc"),
];

const getProgressQueryValidator = [
  query("days")
    .optional()
    .isInt({ min: 7, max: 365 })
    .withMessage("Days must be between 7 and 365"),
];

const checkAnswersValidator = [
  body("answers").isArray({ min: 1 }).withMessage("Answers array is required"),

  body("answers.*.questionId")
    .notEmpty()
    .withMessage("Question ID is required")
    .isMongoId()
    .withMessage("Invalid question ID format"),

  body("answers.*.selectedAnswer")
    .notEmpty()
    .withMessage("Selected answer is required")
    .isInt({ min: 0, max: 3 })
    .withMessage("Selected answer must be between 0 and 3"),

  body("answers.*.timeToAnswer")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Time to answer must be non-negative"),
];

module.exports = {
  submitScoreValidator,
  getScoresQueryValidator,
  getProgressQueryValidator,
  checkAnswersValidator,
  validSubjects,
  validDifficulties,
};
