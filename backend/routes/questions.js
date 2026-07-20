exports.featureQuestion = catchAsync(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return notFoundResponse(res, "Question not found");

  if (question.status !== "approved") {
    return errorResponse(res, "Only approved questions can be featured", 400);
  }

  question.tags = question.tags || [];
  const isFeatured = question.tags.includes("featured");

  if (isFeatured) {
    question.tags = question.tags.filter((t) => t !== "featured");
  } else {
    question.tags.push("featured");
  }

  await question.save({ validateBeforeSave: false });

  return successResponse(
    res,
    isFeatured
      ? "Question unfeatured successfully"
      : "Question featured successfully",
    { question: question.getFullQuestion() },
  );
});
const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { adminOnly } = require("../../middleware/role");
const {
  validateMongoId,
  validatePaginationQuery,
} = require("../../middleware/validate");

const questionsController = require("../../controllers/admin/questionsController");

router.use(protect);
router.use(adminOnly);

router.get("/", validatePaginationQuery, questionsController.getAllQuestions);
router.get("/stats", questionsController.getQuestionStats);
router.get(
  "/pending",
  validatePaginationQuery,
  questionsController.getPendingQuestions,
);
router.post("/bulk-approve", questionsController.bulkApprove);
router.post("/bulk-reject", questionsController.bulkReject);
router.get("/:id", validateMongoId("id"), questionsController.getQuestionById);
router.put("/:id", validateMongoId("id"), questionsController.updateQuestion);
router.delete(
  "/:id",
  validateMongoId("id"),
  questionsController.deleteQuestion,
);
router.put(
  "/:id/approve",
  validateMongoId("id"),
  questionsController.approveQuestion,
);
router.put(
  "/:id/reject",
  validateMongoId("id"),
  questionsController.rejectQuestion,
);
router.put(
  "/:id/feature",
  validateMongoId("id"),
  questionsController.featureQuestion,
);

module.exports = router;