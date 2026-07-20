const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { restrictTo, teacherOrAdmin } = require("../middleware/role");
const { aiLimiter } = require("../middleware/rateLimiter");
const { validateMongoId } = require("../middleware/validate");
const {
  generateQuestionValidator,
  validateQuestionValidator,
  generateStudyTipsValidator,
  explainAnswerValidator,
  analyzeWeakSubjectsValidator,
  generatePersonalizedPlanValidator,
} = require("../validators/ai.validator");

const {
  generateQuestions,
  bulkGenerateQuestions,
  getStudyTips,
  getSubjectStudyTips,
  getPersonalizedPlan,
  getExamTips,
  getTimeManagementTips,
  analyzeWeakSubjects,
  getSubjectRecommendations,
  explainAnswer,
  batchExplainAnswers,
  generateQuizFeedback,
  getAIUsageStats,
  getMyAIHistory,
} = require("../controllers/ai/generateController");

const {
  validateQuestion,
  validateQuestionById,
  batchValidateQuestions,
  validateTeacherQuestions,
  getValidationHistory,
} = require("../controllers/ai/validateController");

// ── STUDENT ROUTES ─────────────────────────────────────────
router.get(
  "/study-tips",
  protect,
  restrictTo("student"),
  aiLimiter,
  getStudyTips,
);
router.get(
  "/study-tips/:subject",
  protect,
  restrictTo("student"),
  aiLimiter,
  getSubjectStudyTips,
);
router.get(
  "/personalized-plan",
  protect,
  restrictTo("student"),
  aiLimiter,
  getPersonalizedPlan,
);
router.get("/exam-tips", protect, getExamTips);
router.get("/time-management", protect, getTimeManagementTips);
router.get(
  "/weak-subjects",
  protect,
  restrictTo("student"),
  aiLimiter,
  analyzeWeakSubjects,
);
router.get(
  "/subject-recommendations/:subject",
  protect,
  restrictTo("student"),
  aiLimiter,
  getSubjectRecommendations,
);
router.post(
  "/explain-answer",
  protect,
  restrictTo("student"),
  aiLimiter,
  explainAnswer,
);
router.post(
  "/batch-explain",
  protect,
  restrictTo("student"),
  aiLimiter,
  batchExplainAnswers,
);
router.post(
  "/quiz-feedback",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateQuizFeedback,
);

// ── TEACHER ROUTES ─────────────────────────────────────────
router.post(
  "/generate-questions",
  protect,
  teacherOrAdmin,
  aiLimiter,
  generateQuestionValidator,
  generateQuestions,
);
router.post(
  "/bulk-generate",
  protect,
  restrictTo("admin"),
  aiLimiter,
  bulkGenerateQuestions,
);
router.post(
  "/validate-question",
  protect,
  teacherOrAdmin,
  aiLimiter,
  validateQuestionValidator,
  validateQuestion,
);
router.post(
  "/batch-validate",
  protect,
  teacherOrAdmin,
  aiLimiter,
  batchValidateQuestions,
);
router.get(
  "/validate-question/:id",
  protect,
  teacherOrAdmin,
  validateMongoId("id"),
  validateQuestionById,
);
router.get(
  "/validate-my-questions",
  protect,
  restrictTo("teacher"),
  validateTeacherQuestions,
);
router.get(
  "/validation-history",
  protect,
  teacherOrAdmin,
  getValidationHistory,
);
router.get("/my-history", protect, teacherOrAdmin, getMyAIHistory);

// ── ADMIN ROUTES ───────────────────────────────────────────
router.get("/usage-stats", protect, restrictTo("admin"), getAIUsageStats);

module.exports = router;
