const User = require("../../models/User");
const Teacher = require("../../models/Teacher");
const Question = require("../../models/Question");
const Score = require("../../models/Score");
const AIGenerationLog = require("../../models/AIGenerationLog");
const { catchAsync } = require("../../middleware/errorHandler");
const { successResponse } = require("../../utils/apiResponse");
const logger = require("../../utils/logger");

exports.getStudentReport = catchAsync(async (req, res) => {
  const { startDate, endDate, grade, school } = req.query;

  const userFilter = { isActive: true };
  if (grade) userFilter.grade = grade;
  if (school) userFilter.school = { $regex: school, $options: "i" };
  if (startDate || endDate) {
    userFilter.createdAt = {};
    if (startDate) userFilter.createdAt.$gte = new Date(startDate);
    if (endDate) userFilter.createdAt.$lte = new Date(endDate);
  }

  const [
    studentSummary,
    gradeBreakdown,
    topPerformers,
    schoolBreakdown,
    registrationTrend,
    activityStats,
  ] = await Promise.all([
    User.aggregate([
      { $match: userFilter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          verified: { $sum: { $cond: ["$isEmailVerified", 1, 0] } },
          banned: { $sum: { $cond: ["$isBanned", 1, 0] } },
          avgScore: { $avg: "$averageScore" },
          avgQuizzes: { $avg: "$totalQuizzesTaken" },
          totalQuizzes: { $sum: "$totalQuizzesTaken" },
          totalCorrect: { $sum: "$totalCorrectAnswers" },
          avgStreak: { $avg: "$studyStreak" },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
          avgQuizzes: { $round: ["$avgQuizzes", 1] },
          avgStreak: { $round: ["$avgStreak", 1] },
        },
      },
    ]),
    User.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: "$grade",
          count: { $sum: 1 },
          avgScore: { $avg: "$averageScore" },
          avgQuizzes: { $avg: "$totalQuizzesTaken" },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
          avgQuizzes: { $round: ["$avgQuizzes", 1] },
        },
      },
      { $sort: { count: -1 } },
    ]),
    User.find({ isActive: true, totalQuizzesTaken: { $gt: 0 } })
      .sort({ averageScore: -1, totalQuizzesTaken: -1 })
      .limit(20)
      .select(
        "name email grade school averageScore bestScore totalQuizzesTaken studyStreak createdAt",
      ),
    User.aggregate([
      { $match: { isActive: true, school: { $ne: "Not specified" } } },
      {
        $group: {
          _id: "$school",
          count: { $sum: 1 },
          avgScore: { $avg: "$averageScore" },
        },
      },
      { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
      { $sort: { count: -1 } },
      { $limit: 20 },
    ]),
    User.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { date: 1 } },
      { $limit: 12 },
    ]),
    Score.aggregate([
      {
        $group: {
          _id: "$subject",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          uniqueStudents: { $addToSet: "$userId" },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
          uniqueStudents: { $size: "$uniqueStudents" },
        },
      },
      { $sort: { totalAttempts: -1 } },
    ]),
  ]);

  logger.info(`Student report generated — Admin: ${req.userId}`);

  return successResponse(res, "Student report generated successfully", {
    generatedAt: new Date(),
    filters: { startDate, endDate, grade, school },
    summary: studentSummary[0] || {},
    gradeBreakdown,
    topPerformers: topPerformers.map((s) => ({
      name: s.name,
      email: s.email,
      grade: s.grade,
      school: s.school,
      averageScore: s.averageScore,
      bestScore: s.bestScore,
      totalQuizzes: s.totalQuizzesTaken,
      studyStreak: s.studyStreak,
      joinedAt: s.createdAt,
    })),
    schoolBreakdown,
    registrationTrend,
    subjectActivity: activityStats,
  });
});

exports.getQuestionReport = catchAsync(async (req, res) => {
  const { startDate, endDate, subject, status } = req.query;

  const filter = {};
  if (subject) filter.subject = subject.toLowerCase();
  if (status) filter.status = status;
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [
    summary,
    bySubject,
    byDifficulty,
    byCreator,
    aiVsManual,
    topQuestions,
    creationTrend,
  ] = await Promise.all([
    Question.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          pending: { $sum: { $cond: [{ $eq: ["$status", "pending"] }, 1, 0] } },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "rejected"] }, 1, 0] },
          },
          aiGenerated: { $sum: { $cond: ["$isAIGenerated", 1, 0] } },
          totalTimesUsed: { $sum: "$timesUsed" },
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
      { $addFields: { avgCorrectRate: { $round: ["$avgCorrectRate", 1] } } },
    ]),
    Question.getSubjectStats(),
    Question.aggregate([
      { $match: { status: "approved" } },
      {
        $group: {
          _id: "$difficulty",
          count: { $sum: 1 },
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
      { $addFields: { avgCorrectRate: { $round: ["$avgCorrectRate", 1] } } },
    ]),
    Question.aggregate([
      {
        $group: {
          _id: { createdBy: "$createdBy", model: "$createdByModel" },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "teachers",
          localField: "_id.createdBy",
          foreignField: "_id",
          as: "teacher",
        },
      },
      {
        $project: {
          name: { $arrayElemAt: ["$teacher.name", 0] },
          email: { $arrayElemAt: ["$teacher.email", 0] },
          subject: { $arrayElemAt: ["$teacher.subject", 0] },
          count: 1,
          approved: 1,
          approvalRate: {
            $cond: [
              { $gt: ["$count", 0] },
              {
                $round: [
                  { $multiply: [{ $divide: ["$approved", "$count"] }, 100] },
                  1,
                ],
              },
              0,
            ],
          },
        },
      },
    ]),
    Question.aggregate([
      {
        $group: {
          _id: "$isAIGenerated",
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          timesUsed: { $sum: "$timesUsed" },
        },
      },
    ]),
    Question.find({ status: "approved", timesUsed: { $gt: 0 } })
      .sort({ timesUsed: -1 })
      .limit(10)
      .select(
        "questionText subject difficulty timesUsed timesAnsweredCorrectly isAIGenerated",
      ),
    Question.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
          },
          date: { $first: "$createdAt" },
        },
      },
      { $sort: { date: 1 } },
      { $limit: 12 },
    ]),
  ]);

  logger.info(`Question report generated — Admin: ${req.userId}`);

  return successResponse(res, "Question report generated successfully", {
    generatedAt: new Date(),
    filters: { startDate, endDate, subject, status },
    summary: summary[0] || {},
    bySubject,
    byDifficulty,
    byCreator,
    aiVsManual,
    topQuestions: topQuestions.map((q) => ({
      questionText: q.questionText.slice(0, 100) + "...",
      subject: q.subject,
      difficulty: q.difficulty,
      timesUsed: q.timesUsed,
      correctRate:
        q.timesUsed > 0
          ? Math.round((q.timesAnsweredCorrectly / q.timesUsed) * 100)
          : 0,
      isAIGenerated: q.isAIGenerated,
    })),
    creationTrend,
  });
});

exports.getPerformanceReport = catchAsync(async (req, res) => {
  const { startDate, endDate, subject, grade } = req.query;

  const scoreFilter = {};
  if (subject) scoreFilter.subject = subject.toLowerCase();
  if (startDate || endDate) {
    scoreFilter.createdAt = {};
    if (startDate) scoreFilter.createdAt.$gte = new Date(startDate);
    if (endDate) scoreFilter.createdAt.$lte = new Date(endDate);
  }

  const [
    overallStats,
    subjectPerformance,
    scoreDistribution,
    gradePerformance,
    dailyActivity,
    topStudents,
  ] = await Promise.all([
    Score.aggregate([
      { $match: scoreFilter },
      {
        $group: {
          _id: null,
          totalQuizzes: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          perfectScores: { $sum: { $cond: ["$isPerfectScore", 1, 0] } },
          passedQuizzes: { $sum: { $cond: ["$isPassingScore", 1, 0] } },
          totalCorrect: { $sum: "$correctAnswers" },
          totalQuestions: { $sum: "$totalQuestions" },
          avgTimeTaken: { $avg: "$timeTaken" },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
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
          avgTimeTaken: { $round: ["$avgTimeTaken", 0] },
        },
      },
    ]),
    Score.aggregate([
      { $match: scoreFilter },
      {
        $group: {
          _id: "$subject",
          totalAttempts: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          bestScore: { $max: "$percentage" },
          lowestScore: { $min: "$percentage" },
          perfectScores: { $sum: { $cond: ["$isPerfectScore", 1, 0] } },
          passRate: { $avg: { $cond: ["$isPassingScore", 1, 0] } },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
          passRate: { $round: [{ $multiply: ["$passRate", 100] }, 1] },
        },
      },
      { $sort: { totalAttempts: -1 } },
    ]),
    Score.aggregate([
      { $match: scoreFilter },
      {
        $bucket: {
          groupBy: "$percentage",
          boundaries: [0, 20, 40, 50, 60, 70, 80, 90, 100],
          default: "100",
          output: {
            count: { $sum: 1 },
            avgTime: { $avg: "$timeTaken" },
          },
        },
      },
    ]),
    User.aggregate([
      { $match: { totalQuizzesTaken: { $gt: 0 }, ...(grade && { grade }) } },
      {
        $group: {
          _id: "$grade",
          studentCount: { $sum: 1 },
          avgScore: { $avg: "$averageScore" },
          avgQuizzes: { $avg: "$totalQuizzesTaken" },
          topScore: { $max: "$bestScore" },
        },
      },
      {
        $addFields: {
          avgScore: { $round: ["$avgScore", 1] },
          avgQuizzes: { $round: ["$avgQuizzes", 1] },
        },
      },
    ]),
    Score.aggregate([
      {
        $match: {
          ...scoreFilter,
          createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: { $dayOfMonth: "$createdAt" },
          count: { $sum: 1 },
          avgScore: { $avg: "$percentage" },
          date: { $first: "$createdAt" },
        },
      },
      { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
      { $sort: { date: 1 } },
    ]),
    User.find({ isActive: true, totalQuizzesTaken: { $gt: 5 } })
      .sort({ averageScore: -1 })
      .limit(20)
      .select(
        "name grade school averageScore bestScore totalQuizzesTaken studyStreak",
      ),
  ]);

  logger.info(`Performance report generated — Admin: ${req.userId}`);

  return successResponse(res, "Performance report generated successfully", {
    generatedAt: new Date(),
    filters: { startDate, endDate, subject, grade },
    overall: overallStats[0] || {},
    bySubject: subjectPerformance,
    scoreDistribution,
    byGrade: gradePerformance,
    dailyActivity,
    topStudents,
  });
});

exports.getAIReport = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;

  const filter = { status: "success" };
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [
    platformStats,
    bySubject,
    byType,
    topTeachers,
    monthlyTrend,
    costBreakdown,
  ] = await Promise.all([
    AIGenerationLog.getPlatformStats(),
    AIGenerationLog.getStatsBySubject(),
    AIGenerationLog.getStatsByType(),
    AIGenerationLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$requestedBy",
          totalGenerations: { $sum: 1 },
          totalQuestions: { $sum: "$questionsGenerated" },
          totalCost: { $sum: "$estimatedCost" },
          totalTokens: { $sum: "$totalTokens" },
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
          totalTokens: 1,
        },
      },
    ]),
    AIGenerationLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          totalGenerations: { $sum: 1 },
          totalQuestions: { $sum: "$questionsGenerated" },
          totalCost: { $sum: "$estimatedCost" },
          totalTokens: { $sum: "$totalTokens" },
          date: { $first: "$createdAt" },
        },
      },
      { $addFields: { totalCost: { $round: ["$totalCost", 4] } } },
      { $sort: { date: 1 } },
      { $limit: 12 },
    ]),
    AIGenerationLog.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$subject",
          totalCost: { $sum: "$estimatedCost" },
          totalTokens: { $sum: "$totalTokens" },
          totalGenerations: { $sum: 1 },
        },
      },
      { $addFields: { totalCost: { $round: ["$totalCost", 4] } } },
      { $sort: { totalCost: -1 } },
    ]),
  ]);

  logger.info(`AI report generated — Admin: ${req.userId}`);

  return successResponse(res, "AI report generated successfully", {
    generatedAt: new Date(),
    filters: { startDate, endDate },
    platform: platformStats[0] || {},
    bySubject,
    byType,
    topTeachers,
    monthlyTrend,
    costBreakdown,
  });
});

exports.exportStudentsCsv = catchAsync(async (req, res) => {
  const { grade, school, minScore, maxScore } = req.query;

  const filter = { isActive: true };
  if (grade) filter.grade = grade;
  if (school) filter.school = { $regex: school, $options: "i" };
  if (minScore || maxScore) {
    filter.averageScore = {};
    if (minScore) filter.averageScore.$gte = parseInt(minScore);
    if (maxScore) filter.averageScore.$lte = parseInt(maxScore);
  }

  const students = await User.find(filter)
    .select(
      "name email grade school averageScore bestScore totalQuizzesTaken studyStreak isEmailVerified createdAt lastLoginAt",
    )
    .sort({ averageScore: -1 })
    .limit(10000);

  const csvHeaders = [
    "Name",
    "Email",
    "Grade",
    "School",
    "Avg Score",
    "Best Score",
    "Total Quizzes",
    "Study Streak",
    "Email Verified",
    "Joined",
    "Last Login",
  ].join(",");

  const csvRows = students.map((s) =>
    [
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.grade}"`,
      `"${s.school}"`,
      s.averageScore,
      s.bestScore,
      s.totalQuizzesTaken,
      s.studyStreak,
      s.isEmailVerified,
      s.createdAt?.toISOString().split("T")[0] || "",
      s.lastLoginAt?.toISOString().split("T")[0] || "",
    ].join(","),
  );

  const csv = [csvHeaders, ...csvRows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="heroy_students_${Date.now()}.csv"`,
  );

  logger.info(
    `Students CSV exported — Admin: ${req.userId} — Count: ${students.length}`,
  );

  return res.send(csv);
});

exports.exportQuestionsCsv = catchAsync(async (req, res) => {
  const { subject, status, difficulty } = req.query;

  const filter = {};
  if (subject) filter.subject = subject.toLowerCase();
  if (status) filter.status = status;
  if (difficulty) filter.difficulty = difficulty;

  const questions = await Question.find(filter)
    .populate("createdBy", "name email")
    .select(
      "questionText options correctAnswer subject difficulty status isAIGenerated timesUsed timesAnsweredCorrectly explanation year grade createdAt",
    )
    .sort({ createdAt: -1 })
    .limit(10000);

  const csvHeaders = [
    "Question",
    "Option A",
    "Option B",
    "Option C",
    "Option D",
    "Correct Answer",
    "Subject",
    "Difficulty",
    "Grade",
    "Year",
    "Status",
    "AI Generated",
    "Times Used",
    "Correct Rate",
    "Created By",
    "Created At",
  ].join(",");

  const csvRows = questions.map((q) => {
    const correctRate =
      q.timesUsed > 0
        ? Math.round((q.timesAnsweredCorrectly / q.timesUsed) * 100)
        : 0;

    return [
      `"${q.questionText.replace(/"/g, '""')}"`,
      `"${(q.options[0] || "").replace(/"/g, '""')}"`,
      `"${(q.options[1] || "").replace(/"/g, '""')}"`,
      `"${(q.options[2] || "").replace(/"/g, '""')}"`,
      `"${(q.options[3] || "").replace(/"/g, '""')}"`,
      ["A", "B", "C", "D"][q.correctAnswer] || "",
      q.subject,
      q.difficulty,
      q.grade,
      q.year || "",
      q.status,
      q.isAIGenerated,
      q.timesUsed,
      `${correctRate}%`,
      `"${q.createdBy?.name || "Unknown"}"`,
      q.createdAt?.toISOString().split("T")[0] || "",
    ].join(",");
  });

  const csv = [csvHeaders, ...csvRows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="heroy_questions_${Date.now()}.csv"`,
  );

  logger.info(
    `Questions CSV exported — Admin: ${req.userId} — Count: ${questions.length}`,
  );

  return res.send(csv);
});
