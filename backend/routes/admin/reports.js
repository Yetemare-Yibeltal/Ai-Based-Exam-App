const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { adminOnly } = require("../../middleware/role");
const { reportLimiter } = require("../../middleware/rateLimiter");

const {
  getStudentReport,
  getQuestionReport,
  getPerformanceReport,
  getAIReport,
  exportStudentsCsv,
  exportQuestionsCsv,
} = require("../../controllers/admin/reportsController");

router.use(protect);
router.use(adminOnly);

router.get("/students", reportLimiter, getStudentReport);
router.get("/questions", reportLimiter, getQuestionReport);
router.get("/performance", reportLimiter, getPerformanceReport);
router.get("/ai", reportLimiter, getAIReport);
router.get("/export/students", reportLimiter, exportStudentsCsv);
router.get("/export/questions", reportLimiter, exportQuestionsCsv);

module.exports = router;
