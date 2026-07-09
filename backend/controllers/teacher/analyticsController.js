const Question = require("../../models/Question");
const Score = require("../../models/Score");
const AIGenerationLog = require("../../models/AIGenerationLog");
const QuestionApproval = require("../../models/QuestionApproval");
const { catchAsync } = require("../../middleware/errorHandler");
const { successResponse } = require("../../utils/apiResponse");

exports.getOverview = catchAsync(async (req, res) => {
  const [questionStats, approvalStats, aiStats, recentActivity] =
    await Promise.all([
      Question.aggregate([
        { $match: { createdBy: req.user._id } },
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
            pending: {
              $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] },
            },
            rejected: {
              $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
            },
            draft: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
            aiGenerated: { $sum: { $cond: ["$isAIGenerated", 1, 0] } },
            totalTimesUsed: { $sum: "$timesUsed" },
            totalCorrect: { $sum: "$timesAnsweredCorrectly" },
            totalAnswered: { $sum: "$timesUsed" },
          },
        },
        {
          $addFields: {
            approvalRate: {
              $cond: [
                { $gt: [{ $add: ["$approved", "$rejected"] }, 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        {
                          $divide: [
                            "$approved",
                            { $add: ["$approved", "$rejected"] },
                          ],
                        },
                        100,
                      ],
                    },
                    1,
                  ],
                },
                0,
              ],
            },
            avgCorrectRate: {
              $cond: [
                { $gt: ["$totalAnswered", 0] },
                {
                  $round: [
                    {
                      $multiply: [
                        { $divide: ["$totalCorrect", "$totalAnswered"] },
                        100,
                      ],
                    },
                    1,
                  ],
                },
                0,
              ],
            },
          },
        },
      ]),
      QuestionApproval.aggregate([
        { $match: { submittedBy: req.user._id } },
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
            avgTimeToReview: { $avg: "$timeToReview" },
          },
        },
      ]),
      AIGenerationLog.aggregate([
        { $match: { requestedBy: req.user._id, status: "success" } },
        {
          $group: {
            _id: null,
            totalGenerations: { $sum: 1 },
            totalQuestions: { $sum: "$questionsGenerated" },
            totalTokens: { $sum: "$totalTokens" },
            totalCost: { $sum: "$estimatedCost" },
            avgResponseTime: { $avg: "$responseTimeMs" },
          },
        },
        {
          $addFields: {
            totalCost: { $round: ["$totalCost", 4] },
            avgResponseTime: { $round: ["$avgResponseTime", 0] },
          },
        },
      ]),
      Question.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .limit(5)
        .select(
          "questionText subject status isAIGenerated timesUsed createdAt",
        ),
    ]);

  const approvalMap = {};
  approvalStats.forEach((s) => {
    approvalMap[s._id] = s;
  });

  return successResponse(res, "Analytics overview retrieved successfully", {
    questions: questionStats[0] || {
      total: 0,
      approved: 0,
      pending: 0,
      rejected: 0,
      draft: 0,
      aiGenerated: 0,
      approvalRate: 0,
      avgCorrectRate: 0,
    },
    approvals: {
      pending: approvalMap.pending?.count || 0,
      approved: approvalMap.approved?.count || 0,
      rejected: approvalMap.rejected?.count || 0,
      avgReviewTime: Math.round(approvalMap.approved?.avgTimeToReview || 0),
    },
    aiUsage: aiStats[0] || {
      totalGenerations: 0,
      totalQuestions: 0,
      totalTokens: 0,
      totalCost: 0,
      avgResponseTime: 0,
    },
    recentActivity,
  });
});

exports.getQuestionPerformance = catchAsync(async (req, res) => {
  const { subject, sortBy = "timesUsed", limit = 20 } = req.query;

  const filter = {
    createdBy: req.user._id,
    status: "approved",
    timesUsed: { $gt: 0 },
  };
  if (subject) filter.subject = subject.toLowerCase();

  const sortOptions = {
    timesUsed: { timesUsed: -1 },
    correctRate: { timesAnsweredCorrectly: -1 },
    difficulty: { difficulty: 1 },
    newest: { createdAt: -1 },
  };

  const questions = await Question.find(filter)
    .sort(sortOptions[sortBy] || { timesUsed: -1 })
    .limit(parseInt(limit) || 20)
    .select(
      "questionText subject difficulty timesUsed timesAnsweredCorrectly timesAnsweredIncorrectly averageTimeToAnswer isAIGenerated createdAt",
    );

  const performance = questions.map((q) => ({
    id: q._id,
    questionText:
      q.questionText.slice(0, 100) + (q.questionText.length > 100 ? "..." : ""),
    subject: q.subject,
    difficulty: q.difficulty,
    timesUsed: q.timesUsed,
    correctRate: q.correctRate,
    avgTimeToAnswer: q.averageTimeToAnswer,
    isAIGenerated: q.isAIGenerated,
    actualDifficulty: q.actualDifficulty,
    createdAt: q.createdAt,
  }));

  const hardestQuestions = [...performance]
    .sort((a, b) => a.correctRate - b.correctRate)
    .slice(0, 5);

  const easiestQuestions = [...performance]
    .sort((a, b) => b.correctRate - a.correctRate)
    .slice(0, 5);

  return successResponse(res, "Question performance retrieved successfully", {
    questions: performance,
    insights: {
      hardestQuestions,
      easiestQuestions,
      totalQuestionsWithData: performance.length,
    },
  });
});

exports.getSubjectAnalytics = catchAsync(async (req, res) => {
  const subjectBreakdown = await Question.aggregate([
    { $match: { createdBy: req.user._id } },
    {
      $group: {
        _id: "$subject",
        total: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
        rejected: { $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] } },
        aiGenerated: { $sum: { $cond: ["$isAIGenerated", 1, 0] } },
        totalTimesUsed: { $sum: "$timesUsed" },
        totalCorrect: { $sum: "$timesAnsweredCorrectly" },
        easyCount: {
          $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] },
        },
        mediumCount: {
          $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] },
        },
        hardCount: {
          $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] },
        },
      },
    },
    {
      $addFields: {
        approvalRate: {
          $cond: [
            { $gt: [{ $add: ["$approved", "$rejected"] }, 0] },
            {
              $round: [
                {
                  $multiply: [
                    {
                      $divide: [
                        "$approved",
                        { $add: ["$approved", "$rejected"] },
                      ],
                    },
                    100,
                  ],
                },
                1,
              ],
            },
            0,
          ],
        },
        avgCorrectRate: {
          $cond: [
            { $gt: ["$totalTimesUsed", 0] },
            {
              $round: [
                {
                  $multiply: [
                    { $divide: ["$totalCorrect", "$totalTimesUsed"] },
                    100,
                  ],
                },
                1,
              ],
            },
            0,
          ],
        },
      },
    },
    { $sort: { total: -1 } },
  ]);

  const monthlyCreation = await Question.aggregate([
    {
      $match: {
        createdBy: req.user._id,
        createdAt: {
          $gte: new Date(new Date().setMonth(new Date().getMonth() - 6)),
        },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          subject: "$subject",
        },
        count: { $sum: 1 },
        date: { $first: "$createdAt" },
      },
    },
    { $sort: { date: 1 } },
  ]);

  return successResponse(res, "Subject analytics retrieved successfully", {
    subjectBreakdown,
    monthlyCreation,
  });
});

exports.getStudentResults = catchAsync(async (req, res) => {
  const { subject, limit = 20 } = req.query;

  const myApprovedQuestionIds = await Question.find({
    createdBy: req.user._id,
    status: "approved",
    ...(subject && { subject: subject.toLowerCase() }),
  }).distinct("_id");

  if (myApprovedQuestionIds.length === 0) {
    return successResponse(res, "No approved questions yet", {
      overview: { totalAttempts: 0, avgScore: 0, totalStudents: 0 },
      subjectPerformance: [],
      recentResults: [],
    });
  }

  const [overview, subjectPerformance, recentResults] = await Promise.all([
    Score.aggregate([
      { $unwind: "$answers" },
      { $match: { "answers.questionId": { $in: myApprovedQuestionIds } } },
      {
        $group: {
          _id: "$userId",
          avgScore: { $avg: "$percentage" },
          totalAttempts: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: null,
          totalStudents: { $sum: 1 },
          avgScore: { $avg: "$avgScore" },
          totalAttempts: { $sum: "$totalAttempts" },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
        },
      },
    ]),
    Score.aggregate([
      { $match: { subject: subject?.toLowerCase() || { $exists: true } } },
      { $unwind: "$answers" },
      { $match: { "answers.questionId": { $in: myApprovedQuestionIds } } },
      {
        $group: {
          _id: "$subject",
          avgScore: { $avg: "$percentage" },
          totalAttempts: { $sum: 1 },
          totalCorrect: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
        },
      },
      { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
      { $sort: { totalAttempts: -1 } },
    ]),
    Score.find({
      "answers.questionId": { $in: myApprovedQuestionIds },
    })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) || 20)
      .select("userId subject percentage grade timeTaken createdAt")
      .populate("userId", "name avatar grade school"),
  ]);

  return successResponse(res, "Student results retrieved successfully", {
    overview: overview[0] || {
      totalStudents: 0,
      avgScore: 0,
      totalAttempts: 0,
    },
    subjectPerformance,
    recentResults: recentResults.map((r) => ({
      studentName: r.userId?.name || "Unknown",
      studentAvatar: r.userId?.avatar || null,
      studentGrade: r.userId?.grade || null,
      subject: r.subject,
      score: r.percentage,
      grade: r.grade,
      timeTaken: r.timeTaken,
      date: r.createdAt,
    })),
  });
});

exports.getAIGenerationAnalytics = catchAsync(async (req, res) => {
  const [overview, bySubject, byType, monthly] = await Promise.all([
    AIGenerationLog.getTeacherStats(req.userId),
    AIGenerationLog.getStatsBySubject(),
    AIGenerationLog.getStatsByType(),
    AIGenerationLog.getMonthlyStats(
      new Date().getFullYear(),
      new Date().getMonth() + 1,
    ),
  ]);

  const recentLogs = await AIGenerationLog.find({ requestedBy: req.userId })
    .sort({ createdAt: -1 })
    .limit(10)
    .select(
      "type subject difficulty questionsGenerated questionsApproved status responseTimeMs estimatedCost createdAt",
    );

  return successResponse(
    res,
    "AI generation analytics retrieved successfully",
    {
      overview: overview[0] || {
        totalGenerations: 0,
        totalTokens: 0,
        totalCost: 0,
        totalQuestionsGenerated: 0,
        avgResponseTime: 0,
      },
      bySubject,
      byType,
      monthly,
      recentLogs,
    },
  );
});
