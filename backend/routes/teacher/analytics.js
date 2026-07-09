const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const { cacheAnalytics } = require("../../middleware/cache");

const {
  getOverview,
  getQuestionPerformance,
  getSubjectAnalytics,
  getStudentResults,
  getAIGenerationAnalytics,
} = require("../../controllers/teacher/analyticsController");

router.use(protect);
router.use(restrictTo("teacher"));

router.get("/overview", cacheAnalytics, getOverview);
router.get("/questions", getQuestionPerformance);
router.get("/subjects", cacheAnalytics, getSubjectAnalytics);
router.get("/students", getStudentResults);
router.get("/ai", getAIGenerationAnalytics);

module.exports = router;
