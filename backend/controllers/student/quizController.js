const Question = require("../../models/Question");
const Score = require("../../models/Score");
const User = require("../../models/User");
const Notification = require("../../models/Notification");
const AIGenerationLog = require("../../models/AIGenerationLog");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");
const { generateWithAI } = require("../../config/anthropic");
const logger = require("../../utils/logger");

// ── GET SUBJECTS ───────────────────────────────────────────

// @desc    Get all available subjects with question counts
// @route   GET /api/student/quiz/subjects
// @access  Private - Student
exports.getSubjects = catchAsync(async (req, res, next) => {
  const subjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];

  // Get question count and stats for each subject
  const subjectStats = await Question.aggregate([
    { $match: { status: "approved", isActive: true } },
    {
      $group: {
        _id: "$subject",
        totalQuestions: { $sum: 1 },
        easyCount: {
          $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] },
        },
        mediumCount: {
          $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] },
        },
        hardCount: {
          $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] },
        },
        aiGeneratedCount: {
          $sum: { $cond: ["$isAIGenerated", 1, 0] },
        },
      },
    },
  ]);

  // Get student's scores per subject
  const studentScores = await Score.aggregate([
    { $match: { userId: req.user._id } },
    {
      $group: {
        _id: "$subject",
        avgScore: { $avg: "$percentage" },
        totalAttempts: { $sum: 1 },
        bestScore: { $max: "$percentage" },
        lastAttempt: { $max: "$createdAt" },
      },
    },
  ]);

  // Map scores by subject
  const scoreMap = {};
  studentScores.forEach((score) => {
    scoreMap[score._id] = {
      avgScore: Math.round(score.avgScore),
      totalAttempts: score.totalAttempts,
      bestScore: score.bestScore,
      lastAttempt: score.lastAttempt,
    };
  });

  // Map stats by subject
  const statsMap = {};
  subjectStats.forEach((stat) => {
    statsMap[stat._id] = {
      totalQuestions: stat.totalQuestions,
      easyCount: stat.easyCount,
      mediumCount: stat.mediumCount,
      hardCount: stat.hardCount,
      aiGeneratedCount: stat.aiGeneratedCount,
    };
  });

  // Subject icons and colors for frontend
  const subjectMeta = {
    math: {
      icon: "📐",
      color: "#1B3A6B",
      nameEn: "Mathematics",
      nameAm: "ሂሳብ",
    },
    english: {
      icon: "📚",
      color: "#2E7D32",
      nameEn: "English",
      nameAm: "እንግሊዝኛ",
    },
    biology: {
      icon: "🔬",
      color: "#00838F",
      nameEn: "Biology",
      nameAm: "ባዮሎጂ",
    },
    chemistry: {
      icon: "⚗️",
      color: "#E65100",
      nameEn: "Chemistry",
      nameAm: "ኬሚስትሪ",
    },
    physics: {
      icon: "⚡",
      color: "#6A1B9A",
      nameEn: "Physics",
      nameAm: "ፊዚክስ",
    },
    civics: {
      icon: "🏛️",
      color: "#B71C1C",
      nameEn: "Civics",
      nameAm: "ሲቪክስ",
    },
  };

  // Build final subjects array
  const subjectsData = subjects.map((subject) => ({
    id: subject,
    ...subjectMeta[subject],
    questions: statsMap[subject] || {
      totalQuestions: 0,
      easyCount: 0,
      mediumCount: 0,
      hardCount: 0,
      aiGeneratedCount: 0,
    },
    studentStats: scoreMap[subject] || {
      avgScore: 0,
      totalAttempts: 0,
      bestScore: 0,
      lastAttempt: null,
    },
    isAvailable: (statsMap[subject]?.totalQuestions || 0) >= 5,
  }));

  return successResponse(res, "Subjects retrieved successfully", {
    subjects: subjectsData,
    totalSubjects: subjects.length,
  });
});

// ── GET QUESTIONS BY SUBJECT ───────────────────────────────

// @desc    Get random questions for a subject
// @route   GET /api/student/quiz/questions/:subject
// @access  Private - Student
exports.getQuestionsBySubject = catchAsync(async (req, res, next) => {
  const { subject } = req.params;
  const { difficulty, limit = 20, grade } = req.query;

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
    subject: subject.toLowerCase(),
    status: "approved",
    isActive: true,
  };

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    filter.difficulty = difficulty;
  }

  if (grade && ["Grade 11", "Grade 12"].includes(grade)) {
    filter.$or = [{ grade }, { grade: "Both" }];
  }

  const questionLimit = Math.min(Math.max(parseInt(limit) || 20, 5), 50);

  // Get random questions using MongoDB aggregation
  const questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: questionLimit } },
    {
      $project: {
        questionText: 1,
        options: 1,
        subject: 1,
        difficulty: 1,
        grade: 1,
        topic: 1,
        imageUrl: 1,
        year: 1,
        isAIGenerated: 1,
      },
    },
  ]);

  if (questions.length === 0) {
    return errorResponse(
      res,
      `No questions available for ${subject}. Please try another subject`,
      404,
    );
  }

  return successResponse(res, "Questions retrieved successfully", {
    subject,
    difficulty: difficulty || "mixed",
    totalQuestions: questions.length,
    questions,
  });
});

// ── START QUIZ ─────────────────────────────────────────────

// @desc    Start a new quiz session
// @route   POST /api/student/quiz/start
// @access  Private - Student
exports.startQuiz = catchAsync(async (req, res, next) => {
  const { subject, difficulty, questionCount = 20, grade } = req.body;

  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];

  if (!subject || !validSubjects.includes(subject.toLowerCase())) {
    return errorResponse(
      res,
      `Subject is required and must be one of: ${validSubjects.join(", ")}`,
      400,
    );
  }

  const filter = {
    subject: subject.toLowerCase(),
    status: "approved",
    isActive: true,
  };

  if (difficulty && ["easy", "medium", "hard"].includes(difficulty)) {
    filter.difficulty = difficulty;
  }

  if (grade) {
    filter.$or = [{ grade }, { grade: "Both" }];
  }

  const limit = Math.min(Math.max(parseInt(questionCount) || 20, 5), 50);

  // Get random questions
  const questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: limit } },
    {
      $project: {
        questionText: 1,
        options: 1,
        subject: 1,
        difficulty: 1,
        grade: 1,
        topic: 1,
        imageUrl: 1,
        year: 1,
        isAIGenerated: 1,
      },
    },
  ]);

  if (questions.length < 5) {
    return errorResponse(
      res,
      `Not enough questions available for ${subject}. Please try another subject or difficulty`,
      400,
    );
  }

  // Generate unique session ID
  const sessionId = `quiz_${req.userId}_${Date.now()}`;

  logger.info(
    `Quiz started — Student: ${req.userId} — Subject: ${subject} — Questions: ${questions.length}`,
  );

  return successResponse(res, "Quiz started successfully", {
    sessionId,
    subject,
    difficulty: difficulty || "mixed",
    totalQuestions: questions.length,
    timePerQuestion: 30,
    totalTime: questions.length * 30,
    questions,
    startedAt: new Date().toISOString(),
  });
});

// ── SUBMIT QUIZ ────────────────────────────────────────────

// @desc    Submit quiz answers and get results
// @route   POST /api/student/quiz/submit
// @access  Private - Student
exports.submitQuiz = catchAsync(async (req, res, next) => {
  const { subject, answers, timeTaken, sessionId, difficulty } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return errorResponse(res, "Answers array is required", 400);
  }

  if (!subject) {
    return errorResponse(res, "Subject is required", 400);
  }

  // Get correct answers for submitted questions
  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({
    _id: { $in: questionIds },
  }).select("correctAnswer explanation subject topic difficulty");

  if (questions.length === 0) {
    return errorResponse(res, "No valid questions found", 400);
  }

  // Build question map for fast lookup
  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });

  // Calculate results
  let correctAnswers = 0;
  const detailedAnswers = [];
  const wrongTopics = [];
  const correctTopics = [];

  answers.forEach((answer) => {
    const question = questionMap[answer.questionId?.toString()];
    if (!question) return;

    const isCorrect =
      question.correctAnswer === parseInt(answer.selectedAnswer);

    if (isCorrect) {
      correctAnswers++;
      if (question.topic) correctTopics.push(question.topic);
    } else {
      if (question.topic) wrongTopics.push(question.topic);
    }

    detailedAnswers.push({
      questionId: answer.questionId,
      selectedAnswer: parseInt(answer.selectedAnswer),
      correctAnswer: question.correctAnswer,
      isCorrect,
      timeToAnswer: answer.timeToAnswer || 0,
    });

    // Update question statistics
    question.updateStats(isCorrect, answer.timeToAnswer || 0).catch((err) => {
      logger.error(`Failed to update question stats: ${err.message}`);
    });
  });

  const totalQuestions = detailedAnswers.length;
  const percentage = Math.round((correctAnswers / totalQuestions) * 100);

  // Get unique weak and strong topics
  const uniqueWeakTopics = [...new Set(wrongTopics)].slice(0, 5);
  const uniqueStrongTopics = [...new Set(correctTopics)].slice(0, 5);

  // Save score to database
  const score = await Score.create({
    userId: req.user._id,
    subject,
    totalQuestions,
    correctAnswers,
    percentage,
    timeTaken: timeTaken || 0,
    difficulty: difficulty || "mixed",
    answers: detailedAnswers,
    sessionId,
    weakTopics: uniqueWeakTopics,
    strongTopics: uniqueStrongTopics,
  });

  // Update user statistics
  await req.user.updateQuizStats(correctAnswers, totalQuestions, percentage);

  // Generate AI feedback and study tips
  let aiFeedback = null;
  let aiStudyTips = [];

  try {
    const aiPrompt = `
You are an educational AI assistant for Ethiopian Grade 12 university entrance exam preparation.

A student just completed a ${subject} quiz with these results:
- Score: ${correctAnswers}/${totalQuestions} (${percentage}%)
- Subject: ${subject}
- Weak topics: ${uniqueWeakTopics.join(", ") || "none identified"}
- Strong topics: ${uniqueStrongTopics.join(", ") || "none identified"}
- Time taken: ${Math.floor((timeTaken || 0) / 60)} minutes ${(timeTaken || 0) % 60} seconds

Please provide:
1. A short encouraging feedback message (2-3 sentences) appropriate for their score
2. Three specific study tips for improving in ${subject} based on their weak areas

Respond in this exact JSON format:
{
  "feedback": "Your feedback message here",
  "studyTips": [
    "Study tip 1",
    "Study tip 2", 
    "Study tip 3"
  ]
}

Keep tips specific to Ethiopian curriculum and Grade 12 level.
`;

    const aiResult = await generateWithAI(aiPrompt, { max_tokens: 500 });

    if (aiResult.success) {
      try {
        const cleanResponse = aiResult.content
          .replace(/```json/g, "")
          .replace(/```/g, "")
          .trim();
        const parsed = JSON.parse(cleanResponse);
        aiFeedback = parsed.feedback;
        aiStudyTips = parsed.studyTips || [];

        // Save AI feedback to score
        score.aiFeedback = aiFeedback;
        score.aiStudyTips = aiStudyTips;
        await score.save({ validateBeforeSave: false });
      } catch (parseError) {
        logger.warn(`Failed to parse AI response: ${parseError.message}`);
      }
    }
  } catch (aiError) {
    logger.error(`AI feedback generation failed: ${aiError.message}`);
  }

  // Send quiz completed notification
  await Notification.createNotification({
    recipientId: req.user._id,
    recipientModel: "User",
    recipientRole: "student",
    ...Notification.templates.quizCompleted(subject, percentage),
  });

  // Check for perfect score achievement
  if (percentage === 100) {
    await Notification.createNotification({
      recipientId: req.user._id,
      recipientModel: "User",
      recipientRole: "student",
      type: "new_achievement",
      title: "🏆 Perfect Score!",
      message: `Incredible! You got a perfect score of 100% on ${subject}! You are truly prepared for this subject.`,
      actionUrl: "/student/profile",
      actionLabel: "View Achievement",
      priority: "high",
    });
  }

  // Check for study streak achievement
  if (req.user.studyStreak > 0 && req.user.studyStreak % 7 === 0) {
    await Notification.createNotification({
      recipientId: req.user._id,
      recipientModel: "User",
      recipientRole: "student",
      ...Notification.templates.streakAchieved(req.user.studyStreak),
    });
  }

  logger.info(
    `Quiz submitted — Student: ${req.userId} — Subject: ${subject} — Score: ${percentage}%`,
  );

  return successResponse(res, "Quiz submitted successfully", {
    score: score.getSummary(),
    results: {
      subject,
      totalQuestions,
      correctAnswers,
      wrongAnswers: totalQuestions - correctAnswers,
      percentage,
      grade: score.grade,
      timeTaken: timeTaken || 0,
      formattedTime: score.formattedTime,
      performanceLevel: score.performanceLevel,
      isPerfectScore: score.isPerfectScore,
      isPassingScore: score.isPassingScore,
      feedback: score.feedback,
    },
    ai: {
      feedback: aiFeedback,
      studyTips: aiStudyTips,
      weakTopics: uniqueWeakTopics,
      strongTopics: uniqueStrongTopics,
    },
    answers: detailedAnswers.map((a) => ({
      questionId: a.questionId,
      selectedAnswer: a.selectedAnswer,
      correctAnswer: a.correctAnswer,
      isCorrect: a.isCorrect,
    })),
  });
});

// ── GET QUIZ HISTORY ───────────────────────────────────────

// @desc    Get student quiz history
// @route   GET /api/student/quiz/history
// @access  Private - Student
exports.getQuizHistory = catchAsync(async (req, res, next) => {
  const { page, limit, skip } = getPagination(req.query);
  const { subject } = req.query;

  const filter = { userId: req.user._id };
  if (subject) filter.subject = subject;

  const [scores, total] = await Promise.all([
    Score.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select("-answers"),
    Score.countDocuments(filter),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  return paginatedResponse(
    res,
    "Quiz history retrieved successfully",
    scores.map((s) => s.getSummary()),
    pagination,
  );
});

// ── GET QUIZ BY ID ─────────────────────────────────────────

// @desc    Get a specific quiz result
// @route   GET /api/student/quiz/:id
// @access  Private - Student
exports.getQuizById = catchAsync(async (req, res, next) => {
  const score = await Score.findOne({
    _id: req.params.id,
    userId: req.user._id,
  }).populate("answers.questionId", "questionText options explanation subject");

  if (!score) {
    return notFoundResponse(res, "Quiz result not found");
  }

  return successResponse(res, "Quiz result retrieved successfully", {
    score: score.getSummary(),
    answers: score.answers,
  });
});

// ── RETRY QUIZ ─────────────────────────────────────────────

// @desc    Retry a previous quiz with same subject
// @route   POST /api/student/quiz/retry/:id
// @access  Private - Student
exports.retryQuiz = catchAsync(async (req, res, next) => {
  const previousScore = await Score.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });

  if (!previousScore) {
    return notFoundResponse(res, "Previous quiz not found");
  }

  const filter = {
    subject: previousScore.subject,
    status: "approved",
    isActive: true,
  };

  if (previousScore.difficulty && previousScore.difficulty !== "mixed") {
    filter.difficulty = previousScore.difficulty;
  }

  const questions = await Question.aggregate([
    { $match: filter },
    { $sample: { size: previousScore.totalQuestions } },
    {
      $project: {
        questionText: 1,
        options: 1,
        subject: 1,
        difficulty: 1,
        grade: 1,
        topic: 1,
        imageUrl: 1,
        year: 1,
        isAIGenerated: 1,
      },
    },
  ]);

  if (questions.length === 0) {
    return errorResponse(
      res,
      "No questions available for retry. Please try a different subject",
      400,
    );
  }

  const sessionId = `retry_${req.userId}_${Date.now()}`;

  return successResponse(res, "Retry quiz started successfully", {
    sessionId,
    subject: previousScore.subject,
    difficulty: previousScore.difficulty,
    totalQuestions: questions.length,
    timePerQuestion: 30,
    totalTime: questions.length * 30,
    questions,
    previousScore: {
      percentage: previousScore.percentage,
      grade: previousScore.grade,
      correctAnswers: previousScore.correctAnswers,
      totalQuestions: previousScore.totalQuestions,
    },
    startedAt: new Date().toISOString(),
  });
});

// ── GET QUIZ STATS ─────────────────────────────────────────

// @desc    Get student quiz statistics overview
// @route   GET /api/student/quiz/stats/overview
// @access  Private - Student
exports.getQuizStats = catchAsync(async (req, res, next) => {
  const [subjectStats, recentScores, platformStats] = await Promise.all([
    Score.getUserSubjectStats(req.user._id),
    Score.getRecentScores(req.user._id, 5),
    Score.getPlatformStats(),
  ]);

  const user = await User.findById(req.user._id).select(
    "totalQuizzesTaken averageScore bestScore totalCorrectAnswers totalQuestionsAnswered studyStreak favoriteSubject weakSubjects",
  );

  // Find favorite subject (most quizzes taken)
  let favoriteSubject = null;
  let maxAttempts = 0;
  let weakestSubject = null;
  let lowestAvg = 100;

  subjectStats.forEach((stat) => {
    if (stat.totalAttempts > maxAttempts) {
      maxAttempts = stat.totalAttempts;
      favoriteSubject = stat._id;
    }
    if (stat.avgScore < lowestAvg && stat.totalAttempts > 0) {
      lowestAvg = stat.avgScore;
      weakestSubject = stat._id;
    }
  });

  // Update user's favorite and weak subjects
  if (favoriteSubject !== user.favoriteSubject) {
    await User.findByIdAndUpdate(req.user._id, {
      favoriteSubject,
      weakSubjects: weakestSubject ? [weakestSubject] : [],
    });
  }

  return successResponse(res, "Quiz statistics retrieved successfully", {
    overview: {
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
      favoriteSubject,
      weakestSubject,
    },
    subjectStats,
    recentScores: recentScores.map((s) => s.getSummary()),
    platformComparison: {
      platformAvgScore: platformStats[0]?.avgScore || 0,
      yourAvgScore: user.averageScore,
      isAboveAverage: user.averageScore > (platformStats[0]?.avgScore || 0),
    },
  });
});
