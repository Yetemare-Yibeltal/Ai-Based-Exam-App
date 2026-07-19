const { catchAsync } = require("../middleware/errorHandler");
const { successResponse, errorResponse } = require("../utils/apiResponse");
const leaderboardService = require("../services/leaderboard.service");

exports.getGlobalLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const leaderboard = await leaderboardService.getGlobalLeaderboard(
    limit,
    req.userId,
  );

  return successResponse(res, "Global leaderboard retrieved successfully", {
    leaderboard,
    total: leaderboard.length,
  });
});

exports.getSubjectLeaderboard = catchAsync(async (req, res) => {
  const { subject } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);

  const result = await leaderboardService.getSubjectLeaderboard(
    subject,
    limit,
    req.userId,
  );

  return successResponse(
    res,
    `${subject} leaderboard retrieved successfully`,
    result,
  );
});

exports.getMyRank = catchAsync(async (req, res) => {
  const result = await leaderboardService.getMyRank(req.userId);
  return successResponse(res, "Your rank retrieved successfully", result);
});

exports.getTopStudents = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);
  const topStudents = await leaderboardService.getTopStudents(
    limit,
    req.userId,
  );

  return successResponse(res, "Top students retrieved successfully", {
    topStudents,
  });
});

exports.getWeeklyLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const result = await leaderboardService.getWeeklyLeaderboard(
    limit,
    req.userId,
  );

  return successResponse(
    res,
    "Weekly leaderboard retrieved successfully",
    result,
  );
});

exports.getMonthlyLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const result = await leaderboardService.getMonthlyLeaderboard(
    limit,
    req.userId,
  );

  return successResponse(
    res,
    "Monthly leaderboard retrieved successfully",
    result,
  );
});

exports.getLeaderboardByGrade = catchAsync(async (req, res) => {
  const { grade = "Grade 12" } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);

  const result = await leaderboardService.getLeaderboardByGrade(
    grade,
    limit,
    req.userId,
  );

  return successResponse(
    res,
    `${grade} leaderboard retrieved successfully`,
    result,
  );
});

exports.getLeaderboardBySchool = catchAsync(async (req, res) => {
  const { school } = req.query;

  if (!school) return errorResponse(res, "School name is required", 400);

  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const result = await leaderboardService.getLeaderboardBySchool(
    school,
    limit,
    req.userId,
  );

  return successResponse(
    res,
    "School leaderboard retrieved successfully",
    result,
  );
});
