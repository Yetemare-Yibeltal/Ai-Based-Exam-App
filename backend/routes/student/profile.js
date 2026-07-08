const express = require("express");
const router = express.Router();

// Import middleware
const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const {
  validateMongoId,
  validatePaginationQuery,
} = require("../../middleware/validate");
const { uploadAvatar } = require("../../middleware/upload");

// Import controllers
const {
  getProfile,
  updateProfile,
  uploadAvatar: uploadAvatarController,
  deleteAvatar,
  getStudyStreak,
  getAchievements,
  getWeakSubjects,
  updateNotificationSettings,
  getActivityLog,
  getPublicProfile,
} = require("../../controllers/student/profileController");

// All routes require authentication and student role
router.use(protect);
router.use(restrictTo("student"));

// @route   GET /api/student/profile
// @desc    Get student full profile
// @access  Private - Student
router.get("/", getProfile);

// @route   PUT /api/student/profile
// @desc    Update student profile
// @access  Private - Student
router.put("/", updateProfile);

// @route   POST /api/student/profile/avatar
// @desc    Upload profile avatar
// @access  Private - Student
router.post("/avatar", uploadAvatar, uploadAvatarController);

// @route   DELETE /api/student/profile/avatar
// @desc    Delete profile avatar
// @access  Private - Student
router.delete("/avatar", deleteAvatar);

// @route   GET /api/student/profile/streak
// @desc    Get student study streak info
// @access  Private - Student
router.get("/streak", getStudyStreak);

// @route   GET /api/student/profile/achievements
// @desc    Get student achievements and badges
// @access  Private - Student
router.get("/achievements", getAchievements);

// @route   GET /api/student/profile/weak-subjects
// @desc    Get AI analysis of weak subjects
// @access  Private - Student
router.get("/weak-subjects", getWeakSubjects);

// @route   PUT /api/student/profile/notifications
// @desc    Update notification settings
// @access  Private - Student
router.put("/notifications", updateNotificationSettings);

// @route   GET /api/student/profile/activity
// @desc    Get student activity log
// @access  Private - Student
router.get("/activity", validatePaginationQuery, getActivityLog);

// @route   GET /api/student/profile/public/:id
// @desc    Get public profile of any student
// @access  Private - Student
router.get("/public/:id", validateMongoId("id"), getPublicProfile);

module.exports = router;
