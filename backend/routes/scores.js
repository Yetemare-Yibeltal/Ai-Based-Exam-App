const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const { validateMongoId, validatePaginationQuery } = require('../middleware/validate');

const {
  getScores,
  getScoreById,
  getScoresBySubject,
  getScoreProgress,
  getSubjectStats,
  getBestScores,
  getScoreSummary,
  deleteScore,
  getPlatformStats,
} = require('../controllers/scoresController');

router.use(protect);

router.get('/', validatePaginationQuery, getScores);
router.get('/summary', getScoreSummary);
router.get('/best', getBestScores);
router.get('/stats/subjects', getSubjectStats);
router.get('/stats/platform', getPlatformStats);
router.get('/subject/:subject', validatePaginationQuery, getScoresBySubject);
router.get('/progress/:subject', getScoreProgress);
router.get('/:id', validateMongoId('id'), getScoreById);
router.delete('/:id', validateMongoId('id'), deleteScore);

module.exports = router;
