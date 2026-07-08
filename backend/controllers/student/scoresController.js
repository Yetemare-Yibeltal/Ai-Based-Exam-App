const Score = require("../../models/Score");
const User = require("../../models/User");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");
const logger = require("../../utils/logger");

// ── GET MY SCORES ──────────────────────────────────────────

// @desc    Get all scores for logged in student
// @route   GET /api/student/scores
// @access  Private - Student
exports.getMyScores = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);
  const { subject, difficulty, startDate, endDate, sortBy, sortOrder } =
    req.query;

  const filter = { userId: req.user._id };

  if (subject) filter.subject = subject.toLowerCase();
  if (difficulty) filter.difficulty = difficulty;

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = end;
    }
  }

  const sortField = sortBy || "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [scores, total] = await Promise.all([
    Score.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .select("-answers"),
    Score.countDocuments(filter),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  return paginatedResponse(
    res,
    "Scores retrieved successfully",
    scores.map((s) => s.getSummary()),
    pagination,
  );
});

// ── GET SCORE BY ID ────────────────────────────────────────

// @desc    Get a specific score by ID
// @route   GET /api/student/scores/:id
// @access  Private - Student
exports.getScoreById = catchAsync(async (req, res, next) => {
  const score = await Score.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate(
    "answers.questionId",
    "questionText options explanation subject topic difficulty year",
  );

  if (!score) {
    return notFoundResponse(
      res,
      "Score not found or you do not have permission to view it",
    );
  }

  return successResponse(res, "Score retrieved successfully", {
    score: score.getSummary(),
    detailedAnswers: score.answers.map((answer) => ({
      questionId: answer.questionId?._id,
      questionText: answer.questionId?.questionText,
      options: answer.questionId?.options,
      explanation: answer.questionId?.explanation,
      subject: answer.questionId?.subject,
      topic: answer.questionId?.topic,
      difficulty: answer.questionId?.difficulty,
      year: answer.questionId?.year,
      selectedAnswer: answer.selectedAnswer,
      correctAnswer: answer.correctAnswer,
      isCorrect: answer.isCorrect,
      timeToAnswer: answer.timeToAnswer,
    })),
  });
});

// ── GET SCORES BY SUBJECT ──────────────────────────────────

// @desc    Get scores for a specific subject
// @route   GET /api/student/scores/subject/:subject
// @access  Private - Student
exports.getScoresBySubject = catchAsync(async (req, res, next) => {
  const { subject } = req.params;
  const { page, limit, skip } = getPagination(req.query);

  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];

  if (!validSubjects.includes(subject.toLowerCase())) {
    return errorResponse(
      res,
      `Invalid subject. Must be one of: ${validSubjects.join(", ")}`,
      400,
    );
  }

  const filter = {
    userId: req.user._id,
    subject: subject.toLowerCase(),
  };

  const [scores, total] = await Promise.all([
    Score.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-answers"),
    Score.countDocuments(filter),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  // Calculate subject specific stats
  const subjectStats = await Score.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        avgScore: { $avg: "$percentage" },
        bestScore: { $max: "$percentage" },
        lowestScore: { $min: "$percentage" },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: "$correctAnswers" },
        totalQuestions: { $sum: "$totalQuestions" },
        perfectScores: { $sum: { $cond: ["$isPerfectScore", 1, 0] } },
        passedCount: { $sum: { $cond: ["$isPassingScore", 1, 0] } },
        totalTimeTaken: { $sum: "$timeTaken" },
      },
    },
    {
      $project: {
        _id: 0,
        avgScore: { $round: ["$avgScore", 1] },
        bestScore: 1,
        lowestScore: 1,
        totalAttempts: 1,
        totalCorrect: 1,
        totalQuestions: 1,
        perfectScores: 1,
        passRate: {
          $round: [
            {
              $multiply: [{ $divide: ["$passedCount", "$totalAttempts"] }, 100],
            },
            1,
          ],
        },
        accuracy: {
          $round: [
            {
              $multiply: [
                { $divide: ["$totalCorrect", "$totalQuestions"] },
                100,
              ],
            },
            1,
          ],
        },
        avgTimeTaken: {
          $round: [{ $divide: ["$totalTimeTaken", "$totalAttempts"] }, 0],
        },
      },
    },
  ]);

  return paginatedResponse(
    res,
    `${subject} scores retrieved successfully`,
    scores.map((s) => s.getSummary()),
    pagination,
    { subjectStats: subjectStats[0] || {} },
  );
});

// ── GET SCORE PROGRESS ─────────────────────────────────────

// @desc    Get score progress over time for a subject
// @route   GET /api/student/scores/progress/:subject
// @access  Private - Student
exports.getScoreProgress = catchAsync(async (req, res, next) => {
  const { subject } = req.params;
  const { days = 30 } = req.query;

  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];

  if (!validSubjects.includes(subject.toLowerCase())) {
    return errorResponse(
      res,
      `Invalid subject. Must be one of: ${validSubjects.join(", ")}`,
      400,
    );
  }

  const daysInt = Math.min(Math.max(parseInt(days) || 30, 7), 365);

  const progressData = await Score.getProgressOverTime(
    req.user._id,
    subject.toLowerCase(),
    daysInt,
  );

  // Calculate improvement trend
  let trend = "stable";
  if (progressData.length >= 2) {
    const firstHalf = progressData.slice(
      0,
      Math.floor(progressData.length / 2),
    );
    const secondHalf = progressData.slice(Math.floor(progressData.length / 2));

    const firstAvg =
      firstHalf.reduce((sum, d) => sum + d.avgScore, 0) / firstHalf.length;
    const secondAvg =
      secondHalf.reduce((sum, d) => sum + d.avgScore, 0) / secondHalf.length;

    if (secondAvg > firstAvg + 5) trend = "improving";
    else if (secondAvg < firstAvg - 5) trend = "declining";
  }

  return successResponse(res, "Score progress retrieved successfully", {
    subject,
    days: daysInt,
    trend,
    dataPoints: progressData.length,
    progress: progressData.map((d) => ({
      date: d.date,
      avgScore: d.avgScore,
      attempts: d.attempts,
    })),
  });
});

// ── GET SUBJECT STATS ──────────────────────────────────────

// @desc    Get detailed stats per subject
// @route   GET /api/student/scores/stats/subjects
// @access  Private - Student
exports.getSubjectStats = catchAsync(async (req, res, next) => {
  const subjectStats = await Score.getUserSubjectStats(req.user._id);

  const user = await User.findById(req.user._id).select(
    "totalQuizzesTaken averageScore bestScore totalCorrectAnswers totalQuestionsAnswered studyStreak",
  );

  // Add performance level to each subject
  const enrichedStats = subjectStats.map((stat) => ({
    subject: stat._id,
    avgScore: stat.avgScore,
    bestScore: stat.bestScore,
    lowestScore: stat.lowestScore,
    totalAttempts: stat.totalAttempts,
    totalCorrect: stat.totalCorrect,
    totalQuestions: stat.totalQuestions,
    totalTimeTaken: stat.totalTimeTaken,
    perfectScores: stat.perfectScores,
    passRate: stat.passRate,
    overallAccuracy: stat.overallAccuracy,
    performanceLevel:
      stat.avgScore >= 90
        ? "Excellent"
        : stat.avgScore >= 75
          ? "Good"
          : stat.avgScore >= 60
            ? "Average"
            : stat.avgScore >= 50
              ? "Below Average"
              : "Poor",
    needsImprovement: stat.avgScore < 60,
  }));

  // Sort by performance (worst first for priority improvement)
  const subjectsNeedingImprovement = enrichedStats
    .filter((s) => s.needsImprovement)
    .sort((a, b) => a.avgScore - b.avgScore);

  return successResponse(res, "Subject statistics retrieved successfully", {
    overall: {
      totalQuizzesTaken: user.totalQuizzesTaken,
      averageScore: user.averageScore,
      bestScore: user.bestScore,
      totalCorrectAnswers: user.totalCorrectAnswers,
      totalQuestionsAnswered: user.totalQuestionsAnswered,
      accuracy:
        user.totalQuestionsAnswered > 0
          ? Math.round(
              (user.totalCorrectAnswers / user.totalQuestionsAnswered) * 100,
            )
          : 0,
      studyStreak: user.studyStreak,
    },
    subjects: enrichedStats,
    prioritySubjects: subjectsNeedingImprovement.slice(0, 3),
  });
});

// ── DELETE SCORE ───────────────────────────────────────────

// @desc    Delete a specific score
// @route   DELETE /api/student/scores/:id
// @access  Private - Student
exports.deleteScore = catchAsync(async (req, res, next) => {
  const score = await Score.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!score) {
    return notFoundResponse(
      res,
      "Score not found or you do not have permission to delete it",
    );
  }

  await Score.findByIdAndDelete(req.params.id);

  // Update user statistics after deletion
  const remainingStats = await Score.aggregate([
    { $match: { userId: req.user._id } },
    {
      $group: {
        _id: null,
        totalQuizzesTaken: { $sum: 1 },
        totalCorrectAnswers: { $sum: "$correctAnswers" },
        totalQuestionsAnswered: { $sum: "$totalQuestions" },
        bestScore: { $max: "$percentage" },
      },
    },
  ]);

  if (remainingStats.length > 0) {
    const stats = remainingStats[0];
    await User.findByIdAndUpdate(req.user._id, {
      totalQuizzesTaken: stats.totalQuizzesTaken,
      totalCorrectAnswers: stats.totalCorrectAnswers,
      totalQuestionsAnswered: stats.totalQuestionsAnswered,
      bestScore: stats.bestScore,
      averageScore:
        stats.totalQuestionsAnswered > 0
          ? Math.round(
              (stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100,
            )
          : 0,
    });
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      totalQuizzesTaken: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAnswered: 0,
      bestScore: 0,
      averageScore: 0,
    });
  }

  logger.info(
    `Score deleted — Student: ${req.userId} — Score: ${req.params.id}`,
  );

  return successResponse(res, "Score deleted successfully");
});

// ── GET BEST SCORES ────────────────────────────────────────

// @desc    Get best score per subject
// @route   GET /api/student/scores/best
// @access  Private - Student
exports.getBestScores = catchAsync(async (req, res, next) => {
  const bestScores = await Score.aggregate([
    { $match: { userId: req.user._id } },
    { $sort: { percentage: -1 } },
    {
      $group: {
        _id: "$subject",
        bestScore: { $first: "$percentage" },
        bestGrade: { $first: "$grade" },
        scoreId: { $first: "$_id" },
        correctAnswers: { $first: "$correctAnswers" },
        totalQuestions: { $first: "$totalQuestions" },
        timeTaken: { $first: "$timeTaken" },
        achievedAt: { $first: "$createdAt" },
      },
    },
    { $sort: { bestScore: -1 } },
  ]);

  return successResponse(res, "Best scores retrieved successfully", {
    bestScores: bestScores.map((s) => ({
      subject: s._id,
      bestScore: s.bestScore,
      bestGrade: s.bestGrade,
      scoreId: s.scoreId,
      correctAnswers: s.correctAnswers,
      totalQuestions: s.totalQuestions,
      timeTaken: s.timeTaken,
      achievedAt: s.achievedAt,
    })),
  });
});

// ── GET SCORE SUMMARY ──────────────────────────────────────

// @desc    Get score summary and overall statistics
// @route   GET /api/student/scores/summary
// @access  Private - Student
exports.getScoreSummary = catchAsync(async (req, res, next) => {
  const [overallStats, recentScores, bestScorePerSubject, monthlyProgress] =
    await Promise.all([
      Score.aggregate([
        { $match: { userId: req.user._id } },
        {
          $group: {
            _id: null,
            totalQuizzes: { $sum: 1 },
            avgScore: { $avg: "$percentage" },
            bestScore: { $max: "$percentage" },
            totalCorrect: { $sum: "$correctAnswers" },
            totalQuestions: { $sum: "$totalQuestions" },
            totalTimeTaken: { $sum: "$timeTaken" },
            perfectScores: { $sum: { $cond: ["$isPerfectScore", 1, 0] } },
            passedQuizzes: { $sum: { $cond: ["$isPassingScore", 1, 0] } },
          },
        },
        {
          $project: {
            _id: 0,
            totalQuizzes: 1,
            avgScore: { $round: ["$avgScore", 1] },
            bestScore: 1,
            totalCorrect: 1,
            totalQuestions: 1,
            totalTimeTaken: 1,
            perfectScores: 1,
            passRate: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$passedQuizzes", "$totalQuizzes"] },
                    100,
                  ],
                },
                1,
              ],
            },
            accuracy: {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$totalCorrect", "$totalQuestions"] },
                    100,
                  ],
                },
                1,
              ],
            },
          },
        },
      ]),
      Score.getRecentScores(req.user._id, 5),
      Score.aggregate([
        { $match: { userId: req.user._id } },
        { $sort: { percentage: -1 } },
        {
          $group: {
            _id: "$subject",
            bestScore: { $first: "$percentage" },
            bestGrade: { $first: "$grade" },
          },
        },
        { $sort: { bestScore: -1 } },
      ]),
      Score.aggregate([
        {
          $match: {
            userId: req.user._id,
            createdAt: {
              $gte: new Date(new Date().setDate(new Date().getDate() - 30)),
            },
          },
        },
        {
          $group: {
            _id: {
              week: { $week: "$createdAt" },
              year: { $year: "$createdAt" },
            },
            avgScore: { $avg: "$percentage" },
            attempts: { $sum: 1 },
          },
        },
        { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
        { $sort: { "_id.year": 1, "_id.week": 1 } },
      ]),
    ]);

  return successResponse(res, "Score summary retrieved successfully", {
    overall: overallStats[0] || {
      totalQuizzes: 0,
      avgScore: 0,
      bestScore: 0,
      totalCorrect: 0,
      totalQuestions: 0,
      perfectScores: 0,
      passRate: 0,
      accuracy: 0,
    },
    recentScores: recentScores.map((s) => s.getSummary()),
    bestPerSubject: bestScorePerSubject,
    monthlyProgress,
  });
});
