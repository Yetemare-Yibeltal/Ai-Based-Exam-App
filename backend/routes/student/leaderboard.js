const express = require("express");
const router = express.Router();

// Import middleware
const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const { cacheLeaderboard } = require("../../middleware/cache");
const { validatePaginationQuery } = require("../../middleware/validate");

// Import controllers
const {
  getGlobalLeaderboard,
  getSubjectLeaderboard,
  getMyRank,
  getTopStudents,
  getLeaderboardByGrade,
  getLeaderboardBySchool,
  getWeeklyLeaderboard,
  getMonthlyLeaderboard,
} = require("../../controllers/student/leaderboardController");

// All routes require authentication and student role
router.use(protect);
router.use(restrictTo("student"));

// @route   GET /api/student/leaderboard
// @desc    Get global leaderboard
// @access  Private - Student
router.get("/", cacheLeaderboard, getGlobalLeaderboard);

// @route   GET /api/student/leaderboard/my-rank
// @desc    Get current student rank
// @access  Private - Student
router.get("/my-rank", getMyRank);

// @route   GET /api/student/leaderboard/top
// @desc    Get top students overall
// @access  Private - Student
router.get("/top", cacheLeaderboard, getTopStudents);

// @route   GET /api/student/leaderboard/weekly
// @desc    Get weekly leaderboard
// @access  Private - Student
router.get("/weekly", cacheLeaderboard, getWeeklyLeaderboard);

// @route   GET /api/student/leaderboard/monthly
// @desc    Get monthly leaderboard
// @access  Private - Student
router.get("/monthly", cacheLeaderboard, getMonthlyLeaderboard);

// @route   GET /api/student/leaderboard/grade
// @desc    Get leaderboard filtered by grade
// @access  Private - Student
router.get("/grade", cacheLeaderboard, getLeaderboardByGrade);

// @route   GET /api/student/leaderboard/school
// @desc    Get leaderboard filtered by school
// @access  Private - Student
router.get("/school", cacheLeaderboard, getLeaderboardBySchool);

// @route   GET /api/student/leaderboard/subject/:subject
// @desc    Get leaderboard for a specific subject
// @access  Private - Student
router.get("/subject/:subject", cacheLeaderboard, getSubjectLeaderboard);

module.exports = router;
