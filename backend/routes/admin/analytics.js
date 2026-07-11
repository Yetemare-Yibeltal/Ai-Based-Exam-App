const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { adminOnly } = require("../../middleware/role");
const { cacheAnalytics, cacheAdminStats } = require("../../middleware/cache");

const {
  getOverview,
  getUserAnalytics,
  getQuestionAnalytics,
  getScoreAnalytics,
  getAIAnalytics,
  getPlatformGrowth,
} = require("../../controllers/admin/analyticsController");

router.use(protect);
router.use(adminOnly);

router.get("/overview", cacheAdminStats, getOverview);
router.get("/users", cacheAnalytics, getUserAnalytics);
router.get("/questions", cacheAnalytics, getQuestionAnalytics);
router.get("/scores", cacheAnalytics, getScoreAnalytics);
router.get("/ai", cacheAnalytics, getAIAnalytics);
router.get("/growth", cacheAnalytics, getPlatformGrowth);

module.exports = router;
