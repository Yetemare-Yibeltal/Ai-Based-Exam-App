const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { restrictTo, teacherOrAdmin } = require("../middleware/role");
const { aiLimiter } = require("../middleware/rateLimiter");
const {
  validateAIGenerate,
  validateMongoId,
} = require("../middleware/validate");

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

router.use(protect);

router.post(
  "/generate",
  aiLimiter,
  teacherOrAdmin,
  validateAIGenerate,
  generateQuestions,
);
router.post("/generate/bulk", aiLimiter, teacherOrAdmin, bulkGenerateQuestions);

router.post("/validate", aiLimiter, teacherOrAdmin, validateQuestion);
router.post(
  "/validate/batch",
  aiLimiter,
  teacherOrAdmin,
  batchValidateQuestions,
);
router.post(
  "/validate/my-questions",
  aiLimiter,
  restrictTo("teacher"),
  validateTeacherQuestions,
);
router.get("/validate/history", restrictTo("teacher"), getValidationHistory);
router.post(
  "/validate/:id",
  aiLimiter,
  teacherOrAdmin,
  validateMongoId("id"),
  validateQuestionById,
);

router.get("/study-tips", aiLimiter, restrictTo("student"), getStudyTips);
router.get(
  "/study-tips/subject/:subject",
  aiLimiter,
  restrictTo("student"),
  getSubjectStudyTips,
);
router.get(
  "/study-tips/plan",
  aiLimiter,
  restrictTo("student"),
  getPersonalizedPlan,
);
router.get("/study-tips/exam", restrictTo("student"), getExamTips);
router.get(
  "/study-tips/time-management",
  restrictTo("student"),
  getTimeManagementTips,
);

router.get(
  "/weak-subjects",
  aiLimiter,
  restrictTo("student"),
  analyzeWeakSubjects,
);
router.get(
  "/weak-subjects/:subject",
  aiLimiter,
  restrictTo("student"),
  getSubjectRecommendations,
);

router.post("/explain", aiLimiter, restrictTo("student"), explainAnswer);
router.post(
  "/explain/batch",
  aiLimiter,
  restrictTo("student"),
  batchExplainAnswers,
);

router.post(
  "/feedback",
  aiLimiter,
  restrictTo("student"),
  generateQuizFeedback,
);

router.get("/stats", teacherOrAdmin, getAIUsageStats);
router.get("/history", getMyAIHistory);

module.exports = router;
