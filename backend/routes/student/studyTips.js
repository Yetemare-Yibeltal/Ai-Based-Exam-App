const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const { aiLimiter } = require("../../middleware/rateLimiter");

const {
  getStudyTips,
  getSubjectStudyTips,
  getPersonalizedPlan,
  getExamTips,
  getTimeManagementTips,
} = require("../../controllers/student/studyTipsController");

router.use(protect);
router.use(restrictTo("student"));

router.get("/", aiLimiter, getStudyTips);
router.get("/subject/:subject", aiLimiter, getSubjectStudyTips);
router.get("/personalized-plan", aiLimiter, getPersonalizedPlan);
router.get("/exam-tips", getExamTips);
router.get("/time-management", getTimeManagementTips);

module.exports = router;
