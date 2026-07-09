const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const { aiLimiter, uploadLimiter } = require("../../middleware/rateLimiter");
const {
  validateCreateQuestion,
  validateUpdateQuestion,
  validateMongoId,
  validateAIGenerate,
} = require("../../middleware/validate");
const { uploadQuestionImage } = require("../../middleware/upload");

const {
  createQuestion,
  getMyQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  generateAIQuestion,
  submitForApproval,
  getApprovalStatus,
  uploadQuestionImage: uploadQuestionImageController,
} = require("../../controllers/teacher/questionController");

router.use(protect);
router.use(restrictTo("teacher"));

router.get("/", getMyQuestions);
router.post("/", validateCreateQuestion, createQuestion);
router.get("/:id", validateMongoId("id"), getQuestionById);
router.put(
  "/:id",
  validateMongoId("id"),
  validateUpdateQuestion,
  updateQuestion,
);
router.delete("/:id", validateMongoId("id"), deleteQuestion);
router.post("/ai/generate", aiLimiter, validateAIGenerate, generateAIQuestion);
router.post("/:id/submit", validateMongoId("id"), submitForApproval);
router.get("/:id/approval-status", validateMongoId("id"), getApprovalStatus);
router.post(
  "/:id/image",
  validateMongoId("id"),
  uploadLimiter,
  uploadQuestionImage,
  uploadQuestionImageController,
);

module.exports = router;
