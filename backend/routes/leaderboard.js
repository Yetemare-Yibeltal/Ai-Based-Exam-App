const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { optionalAuth } = require("../middleware/auth");
const { cacheLeaderboard } = require("../middleware/cache");

const {
  getGlobalLeaderboard,
  getSubjectLeaderboard,
  getMyRank,
  getTopStudents,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
  getLeaderboardByGrade,
  getLeaderboardBySchool,
} = require("../controllers/leaderboardController");

router.get("/", optionalAuth, cacheLeaderboard, getGlobalLeaderboard);
router.get("/top", optionalAuth, cacheLeaderboard, getTopStudents);
router.get("/weekly", optionalAuth, cacheLeaderboard, getWeeklyLeaderboard);
router.get("/monthly", optionalAuth, cacheLeaderboard, getMonthlyLeaderboard);
router.get("/grade", optionalAuth, cacheLeaderboard, getLeaderboardByGrade);
router.get("/school", optionalAuth, cacheLeaderboard, getLeaderboardBySchool);
router.get("/my-rank", protect, getMyRank);
router.get(
  "/subject/:subject",
  optionalAuth,
  cacheLeaderboard,
  getSubjectLeaderboard,
);

module.exports = router;
