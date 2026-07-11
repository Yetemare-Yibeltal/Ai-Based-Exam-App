const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { adminOnly } = require("../../middleware/role");
const {
  validateMongoId,
  validatePaginationQuery,
} = require("../../middleware/validate");
const { cacheQuestions } = require("../../middleware/cache");

const {
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  approveQuestion,
  rejectQuestion,
  getPendingQuestions,
  getQuestionStats,
  bulkApprove,
  bulkReject,
  featureQuestion,
} = require("../../controllers/admin/questionsController");

router.use(protect);
router.use(adminOnly);

router.get("/", validatePaginationQuery, getAllQuestions);
router.get("/stats", getQuestionStats);
router.get("/pending", validatePaginationQuery, getPendingQuestions);
router.get("/:id", validateMongoId("id"), getQuestionById);
router.put("/:id", validateMongoId("id"), updateQuestion);
router.delete("/:id", validateMongoId("id"), deleteQuestion);
router.put("/:id/approve", validateMongoId("id"), approveQuestion);
router.put("/:id/reject", validateMongoId("id"), rejectQuestion);
router.put("/:id/feature", validateMongoId("id"), featureQuestion);
router.post("/bulk-approve", bulkApprove);
router.post("/bulk-reject", bulkReject);

module.exports = router;
