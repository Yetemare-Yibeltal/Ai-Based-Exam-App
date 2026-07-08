const User = require("../../models/User");
const Score = require("../../models/Score");
const Notification = require("../../models/Notification");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");
const { uploadImage, deleteImage } = require("../../config/cloudinary");
const { getFileInfo } = require("../../middleware/upload");
const { generateWithAI } = require("../../config/anthropic");
const logger = require("../../utils/logger");

// ── GET PROFILE ────────────────────────────────────────────

// @desc    Get student full profile with stats
// @route   GET /api/student/profile
// @access  Private - Student
exports.getProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return notFoundResponse(res, "Student profile not found");
  }

  // Get subject statistics
  const subjectStats = await Score.getUserSubjectStats(req.user._id);

  // Get recent scores
  const recentScores = await Score.getRecentScores(req.user._id, 5);

  // Get best scores per subject
  const bestScores = await Score.aggregate([
    { $match: { userId: req.user._id } },
    { $sort: { percentage: -1 } },
    {
      $group: {
        _id: "$subject",
        bestScore: { $first: "$percentage" },
        bestGrade: { $first: "$grade" },
        achievedAt: { $first: "$createdAt" },
      },
    },
    { $sort: { bestScore: -1 } },
  ]);

  return successResponse(res, "Profile retrieved successfully", {
    profile: user.getPublicProfile(),
    stats: {
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
      lastStudyDate: user.lastStudyDate,
      favoriteSubject: user.favoriteSubject,
      weakSubjects: user.weakSubjects,
    },
    subjectStats,
    recentScores: recentScores.map((s) => s.getSummary()),
    bestScores,
  });
});

// ── UPDATE PROFILE ─────────────────────────────────────────

// @desc    Update student profile
// @route   PUT /api/student/profile
// @access  Private - Student
exports.updateProfile = catchAsync(async (req, res, next) => {
  const {
    name,
    school,
    grade,
    phone,
    bio,
    preferredLanguage,
    notificationsEnabled,
    emailNotificationsEnabled,
  } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  // Update allowed fields
  if (name !== undefined) user.name = name;
  if (school !== undefined) user.school = school;
  if (grade !== undefined) user.grade = grade;
  if (phone !== undefined) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (preferredLanguage !== undefined)
    user.preferredLanguage = preferredLanguage;
  if (notificationsEnabled !== undefined)
    user.notificationsEnabled = notificationsEnabled;
  if (emailNotificationsEnabled !== undefined)
    user.emailNotificationsEnabled = emailNotificationsEnabled;

  await user.save({ validateBeforeSave: false });

  logger.info(`Student profile updated — User: ${req.userId}`);

  return successResponse(res, "Profile updated successfully", {
    profile: user.getPublicProfile(),
  });
});

// ── UPLOAD AVATAR ──────────────────────────────────────────

// @desc    Upload student avatar
// @route   POST /api/student/profile/avatar
// @access  Private - Student
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return errorResponse(res, "Please select an image file to upload", 400);
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  // Delete old avatar if exists
  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId);
  }

  // Upload new avatar to Cloudinary
  const fileInfo = getFileInfo(req.file);
  const base64Image = `data:${fileInfo.mimeType};base64,${fileInfo.buffer.toString(
    "base64",
  )}`;

  const uploadResult = await uploadImage(base64Image, "heroy/avatars/students");

  if (!uploadResult.success) {
    return errorResponse(res, "Failed to upload image. Please try again", 500);
  }

  // Update user avatar
  user.avatar = uploadResult.url;
  user.avatarPublicId = uploadResult.publicId;
  await user.save({ validateBeforeSave: false });

  logger.info(`Student avatar uploaded — User: ${req.userId}`);

  return successResponse(res, "Avatar uploaded successfully", {
    avatar: uploadResult.url,
    profile: user.getPublicProfile(),
  });
});

// ── DELETE AVATAR ──────────────────────────────────────────

// @desc    Delete student avatar
// @route   DELETE /api/student/profile/avatar
// @access  Private - Student
exports.deleteAvatar = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  if (!user.avatar || !user.avatarPublicId) {
    return errorResponse(res, "No avatar to delete", 400);
  }

  // Delete from Cloudinary
  const deleteResult = await deleteImage(user.avatarPublicId);

  if (!deleteResult.success) {
    logger.warn(
      `Failed to delete avatar from Cloudinary — User: ${req.userId}`,
    );
  }

  // Remove avatar from user
  user.avatar = null;
  user.avatarPublicId = null;
  await user.save({ validateBeforeSave: false });

  logger.info(`Student avatar deleted — User: ${req.userId}`);

  return successResponse(res, "Avatar deleted successfully", {
    profile: user.getPublicProfile(),
  });
});

// ── GET STUDY STREAK ───────────────────────────────────────

// @desc    Get student study streak information
// @route   GET /api/student/profile/streak
// @access  Private - Student
exports.getStudyStreak = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "studyStreak lastStudyDate totalQuizzesTaken",
  );

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  // Calculate days since last study
  let daysSinceLastStudy = null;
  if (user.lastStudyDate) {
    const today = new Date();
    const lastStudy = new Date(user.lastStudyDate);
    daysSinceLastStudy = Math.floor(
      (today - lastStudy) / (1000 * 60 * 60 * 24),
    );
  }

  // Check if streak is at risk (no study today)
  const isStreakAtRisk = daysSinceLastStudy !== null && daysSinceLastStudy >= 1;

  // Milestones
  const milestones = [3, 7, 14, 30, 60, 90, 180, 365];
  const nextMilestone = milestones.find((m) => m > user.studyStreak);
  const daysToNextMilestone = nextMilestone
    ? nextMilestone - user.studyStreak
    : null;

  // Get study activity for last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const studyActivity = await Score.aggregate([
    {
      $match: {
        userId: req.user._id,
        createdAt: { $gte: thirtyDaysAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        quizCount: { $sum: 1 },
        avgScore: { $avg: "$percentage" },
        date: { $first: "$createdAt" },
      },
    },
    {
      $addFields: {
        avgScore: { $round: ["$avgScore", 1] },
      },
    },
    { $sort: { date: -1 } },
  ]);

  return successResponse(res, "Study streak retrieved successfully", {
    streak: {
      current: user.studyStreak,
      lastStudyDate: user.lastStudyDate,
      daysSinceLastStudy,
      isStreakAtRisk,
      isActive: !isStreakAtRisk,
    },
    milestones: {
      achieved: milestones.filter((m) => m <= user.studyStreak),
      next: nextMilestone,
      daysToNext: daysToNextMilestone,
    },
    studyActivity: studyActivity.map((a) => ({
      date: a.date,
      quizCount: a.quizCount,
      avgScore: a.avgScore,
    })),
  });
});

// ── GET ACHIEVEMENTS ───────────────────────────────────────

// @desc    Get student achievements and badges
// @route   GET /api/student/profile/achievements
// @access  Private - Student
exports.getAchievements = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user._id).select(
    "totalQuizzesTaken averageScore bestScore studyStreak totalCorrectAnswers",
  );

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  // Get subject specific achievements
  const subjectStats = await Score.getUserSubjectStats(req.user._id);
  const perfectScoreCount = await Score.countDocuments({
    userId: req.user._id,
    isPerfectScore: true,
  });

  // Define all possible achievements
  const allAchievements = [
    // Quiz count achievements
    {
      id: "first_quiz",
      title: "🎯 First Steps",
      description: "Complete your first quiz",
      category: "milestone",
      earned: user.totalQuizzesTaken >= 1,
      progress: Math.min(user.totalQuizzesTaken, 1),
      target: 1,
    },
    {
      id: "quiz_10",
      title: "📚 Dedicated Learner",
      description: "Complete 10 quizzes",
      category: "milestone",
      earned: user.totalQuizzesTaken >= 10,
      progress: Math.min(user.totalQuizzesTaken, 10),
      target: 10,
    },
    {
      id: "quiz_50",
      title: "🌟 Quiz Champion",
      description: "Complete 50 quizzes",
      category: "milestone",
      earned: user.totalQuizzesTaken >= 50,
      progress: Math.min(user.totalQuizzesTaken, 50),
      target: 50,
    },
    {
      id: "quiz_100",
      title: "🏆 Century Achiever",
      description: "Complete 100 quizzes",
      category: "milestone",
      earned: user.totalQuizzesTaken >= 100,
      progress: Math.min(user.totalQuizzesTaken, 100),
      target: 100,
    },
    // Score achievements
    {
      id: "score_70",
      title: "✅ Passing Grade",
      description: "Achieve an average score of 70%",
      category: "performance",
      earned: user.averageScore >= 70,
      progress: Math.min(user.averageScore, 70),
      target: 70,
    },
    {
      id: "score_80",
      title: "⭐ High Achiever",
      description: "Achieve an average score of 80%",
      category: "performance",
      earned: user.averageScore >= 80,
      progress: Math.min(user.averageScore, 80),
      target: 80,
    },
    {
      id: "score_90",
      title: "🌠 Excellence Award",
      description: "Achieve an average score of 90%",
      category: "performance",
      earned: user.averageScore >= 90,
      progress: Math.min(user.averageScore, 90),
      target: 90,
    },
    // Perfect score achievements
    {
      id: "perfect_1",
      title: "💎 Perfectionist",
      description: "Get a perfect score of 100%",
      category: "perfect",
      earned: perfectScoreCount >= 1,
      progress: Math.min(perfectScoreCount, 1),
      target: 1,
    },
    {
      id: "perfect_5",
      title: "👑 Master Perfectionist",
      description: "Get 5 perfect scores of 100%",
      category: "perfect",
      earned: perfectScoreCount >= 5,
      progress: Math.min(perfectScoreCount, 5),
      target: 5,
    },
    // Streak achievements
    {
      id: "streak_3",
      title: "🔥 On Fire",
      description: "Study 3 days in a row",
      category: "streak",
      earned: user.studyStreak >= 3,
      progress: Math.min(user.studyStreak, 3),
      target: 3,
    },
    {
      id: "streak_7",
      title: "💪 Week Warrior",
      description: "Study 7 days in a row",
      category: "streak",
      earned: user.studyStreak >= 7,
      progress: Math.min(user.studyStreak, 7),
      target: 7,
    },
    {
      id: "streak_30",
      title: "🚀 Monthly Master",
      description: "Study 30 days in a row",
      category: "streak",
      earned: user.studyStreak >= 30,
      progress: Math.min(user.studyStreak, 30),
      target: 30,
    },
    // Subject mastery achievements
    ...["math", "english", "biology", "chemistry", "physics", "civics"].map(
      (subject) => {
        const subjectStat = subjectStats.find((s) => s._id === subject);
        const avgScore = subjectStat?.avgScore || 0;
        return {
          id: `master_${subject}`,
          title: `🎓 ${subject.charAt(0).toUpperCase() + subject.slice(1)} Master`,
          description: `Achieve 80% average in ${subject}`,
          category: "subject",
          subject,
          earned: avgScore >= 80,
          progress: Math.min(Math.round(avgScore), 80),
          target: 80,
        };
      },
    ),
  ];

  const earnedAchievements = allAchievements.filter((a) => a.earned);
  const upcomingAchievements = allAchievements
    .filter((a) => !a.earned)
    .sort((a, b) => b.progress / b.target - a.progress / a.target)
    .slice(0, 5);

  return successResponse(res, "Achievements retrieved successfully", {
    totalAchievements: allAchievements.length,
    earnedCount: earnedAchievements.length,
    completionRate: Math.round(
      (earnedAchievements.length / allAchievements.length) * 100,
    ),
    earned: earnedAchievements,
    upcoming: upcomingAchievements,
    all: allAchievements,
  });
});

// ── GET WEAK SUBJECTS ──────────────────────────────────────

// @desc    Get AI analysis of weak subjects
// @route   GET /api/student/profile/weak-subjects
// @access  Private - Student
exports.getWeakSubjects = catchAsync(async (req, res, next) => {
  const subjectStats = await Score.getUserSubjectStats(req.user._id);

  if (subjectStats.length === 0) {
    return successResponse(
      res,
      "No quiz data found. Start practicing to get personalized analysis",
      {
        weakSubjects: [],
        strongSubjects: [],
        aiAnalysis: null,
        recommendations: [],
      },
    );
  }

  // Identify weak and strong subjects
  const weakSubjects = subjectStats
    .filter((s) => s.avgScore < 60)
    .sort((a, b) => a.avgScore - b.avgScore);

  const strongSubjects = subjectStats
    .filter((s) => s.avgScore >= 75)
    .sort((a, b) => b.avgScore - a.avgScore);

  const averageSubjects = subjectStats.filter(
    (s) => s.avgScore >= 60 && s.avgScore < 75,
  );

  // Generate AI analysis
  let aiAnalysis = null;
  let recommendations = [];

  try {
    const statsForAI = subjectStats.map((s) => ({
      subject: s._id,
      avgScore: s.avgScore,
      totalAttempts: s.totalAttempts,
      passRate: s.passRate,
    }));

    const aiPrompt = `
You are an educational counselor for Ethiopian Grade 12 university entrance exam preparation.

Here are the student's performance statistics:
${JSON.stringify(statsForAI, null, 2)}

Based on this data, provide:
1. A brief overall assessment (2-3 sentences)
2. Three specific, actionable study recommendations for their weakest subjects
3. One encouragement message

Respond in this exact JSON format:
{
  "assessment": "Overall assessment here",
  "recommendations": [
    {
      "subject": "subject_name",
      "tip": "Specific study tip",
      "priority": "high/medium/low"
    }
  ],
  "encouragement": "Encouragement message here"
}

Focus on practical Ethiopian curriculum study strategies.
`;

    const aiResult = await generateWithAI(aiPrompt, { max_tokens: 600 });

    if (aiResult.success) {
      try {
        const cleanResponse = aiResult.content
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleanResponse);
        aiAnalysis = parsed.assessment;
        recommendations = parsed.recommendations || [];

        // Update user's weak subjects
        const weakSubjectNames = weakSubjects.map((s) => s._id);
        await User.findByIdAndUpdate(req.user._id, {
          weakSubjects: weakSubjectNames.slice(0, 3),
          favoriteSubject: strongSubjects[0]?._id || null,
        });
      } catch (parseError) {
        logger.warn(
          `Failed to parse AI weak subject analysis: ${parseError.message}`,
        );
      }
    }
  } catch (aiError) {
    logger.error(`AI weak subject analysis failed: ${aiError.message}`);
  }

  return successResponse(res, "Weak subject analysis retrieved successfully", {
    weakSubjects: weakSubjects.map((s) => ({
      subject: s._id,
      avgScore: s.avgScore,
      totalAttempts: s.totalAttempts,
      passRate: s.passRate,
      status: "needs_improvement",
    })),
    averageSubjects: averageSubjects.map((s) => ({
      subject: s._id,
      avgScore: s.avgScore,
      totalAttempts: s.totalAttempts,
      passRate: s.passRate,
      status: "improving",
    })),
    strongSubjects: strongSubjects.map((s) => ({
      subject: s._id,
      avgScore: s.avgScore,
      totalAttempts: s.totalAttempts,
      passRate: s.passRate,
      status: "strong",
    })),
    aiAnalysis,
    recommendations,
  });
});

// ── UPDATE NOTIFICATION SETTINGS ───────────────────────────

// @desc    Update notification settings
// @route   PUT /api/student/profile/notifications
// @access  Private - Student
exports.updateNotificationSettings = catchAsync(async (req, res, next) => {
  const { notificationsEnabled, emailNotificationsEnabled } = req.body;

  const user = await User.findById(req.user._id);

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  if (notificationsEnabled !== undefined) {
    user.notificationsEnabled = notificationsEnabled;
  }

  if (emailNotificationsEnabled !== undefined) {
    user.emailNotificationsEnabled = emailNotificationsEnabled;
  }

  await user.save({ validateBeforeSave: false });

  return successResponse(res, "Notification settings updated successfully", {
    notificationsEnabled: user.notificationsEnabled,
    emailNotificationsEnabled: user.emailNotificationsEnabled,
  });
});

// ── GET ACTIVITY LOG ───────────────────────────────────────

// @desc    Get student activity log
// @route   GET /api/student/profile/activity
// @access  Private - Student
exports.getActivityLog = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);

  const [scores, total] = await Promise.all([
    Score.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "subject percentage grade timeTaken createdAt isPerfectScore isPassingScore",
      ),
    Score.countDocuments({ userId: req.user._id }),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  const activities = scores.map((score) => ({
    type: "quiz_completed",
    subject: score.subject,
    score: score.percentage,
    grade: score.grade,
    timeTaken: score.timeTaken,
    isPerfectScore: score.isPerfectScore,
    isPassingScore: score.isPassingScore,
    date: score.createdAt,
  }));

  return paginatedResponse(
    res,
    "Activity log retrieved successfully",
    activities,
    pagination,
  );
});

// ── GET PUBLIC PROFILE ─────────────────────────────────────

// @desc    Get public profile of any student
// @route   GET /api/student/profile/public/:id
// @access  Private - Student
exports.getPublicProfile = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select(
    "name avatar grade school totalQuizzesTaken averageScore bestScore studyStreak favoriteSubject createdAt",
  );

  if (!user || !user.isActive) {
    return notFoundResponse(res, "Student not found");
  }

  // Get subject stats for public profile
  const subjectStats = await Score.getUserSubjectStats(req.params.id);

  return successResponse(res, "Public profile retrieved successfully", {
    profile: {
      id: user._id,
      name: user.name,
      avatar:
        user.avatar ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name,
        )}&background=1B3A6B&color=ffffff`,
      grade: user.grade,
      school: user.school,
      totalQuizzesTaken: user.totalQuizzesTaken,
      averageScore: user.averageScore,
      bestScore: user.bestScore,
      studyStreak: user.studyStreak,
      favoriteSubject: user.favoriteSubject,
      memberSince: user.createdAt,
    },
    subjectStats: subjectStats.map((s) => ({
      subject: s._id,
      avgScore: s.avgScore,
      totalAttempts: s.totalAttempts,
    })),
  });
});
