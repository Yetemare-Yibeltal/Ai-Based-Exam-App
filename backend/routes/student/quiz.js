const express = require("express");
const router = express.Router();

// Import middleware
const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const { requireEmailVerification } = require("../../middleware/auth");
const { quizLimiter } = require("../../middleware/rateLimiter");
const {
  validateSubmitScore,
  validateMongoId,
} = require("../../middleware/validate");

// Import controllers
const {
  getSubjects,
  getQuestionsBySubject,
  startQuiz,
  submitQuiz,
  getQuizHistory,
  getQuizById,
  retryQuiz,
  getQuizStats,
} = require("../../controllers/student/quizController");

// All routes require authentication and student role
router.use(protect);
router.use(restrictTo("student"));

// @route   GET /api/student/quiz/subjects
// @desc    Get all available subjects with question counts
// @access  Private - Student
router.get("/subjects", getSubjects);

// @route   GET /api/student/quiz/questions/:subject
// @desc    Get random questions for a subject
// @access  Private - Student
router.get("/questions/:subject", getQuestionsBySubject);

// @route   POST /api/student/quiz/start
// @desc    Start a new quiz session
// @access  Private - Student
router.post("/start", requireEmailVerification, startQuiz);

// @route   POST /api/student/quiz/submit
// @desc    Submit quiz answers and get results
// @access  Private - Student
router.post(
  "/submit",
  quizLimiter,
  requireEmailVerification,
  validateSubmitScore,
  submitQuiz,
);

// @route   GET /api/student/quiz/history
// @desc    Get student quiz history
// @access  Private - Student
router.get("/history", getQuizHistory);

// @route   GET /api/student/quiz/:id
// @desc    Get a specific quiz result by ID
// @access  Private - Student
router.get("/:id", validateMongoId("id"), getQuizById);

// @route   POST /api/student/quiz/retry/:id
// @desc    Retry a previous quiz with same subject
// @access  Private - Student
router.post("/retry/:id", validateMongoId("id"), retryQuiz);

// @route   GET /api/student/quiz/stats/overview
// @desc    Get student quiz statistics overview
// @access  Private - Student
router.get("/stats/overview", getQuizStats);

module.exports = router;
