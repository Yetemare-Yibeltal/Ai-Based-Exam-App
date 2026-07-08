const Score = require("../../models/Score");
const User = require("../../models/User");
const { catchAsync } = require("../../middleware/errorHandler");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const mongoose = require("mongoose");

exports.getGlobalLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const leaderboard = await Score.aggregate([
    {
      $group: {
        _id: "$userId",
        avgScore: { $avg: "$percentage" },
        bestScore: { $max: "$percentage" },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: "$correctAnswers" },
        totalQuestions: { $sum: "$totalQuestions" },
      },
    },
    {
      $addFields: {
        avgScore: { $round: ["$avgScore", 1] },
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
    { $sort: { avgScore: -1, totalAttempts: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        avatar: "$user.avatar",
        grade: "$user.grade",
        school: "$user.school",
        avgScore: 1,
        bestScore: 1,
        totalAttempts: 1,
        accuracy: 1,
        studyStreak: "$user.studyStreak",
      },
    },
  ]);

  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
    isCurrentUser: entry._id?.toString() === req.userId?.toString(),
  }));

  return successResponse(res, "Global leaderboard retrieved successfully", {
    leaderboard: rankedLeaderboard,
    total: rankedLeaderboard.length,
  });
});

exports.getSubjectLeaderboard = catchAsync(async (req, res) => {
  const { subject } = req.params;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

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

  const leaderboard = await Score.aggregate([
    { $match: { subject: subject.toLowerCase() } },
    {
      $group: {
        _id: "$userId",
        avgScore: { $avg: "$percentage" },
        bestScore: { $max: "$percentage" },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: "$correctAnswers" },
        totalQuestions: { $sum: "$totalQuestions" },
      },
    },
    {
      $addFields: {
        avgScore: { $round: ["$avgScore", 1] },
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
    { $sort: { avgScore: -1, totalAttempts: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        avatar: "$user.avatar",
        grade: "$user.grade",
        school: "$user.school",
        avgScore: 1,
        bestScore: 1,
        totalAttempts: 1,
        accuracy: 1,
      },
    },
  ]);

  const rankedLeaderboard = leaderboard.map((entry, index) => ({
    rank: index + 1,
    ...entry,
    isCurrentUser: entry._id?.toString() === req.userId?.toString(),
  }));

  return successResponse(res, `${subject} leaderboard retrieved successfully`, {
    subject,
    leaderboard: rankedLeaderboard,
    total: rankedLeaderboard.length,
  });
});

exports.getMyRank = catchAsync(async (req, res) => {
  const allUsers = await Score.aggregate([
    {
      $group: {
        _id: "$userId",
        avgScore: { $avg: "$percentage" },
        totalAttempts: { $sum: 1 },
      },
    },
    { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
    { $sort: { avgScore: -1, totalAttempts: -1 } },
  ]);

  const myRankIndex = allUsers.findIndex(
    (u) => u._id?.toString() === req.userId?.toString(),
  );

  if (myRankIndex === -1) {
    return successResponse(res, "Complete at least one quiz to get your rank", {
      rank: null,
      totalStudents: allUsers.length,
      hasRank: false,
    });
  }

  const myStats = allUsers[myRankIndex];
  const topPercentile = Math.round(((myRankIndex + 1) / allUsers.length) * 100);

  const subjectRanks = await Promise.all(
    ["math", "english", "biology", "chemistry", "physics", "civics"].map(
      async (subject) => {
        const subjectUsers = await Score.aggregate([
          { $match: { subject } },
          {
            $group: {
              _id: "$userId",
              avgScore: { $avg: "$percentage" },
            },
          },
          { $sort: { avgScore: -1 } },
        ]);

        const subjectRankIndex = subjectUsers.findIndex(
          (u) => u._id?.toString() === req.userId?.toString(),
        );

        return {
          subject,
          rank: subjectRankIndex !== -1 ? subjectRankIndex + 1 : null,
          totalStudents: subjectUsers.length,
          avgScore:
            subjectRankIndex !== -1
              ? Math.round(subjectUsers[subjectRankIndex].avgScore)
              : null,
        };
      },
    ),
  );

  return successResponse(res, "Your rank retrieved successfully", {
    globalRank: {
      rank: myRankIndex + 1,
      totalStudents: allUsers.length,
      avgScore: myStats.avgScore,
      totalAttempts: myStats.totalAttempts,
      topPercentile,
      hasRank: true,
    },
    subjectRanks,
  });
});

exports.getTopStudents = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 20);

  const topStudents = await User.getLeaderboard(limit);

  return successResponse(res, "Top students retrieved successfully", {
    topStudents: topStudents.map((student, index) => ({
      rank: index + 1,
      id: student._id,
      name: student.name,
      avatar:
        student.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1B3A6B&color=ffffff`,
      grade: student.grade,
      school: student.school,
      averageScore: student.averageScore,
      bestScore: student.bestScore,
      totalQuizzesTaken: student.totalQuizzesTaken,
      studyStreak: student.studyStreak,
      isCurrentUser: student._id?.toString() === req.userId?.toString(),
    })),
  });
});

exports.getWeeklyLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const leaderboard = await Score.aggregate([
    { $match: { createdAt: { $gte: startOfWeek } } },
    {
      $group: {
        _id: "$userId",
        avgScore: { $avg: "$percentage" },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: "$correctAnswers" },
        totalQuestions: { $sum: "$totalQuestions" },
      },
    },
    { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
    { $sort: { avgScore: -1, totalAttempts: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        avatar: "$user.avatar",
        grade: "$user.grade",
        avgScore: 1,
        totalAttempts: 1,
      },
    },
  ]);

  return successResponse(res, "Weekly leaderboard retrieved successfully", {
    week: {
      start: startOfWeek,
      end: new Date(),
    },
    leaderboard: leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
      isCurrentUser: entry._id?.toString() === req.userId?.toString(),
    })),
  });
});

exports.getMonthlyLeaderboard = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const leaderboard = await Score.aggregate([
    { $match: { createdAt: { $gte: startOfMonth } } },
    {
      $group: {
        _id: "$userId",
        avgScore: { $avg: "$percentage" },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: "$correctAnswers" },
        totalQuestions: { $sum: "$totalQuestions" },
      },
    },
    { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
    { $sort: { avgScore: -1, totalAttempts: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        avatar: "$user.avatar",
        grade: "$user.grade",
        avgScore: 1,
        totalAttempts: 1,
      },
    },
  ]);

  return successResponse(res, "Monthly leaderboard retrieved successfully", {
    month: {
      start: startOfMonth,
      end: new Date(),
      name: startOfMonth.toLocaleString("default", {
        month: "long",
        year: "numeric",
      }),
    },
    leaderboard: leaderboard.map((entry, index) => ({
      rank: index + 1,
      ...entry,
      isCurrentUser: entry._id?.toString() === req.userId?.toString(),
    })),
  });
});

exports.getLeaderboardByGrade = catchAsync(async (req, res) => {
  const { grade = "Grade 12" } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  if (!["Grade 11", "Grade 12"].includes(grade)) {
    return errorResponse(res, "Grade must be Grade 11 or Grade 12", 400);
  }

  const students = await User.find({
    grade,
    isActive: true,
    isBanned: false,
    totalQuizzesTaken: { $gt: 0 },
  })
    .sort({ averageScore: -1, totalQuizzesTaken: -1 })
    .limit(limit)
    .select(
      "name avatar grade school averageScore bestScore totalQuizzesTaken studyStreak",
    );

  return successResponse(res, `${grade} leaderboard retrieved successfully`, {
    grade,
    leaderboard: students.map((student, index) => ({
      rank: index + 1,
      id: student._id,
      name: student.name,
      avatar:
        student.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1B3A6B&color=ffffff`,
      school: student.school,
      averageScore: student.averageScore,
      bestScore: student.bestScore,
      totalQuizzesTaken: student.totalQuizzesTaken,
      studyStreak: student.studyStreak,
      isCurrentUser: student._id?.toString() === req.userId?.toString(),
    })),
  });
});

exports.getLeaderboardBySchool = catchAsync(async (req, res) => {
  const { school } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  if (!school) {
    return errorResponse(res, "School name is required", 400);
  }

  const students = await User.find({
    school: { $regex: school, $options: "i" },
    isActive: true,
    isBanned: false,
    totalQuizzesTaken: { $gt: 0 },
  })
    .sort({ averageScore: -1, totalQuizzesTaken: -1 })
    .limit(limit)
    .select(
      "name avatar grade school averageScore bestScore totalQuizzesTaken studyStreak",
    );

  return successResponse(res, "School leaderboard retrieved successfully", {
    school,
    leaderboard: students.map((student, index) => ({
      rank: index + 1,
      id: student._id,
      name: student.name,
      avatar:
        student.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=1B3A6B&color=ffffff`,
      grade: student.grade,
      averageScore: student.averageScore,
      bestScore: student.bestScore,
      totalQuizzesTaken: student.totalQuizzesTaken,
      studyStreak: student.studyStreak,
      isCurrentUser: student._id?.toString() === req.userId?.toString(),
    })),
  });
});
