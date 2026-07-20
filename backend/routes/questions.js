const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { optionalAuth } = require("../middleware/auth");
const {
  validateMongoId,
  validatePaginationQuery,
} = require("../middleware/validate");
const { cacheQuestions } = require("../middleware/cache");

const {
  getQuestions,
  getQuestionById,
  getSubjectStats,
  checkAnswers,
  reportQuestion,
} = require("../controllers/questionsController");

router.get("/", cacheQuestions, validatePaginationQuery, getQuestions);
router.get("/stats/subjects", cacheQuestions, getSubjectStats);
router.get("/:id", validateMongoId("id"), getQuestionById);
router.post("/check", protect, checkAnswers);
router.post("/:id/report", protect, validateMongoId("id"), reportQuestion);

module.exports = router;
