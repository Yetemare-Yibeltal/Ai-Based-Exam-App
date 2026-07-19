const { catchAsync } = require("../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const scoreService = require("../services/scores.service");
const logger = require("../utils/logger");

exports.getScores = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { subject, difficulty, startDate, endDate, sortBy, sortOrder } =
    req.query;

  const result = await scoreService.getUserScores(req.userId, {
    page,
    limit,
    subject,
    difficulty,
    startDate,
    endDate,
    sortBy,
    sortOrder,
  });

  return paginatedResponse(
    res,
    "Scores retrieved successfully",
    result.scores,
    getPaginationMeta(result.total, page, limit),
  );
});

exports.getScoreById = catchAsync(async (req, res) => {
  const result = await scoreService.getScoreById(req.params.id, req.userId);
  return successResponse(res, "Score retrieved successfully", result);
});

exports.getScoresBySubject = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { subject } = req.params;

  const result = await scoreService.getScoresBySubject(req.userId, subject, {
    page,
    limit,
  });

  return paginatedResponse(
    res,
    `${subject} scores retrieved successfully`,
    result.scores,
    getPaginationMeta(result.total, page, limit),
    { subjectStats: result.subjectStats },
  );
});

exports.getScoreProgress = catchAsync(async (req, res) => {
  const { subject } = req.params;
  const { days } = req.query;

  const result = await scoreService.getScoreProgress(req.userId, subject, days);
  return successResponse(res, "Score progress retrieved successfully", result);
});

exports.getSubjectStats = catchAsync(async (req, res) => {
  const stats = await scoreService.getUserSubjectStats(req.userId);
  return successResponse(res, "Subject statistics retrieved successfully", {
    subjects: stats,
  });
});

exports.getBestScores = catchAsync(async (req, res) => {
  const bestScores = await scoreService.getBestScores(req.userId);
  return successResponse(res, "Best scores retrieved successfully", {
    bestScores,
  });
});

exports.getScoreSummary = catchAsync(async (req, res) => {
  const summary = await scoreService.getScoreSummary(req.userId);
  return successResponse(res, "Score summary retrieved successfully", summary);
});

exports.deleteScore = catchAsync(async (req, res) => {
  await scoreService.deleteScore(req.params.id, req.userId);
  return successResponse(res, "Score deleted successfully");
});

exports.getPlatformStats = catchAsync(async (req, res) => {
  const stats = await scoreService.getPlatformStats();
  return successResponse(res, "Platform statistics retrieved successfully", {
    stats: stats[0] || {},
  });
});
