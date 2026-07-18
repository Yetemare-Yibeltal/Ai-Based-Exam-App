const Score = require("../models/Score");
const User = require("../models/User");
const Notification = require("../models/Notification");
const logger = require("../utils/logger");

const createScore = async (scoreData, userId) => {
  const {
    subject,
    totalQuestions,
    correctAnswers,
    answers,
    timeTaken,
    difficulty,
    sessionId,
    weakTopics,
    strongTopics,
  } = scoreData;

  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  const score = await Score.create({
    userId,
    subject,
    totalQuestions,
    correctAnswers,
    percentage,
    timeTaken: timeTaken || 0,
    difficulty: difficulty || "mixed",
    answers,
    sessionId,
    weakTopics: weakTopics || [],
    strongTopics: strongTopics || [],
  });

  await User.findByIdAndUpdate(userId, {
    $inc: {
      totalQuizzesTaken: 1,
      totalCorrectAnswers: correctAnswers,
      totalQuestionsAnswered: totalQuestions,
    },
  });

  const user = await User.findById(userId);
  if (user) {
    if (percentage > user.bestScore) {
      await User.findByIdAndUpdate(userId, { bestScore: percentage });
    }

    const newAvg = Math.round(
      (user.averageScore * (user.totalQuizzesTaken - 1) + percentage) /
        user.totalQuizzesTaken,
    );

    await User.findByIdAndUpdate(userId, { averageScore: newAvg });
    await user.updateStudyStreak();
  }

  logger.info(
    `Score created — User: ${userId} — Subject: ${subject} — Score: ${percentage}%`,
  );

  return score;
};

const getUserScores = async (userId, options = {}) => {
  const {
    page = 1,
    limit = 20,
    subject,
    difficulty,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;
  const filter = { userId };

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

  const [scores, total] = await Promise.all([
    Score.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select("-answers"),
    Score.countDocuments(filter),
  ]);

  return { scores: scores.map((s) => s.getSummary()), total, page, limit };
};

const getScoreById = async (scoreId, userId) => {
  const score = await Score.findOne({ _id: scoreId, userId }).populate(
    "answers.questionId",
    "questionText options explanation subject topic difficulty year",
  );

  if (!score)
    throw new Error("Score not found or you do not have permission to view it");

  return {
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
  };
};

const getScoresBySubject = async (userId, subject, options = {}) => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];
  if (!validSubjects.includes(subject.toLowerCase())) {
    throw new Error(
      `Invalid subject. Must be one of: ${validSubjects.join(", ")}`,
    );
  }

  const filter = { userId, subject: subject.toLowerCase() };

  const [scores, total] = await Promise.all([
    Score.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-answers"),
    Score.countDocuments(filter),
  ]);

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
      },
    },
  ]);

  return {
    scores: scores.map((s) => s.getSummary()),
    total,
    page,
    limit,
    subjectStats: subjectStats[0] || {},
  };
};

const getScoreProgress = async (userId, subject, days = 30) => {
  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];
  if (!validSubjects.includes(subject.toLowerCase())) {
    throw new Error(
      `Invalid subject. Must be one of: ${validSubjects.join(", ")}`,
    );
  }

  const daysInt = Math.min(Math.max(parseInt(days) || 30, 7), 365);
  const progressData = await Score.getProgressOverTime(
    userId,
    subject.toLowerCase(),
    daysInt,
  );

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

  return {
    subject,
    days: daysInt,
    trend,
    dataPoints: progressData.length,
    progress: progressData.map((d) => ({
      date: d.date,
      avgScore: d.avgScore,
      attempts: d.attempts,
    })),
  };
};

const getUserSubjectStats = async (userId) => {
  return Score.getUserSubjectStats(userId);
};

const getBestScores = async (userId) => {
  return Score.aggregate([
    { $match: { userId: require("mongoose").Types.ObjectId(userId) } },
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
};

const deleteScore = async (scoreId, userId) => {
  const score = await Score.findOne({ _id: scoreId, userId });
  if (!score)
    throw new Error(
      "Score not found or you do not have permission to delete it",
    );

  await Score.findByIdAndDelete(scoreId);

  const remainingStats = await Score.aggregate([
    { $match: { userId: require("mongoose").Types.ObjectId(userId) } },
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
    await User.findByIdAndUpdate(userId, {
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
    await User.findByIdAndUpdate(userId, {
      totalQuizzesTaken: 0,
      totalCorrectAnswers: 0,
      totalQuestionsAnswered: 0,
      bestScore: 0,
      averageScore: 0,
    });
  }

  logger.info(`Score deleted — User: ${userId} — Score: ${scoreId}`);

  return { deleted: true };
};

const getScoreSummary = async (userId) => {
  const [overallStats, recentScores, bestPerSubject, monthlyProgress] =
    await Promise.all([
      Score.aggregate([
        { $match: { userId: require("mongoose").Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalQuizzes: { $sum: 1 },
            avgScore: { $avg: "$percentage" },
            bestScore: { $max: "$percentage" },
            totalCorrect: { $sum: "$correctAnswers" },
            totalQuestions: { $sum: "$totalQuestions" },
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
      Score.getRecentScores(userId, 5),
      Score.aggregate([
        { $match: { userId: require("mongoose").Types.ObjectId(userId) } },
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
            userId: require("mongoose").Types.ObjectId(userId),
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

  return {
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
    bestPerSubject,
    monthlyProgress,
  };
};

const getPlatformStats = async () => {
  return Score.getPlatformStats();
};

module.exports = {
  createScore,
  getUserScores,
  getScoreById,
  getScoresBySubject,
  getScoreProgress,
  getUserSubjectStats,
  getBestScores,
  deleteScore,
  getScoreSummary,
  getPlatformStats,
};
