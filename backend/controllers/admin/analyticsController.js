const User = require("../../models/User");
const Teacher = require("../../models/Teacher");
const Question = require("../../models/Question");
const Score = require("../../models/Score");
const Session = require("../../models/Session");
const AIGenerationLog = require("../../models/AIGenerationLog");
const Notification = require("../../models/Notification");
const { catchAsync } = require("../../middleware/errorHandler");
const { successResponse } = require("../../utils/apiResponse");

exports.getOverview = catchAsync(async (req, res) => {
  const [
    totalStudents,
    totalTeachers,
    totalQuestions,
    totalScores,
    activeSessionsCount,
    platformStats,
    newUsersToday,
    quizzesToday,
  ] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    Question.countDocuments({ status: "approved", isActive: true }),
    Score.countDocuments(),
    Session.countDocuments({ isActive: true }),
    Score.getPlatformStats(),
    User.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
    Score.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) },
    }),
  ]);

  const pendingQuestions = await Question.countDocuments({ status: "pending" });
  const pendingTeachers = await Teacher.countDocuments({
    isApproved: false,
    isActive: true,
  });

  return successResponse(res, "Admin overview retrieved successfully", {
    overview: {
      totalStudents,
      totalTeachers,
      totalQuestions,
      totalScores,
      activeSessions: activeSessionsCount,
      pendingQuestions,
      pendingTeachers,
      newUsersToday,
      quizzesToday,
    },
    platformStats: platformStats[0] || {
      totalQuizzesTaken: 0,
      avgScore: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAnswered: 0,
      perfectScores: 0,
      overallAccuracy: 0,
    },
    alerts: {
      hasPendingQuestions: pendingQuestions > 0,
      hasPendingTeachers: pendingTeachers > 0,
      pendingCount: pendingQuestions + pendingTeachers,
    },
  });
});

exports.getUserAnalytics = catchAsync(async (req, res) => {
  const { days = 30 } = req.query;
  const daysInt = Math.min(parseInt(days) || 30, 365);
  const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000);

  const [
    studentGrowth,
    teacherGrowth,
    gradeDistribution,
    topStudents,
    studentRetention,
  ] = await Promise.all([
    User.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { date: 1 } },
    ]),
    Teacher.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { date: 1 } },
    ]),
    User.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$grade", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]),
    User.getLeaderboard(10),
    User.aggregate([
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          activeStudents: {
            $sum: { $cond: [{ $gt: ["$totalQuizzesTaken", 0] }, 1, 0] },
          },
          avgQuizzesPerStudent: { $avg: "$totalQuizzesTaken" },
          avgScore: { $avg: "$averageScore" },
        },
      },
      {
        $addFields: {
          retentionRate: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$activeStudents", "$totalStudents"] },
                  100,
                ],
              },
              1,
            ],
          },
          avgQuizzesPerStudent: { $round: ["$avgQuizzesPerStudent", 1] },
          avgScore: { $round: ["$avgScore", 1] },
        },
      },
    ]),
  ]);

  return successResponse(res, "User analytics retrieved successfully", {
    growth: {
      students: studentGrowth,
      teachers: teacherGrowth,
      days: daysInt,
    },
    gradeDistribution,
    topStudents: topStudents.map((s, i) => ({
      rank: i + 1,
      name: s.name,
      grade: s.grade,
      school: s.school,
      averageScore: s.averageScore,
      totalQuizzesTaken: s.totalQuizzesTaken,
    })),
    retention: studentRetention[0] || {
      totalStudents: 0,
      activeStudents: 0,
      retentionRate: 0,
      avgQuizzesPerStudent: 0,
      avgScore: 0,
    },
  });
});

exports.getQuestionAnalytics = catchAsync(async (req, res) => {
  const [
    subjectStats,
    difficultyStats,
    approvalTrend,
    topPerformingQuestions,
    mostUsedQuestions,
  ] = await Promise.all([
    Question.getSubjectStats(),
    Question.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
          avgTimesUsed: { $avg: "$timesUsed" },
          avgCorrectRate: {
            $avg: {
              $cond: [
                { $gt: ["$timesUsed", 0] },
                {
                  $multiply: [
                    { $divide: ["$timesAnsweredCorrectly", "$timesUsed"] },
                    100,
                  ],
                },
                0,
              ],
            },
          },
        },
      },
      {
        $addFields: {
          avgTimesUsed: { $round: ["$avgTimesUsed", 1] },
          avgCorrectRate: { $round: ["$avgCorrectRate", 1] },
        },
      },
    ]),
    Question.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            status: "$status",
            week: { $week: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.week": 1 } },
    ]),
    Question.find({ status: "approved", timesUsed: { $gt: 0 } })
      .sort({ timesAnsweredCorrectly: -1 })
      .limit(10)
      .select(
        "questionText subject difficulty timesUsed timesAnsweredCorrectly",
      ),
    Question.find({ status: "approved" })
      .sort({ timesUsed: -1 })
      .limit(10)
      .select(
        "questionText subject difficulty timesUsed timesAnsweredCorrectly isAIGenerated",
      ),
  ]);

  return successResponse(res, "Question analytics retrieved successfully", {
    bySubject: subjectStats,
    byDifficulty: difficultyStats,
    approvalTrend,
    topPerforming: topPerformingQuestions.map((q) => ({
      id: q._id,
      questionText: q.questionText.slice(0, 80) + "...",
      subject: q.subject,
      difficulty: q.difficulty,
      timesUsed: q.timesUsed,
      correctRate:
        q.timesUsed > 0
          ? Math.round((q.timesAnsweredCorrectly / q.timesUsed) * 100)
          : 0,
    })),
    mostUsed: mostUsedQuestions.map((q) => ({
      id: q._id,
      questionText: q.questionText.slice(0, 80) + "...",
      subject: q.subject,
      difficulty: q.difficulty,
      timesUsed: q.timesUsed,
      isAIGenerated: q.isAIGenerated,
      correctRate:
        q.timesUsed > 0
          ? Math.round((q.timesAnsweredCorrectly / q.timesUsed) * 100)
          : 0,
    })),
  });
});

exports.getScoreAnalytics = catchAsync(async (req, res) => {
  const { days = 30 } = req.query;
  const daysInt = Math.min(parseInt(days) || 30, 365);
  const startDate = new Date(Date.now() - daysInt * 24 * 60 * 60 * 1000);

  const [
    scoreDistribution,
    subjectPerformance,
    dailyActivity,
    gradeComparison,
    platformStats,
  ] = await Promise.all([
    Score.aggregate([
      {
        $bucket: {
          groupBy: "$percentage",
          boundaries: [0, 20, 40, 60, 70, 80, 90, 100],
          default: "100",
          output: { count: { $sum: 1 } },
        },
      },
    ]),
    Score.aggregate([
      {
        $group: {
          _id: "$subject",
          avgScore: { $avg: "$percentage" },
          totalAttempts: { $sum: 1 },
          perfectScores: { $sum: { $cond: ["$isPerfectScore", 1, 0] } },
          passRate: {
            $avg: { $cond: ["$isPassingScore", 1, 0] },
          },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
          passRate: { $round: [{ $multiply: ["$passRate", 100] }, 1] },
        },
      },
      { $sort: { avgScore: -1 } },
    ]),
    Score.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
            day: { $dayOfMonth: "$createdAt" },
          },
          count: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          date: { $first: "$createdAt" },
        },
      },
      { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
      { $sort: { date: 1 } },
    ]),
    User.aggregate([
      { $match: { totalQuizzesTaken: { $gt: 0 } } },
      {
        $group: {
          _id: "$grade",
          avgScore: { $avg: "$averageScore" },
          totalStudents: { $sum: 1 },
          avgQuizzes: { $avg: "$totalQuizzesTaken" },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
          avgQuizzes: { $round: ["$avgQuizzes", 1] },
        },
      },
    ]),
    Score.getPlatformStats(),
  ]);

  return successResponse(res, "Score analytics retrieved successfully", {
    distribution: scoreDistribution,
    bySubject: subjectPerformance,
    dailyActivity,
    gradeComparison,
    platform: platformStats[0] || {},
    days: daysInt,
  });
});

exports.getAIAnalytics = catchAsync(async (req, res) => {
  const [
    platformStats,
    bySubject,
    byType,
    topTeachers,
    monthlyUsage,
    costAnalysis,
  ] = await Promise.all([
    AIGenerationLog.getPlatformStats(),
    AIGenerationLog.getStatsBySubject(),
    AIGenerationLog.getStatsByType(),
    AIGenerationLog.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: "$requestedBy",
          totalGenerations: { $sum: 1 },
          totalQuestions: { $sum: "$questionsGenerated" },
          totalCost: { $sum: "$estimatedCost" },
        },
      },
      { $sort: { totalGenerations: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "teachers",
          localField: "_id",
          foreignField: "_id",
          as: "teacher",
        },
      },
      { $unwind: "$teacher" },
      {
        $project: {
          name: "$teacher.name",
          email: "$teacher.email",
          subject: "$teacher.subject",
          totalGenerations: 1,
          totalQuestions: 1,
          totalCost: { $round: ["$totalCost", 4] },
        },
      },
    ]),
    AIGenerationLog.getMonthlyStats(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
    ),
    AIGenerationLog.aggregate([
      { $match: { status: "success" } },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalCost: { $sum: "$estimatedCost" },
          totalTokens: { $sum: "$totalTokens" },
          totalGenerations: { $sum: 1 },
          date: { $first: "$createdAt" },
        },
      },
      {
        $addFields: {
          totalCost: { $round: ["$totalCost", 4] },
        },
      },
      { $sort: { date: 1 } },
      { $limit: 12 },
    ]),
  ]);

  return successResponse(res, "AI analytics retrieved successfully", {
    platform: platformStats[0] || {
      totalGenerations: 0,
      successfulGenerations: 0,
      failedGenerations: 0,
      successRate: 0,
      totalTokens: 0,
      totalCost: 0,
      totalQuestionsGenerated: 0,
      avgResponseTime: 0,
    },
    bySubject,
    byType,
    topTeachers,
    monthlyUsage,
    costAnalysis,
  });
});

exports.getPlatformGrowth = catchAsync(async (req, res) => {
  const { months = 6 } = req.query;
  const monthsInt = Math.min(parseInt(months) || 6, 24);
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - monthsInt);

  const [studentGrowth, quizGrowth, questionGrowth, aiGrowth] =
    await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            newStudents: { $sum: 1 },
            date: { $first: "$createdAt" },
          },
        },
        { $sort: { date: 1 } },
      ]),
      Score.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalQuizzes: { $sum: 1 },
            avgScore: { $avg: "$percentage" },
            date: { $first: "$createdAt" },
          },
        },
        { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
        { $sort: { date: 1 } },
      ]),
      Question.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              status: "$status",
            },
            count: { $sum: 1 },
            date: { $first: "$createdAt" },
          },
        },
        { $sort: { date: 1 } },
      ]),
      AIGenerationLog.aggregate([
        { $match: { createdAt: { $gte: startDate }, status: "success" } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
            },
            totalGenerations: { $sum: 1 },
            totalQuestions: { $sum: "$questionsGenerated" },
            date: { $first: "$createdAt" },
          },
        },
        { $sort: { date: 1 } },
      ]),
    ]);

  return successResponse(res, "Platform growth retrieved successfully", {
    months: monthsInt,
    studentGrowth,
    quizGrowth,
    questionGrowth,
    aiGrowth,
  });
});
