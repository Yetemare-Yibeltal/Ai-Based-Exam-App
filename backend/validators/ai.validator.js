const { body, query } = require("express-validator");

const validSubjects = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
];
const validDifficulties = ["easy", "medium", "hard"];
const validGrades = ["Grade 11", "Grade 12"];

const generateQuestionValidator = [
  body("subject")
    .notEmpty()
    .withMessage("Subject is required for AI generation")
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  body("difficulty")
    .optional()
    .isIn(validDifficulties)
    .withMessage(`Difficulty must be one of: ${validDifficulties.join(", ")}`),

  body("count")
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage("Count must be between 1 and 5 questions per generation"),

  body("topic")
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage("Topic must not exceed 200 characters"),

  body("grade")
    .optional()
    .isIn(validGrades)
    .withMessage(`Grade must be one of: ${validGrades.join(", ")}`),

  body("additionalInstructions")
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage("Additional instructions must not exceed 500 characters"),
];

const validateQuestionValidator = [
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
    .withMessage("Each option must not be empty"),

  body("correctAnswer")
    .notEmpty()
    .withMessage("Correct answer index is required")
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be between 0 and 3"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  body("explanation")
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage("Explanation must not exceed 2000 characters"),
];

const generateStudyTipsValidator = [
  body("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  body("weakSubjects")
    .optional()
    .isArray()
    .withMessage("Weak subjects must be an array"),

  body("weakSubjects.*")
    .optional()
    .isIn(validSubjects)
    .withMessage("Invalid subject in weak subjects array"),

  body("averageScore")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Average score must be between 0 and 100"),

  body("studyStreak")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Study streak must be a non-negative integer"),
];

const explainAnswerValidator = [
  body("questionId")
    .notEmpty()
    .withMessage("Question ID is required")
    .isMongoId()
    .withMessage("Invalid question ID format"),

  body("selectedAnswer")
    .notEmpty()
    .withMessage("Selected answer is required")
    .isInt({ min: 0, max: 3 })
    .withMessage("Selected answer must be between 0 and 3"),

  body("correctAnswer")
    .notEmpty()
    .withMessage("Correct answer is required")
    .isInt({ min: 0, max: 3 })
    .withMessage("Correct answer must be between 0 and 3"),

  body("questionText")
    .trim()
    .notEmpty()
    .withMessage("Question text is required"),

  body("options")
    .isArray({ min: 4, max: 4 })
    .withMessage("Options array with 4 items is required"),

  body("subject")
    .notEmpty()
    .withMessage("Subject is required")
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),
];

const analyzeWeakSubjectsValidator = [
  body("subjectStats")
    .isArray({ min: 1 })
    .withMessage("Subject statistics array is required"),

  body("subjectStats.*.subject")
    .notEmpty()
    .withMessage("Subject is required in each stat")
    .isIn(validSubjects)
    .withMessage("Invalid subject in stats"),

  body("subjectStats.*.avgScore")
    .notEmpty()
    .withMessage("Average score is required in each stat")
    .isFloat({ min: 0, max: 100 })
    .withMessage("Average score must be between 0 and 100"),

  body("subjectStats.*.totalAttempts")
    .notEmpty()
    .withMessage("Total attempts is required in each stat")
    .isInt({ min: 0 })
    .withMessage("Total attempts must be non-negative"),
];

const generatePersonalizedPlanValidator = [
  body("daysUntilExam")
    .optional()
    .isInt({ min: 1, max: 365 })
    .withMessage("Days until exam must be between 1 and 365"),

  body("targetScore")
    .optional()
    .isFloat({ min: 0, max: 100 })
    .withMessage("Target score must be between 0 and 100"),

  body("availableHoursPerDay")
    .optional()
    .isFloat({ min: 0.5, max: 12 })
    .withMessage("Available hours per day must be between 0.5 and 12"),
];

const aiQueryValidator = [
  query("subject")
    .optional()
    .isIn(validSubjects)
    .withMessage(`Subject must be one of: ${validSubjects.join(", ")}`),

  query("limit")
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage("Limit must be between 1 and 50"),

  query("page")
    .optional()
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
];

module.exports = {
  generateQuestionValidator,
  validateQuestionValidator,
  generateStudyTipsValidator,
  explainAnswerValidator,
  analyzeWeakSubjectsValidator,
  generatePersonalizedPlanValidator,
  aiQueryValidator,
  validSubjects,
  validDifficulties,
  validGrades,
};
