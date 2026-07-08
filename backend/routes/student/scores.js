const express = require('express');
const router = express.Router();

// Import middleware
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const { validateMongoId, validatePaginationQuery } = require('../../middleware/validate');

// Import controllers
const {
  getMyScores,
  getScoreById,
  getScoresBySubject,
  getScoreProgress,
  getSubjectStats,
  deleteScore,
  getBestScores,
  getScoreSummary,
} = require('../../controllers/student/scoresController');

// All routes require authentication and student role
router.use(protect);
router.use(restrictTo('student'));

// @route   GET /api/student/scores
// @desc    Get all scores for logged in student
// @access  Private - Student
router.get('/', validatePaginationQuery, getMyScores);

// @route   GET /api/student/scores/summary
// @desc    Get score summary and statistics
// @access  Private - Student
router.get('/summary', getScoreSummary);

// @route   GET /api/student/scores/best
// @desc    Get best scores per subject
// @access  Private - Student
router.get('/best', getBestScores);

// @route   GET /api/student/scores/subject/:subject
// @desc    Get scores by subject
// @access  Private - Student
router.get('/subject/:subject', validatePaginationQuery, getScoresBySubject);

// @route   GET /api/student/scores/progress/:subject
// @desc    Get score progress over time for a subject
// @access  Private - Student
router.get('/progress/:subject', getScoreProgress);

// @route   GET /api/student/scores/stats/subjects
// @desc    Get detailed stats per subject
// @access  Private - Student
router.get('/stats/subjects', getSubjectStats);

// @route   GET /api/student/scores/:id
// @desc    Get a specific score by ID
// @access  Private - Student
router.get('/:id', validateMongoId('id'), getScoreById);

// @route   DELETE /api/student/scores/:id
// @desc    Delete a specific score
// @access  Private - Student
router.delete('/:id', validateMongoId('id'), deleteScore);

module.exports = router;