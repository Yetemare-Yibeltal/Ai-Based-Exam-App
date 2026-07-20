const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { restrictTo, teacherOrAdmin } = require("../middleware/role");
const { aiLimiter } = require("../middleware/rateLimiter");
const { validateMongoId } = require("../middleware/validate");

const generateController = require("../controllers/ai/generateController");
const validateController = require("../controllers/ai/validateController");

router.get(
  "/study-tips",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.getStudyTips,
);
router.get(
  "/study-tips/:subject",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.getSubjectStudyTips,
);
router.get(
  "/personalized-plan",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.getPersonalizedPlan,
);
router.get("/exam-tips", protect, generateController.getExamTips);
router.get(
  "/time-management",
  protect,
  generateController.getTimeManagementTips,
);
router.get(
  "/weak-subjects",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.analyzeWeakSubjects,
);
router.get(
  "/subject-recommendations/:subject",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.getSubjectRecommendations,
);
router.post(
  "/explain-answer",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.explainAnswer,
);
router.post(
  "/batch-explain",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.batchExplainAnswers,
);
router.post(
  "/quiz-feedback",
  protect,
  restrictTo("student"),
  aiLimiter,
  generateController.generateQuizFeedback,
);

router.post(
  "/generate-questions",
  protect,
  teacherOrAdmin,
  aiLimiter,
  generateController.generateQuestions,
);
router.post(
  "/bulk-generate",
  protect,
  restrictTo("admin"),
  aiLimiter,
  generateController.bulkGenerateQuestions,
);
router.post(
  "/validate-question",
  protect,
  teacherOrAdmin,
  aiLimiter,
  validateController.validateQuestion,
);
router.post(
  "/batch-validate",
  protect,
  teacherOrAdmin,
  aiLimiter,
  validateController.batchValidateQuestions,
);
router.get(
  "/validate-question/:id",
  protect,
  teacherOrAdmin,
  validateMongoId("id"),
  validateController.validateQuestionById,
);
router.get(
  "/validate-my-questions",
  protect,
  restrictTo("teacher"),
  validateController.validateTeacherQuestions,
);
router.get(
  "/validation-history",
  protect,
  teacherOrAdmin,
  validateController.getValidationHistory,
);
router.get(
  "/my-history",
  protect,
  teacherOrAdmin,
  generateController.getMyAIHistory,
);

router.get(
  "/usage-stats",
  protect,
  restrictTo("admin"),
  generateController.getAIUsageStats,
);

module.exports = router;
