const Question = require("../models/Question");
const { catchAsync } = require("../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const logger = require("../utils/logger");

exports.getQuestions = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { subject, difficulty, grade, isAIGenerated, search } = req.query;

  const filter = { status: "approved", isActive: true };

  if (subject) filter.subject = subject.toLowerCase();
  if (difficulty) filter.difficulty = difficulty;
  if (grade) filter.$or = [{ grade }, { grade: "Both" }];
  if (isAIGenerated !== undefined)
    filter.isAIGenerated = isAIGenerated === "true";
  if (search) {
    filter.$or = [
      { questionText: { $regex: search, $options: "i" } },
      { topic: { $regex: search, $options: "i" } },
    ];
  }

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(
        "questionText options subject difficulty grade topic imageUrl year isAIGenerated",
      ),
    Question.countDocuments(filter),
  ]);

  return paginatedResponse(
    res,
    "Questions retrieved successfully",
    questions.map((q) => q.getSafeQuestion()),
    getPaginationMeta(total, page, limit),
  );
});

exports.getQuestionById = catchAsync(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    status: "approved",
    isActive: true,
  }).select(
    "questionText options subject difficulty grade topic imageUrl year isAIGenerated",
  );

  if (!question) return notFoundResponse(res, "Question not found");

  return successResponse(res, "Question retrieved successfully", {
    question: question.getSafeQuestion(),
  });
});

exports.getSubjectStats = catchAsync(async (req, res) => {
  const stats = await Question.getSubjectStats();

  return successResponse(res, "Subject statistics retrieved successfully", {
    subjects: stats,
  });
});

exports.checkAnswers = catchAsync(async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return errorResponse(res, "Answers array is required", 400);
  }

  const questionIds = answers.map((a) => a.questionId);
  const questions = await Question.find({
    _id: { $in: questionIds },
    status: "approved",
  }).select("correctAnswer explanation");

  if (questions.length === 0) {
    return errorResponse(res, "No valid questions found", 400);
  }

  const questionMap = {};
  questions.forEach((q) => {
    questionMap[q._id.toString()] = q;
  });

  let correctCount = 0;
  const results = [];

  for (const answer of answers) {
    const question = questionMap[answer.questionId?.toString()];
    if (!question) continue;

    const isCorrect =
      question.correctAnswer === parseInt(answer.selectedAnswer);
    if (isCorrect) correctCount++;

    results.push({
      questionId: answer.questionId,
      selectedAnswer: parseInt(answer.selectedAnswer),
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation,
    });

    question.updateStats(isCorrect, answer.timeToAnswer || 0).catch((err) => {
      logger.error(`Failed to update question stats: ${err.message}`);
    });
  }

  const total = results.length;
  const percentage = Math.round((correctCount / total) * 100);

  return successResponse(res, "Answers checked successfully", {
    totalQuestions: total,
    correctAnswers: correctCount,
    wrongAnswers: total - correctCount,
    percentage,
    results,
  });
});

exports.reportQuestion = catchAsync(async (req, res) => {
  const { reason, details } = req.body;

  const validReasons = [
    "wrong_answer",
    "unclear_question",
    "outdated",
    "duplicate",
    "inappropriate",
    "other",
  ];

  if (!reason || !validReasons.includes(reason)) {
    return errorResponse(
      res,
      `Reason must be one of: ${validReasons.join(", ")}`,
      400,
    );
  }

  const question = await Question.findOne({
    _id: req.params.id,
    status: "approved",
    isActive: true,
  });

  if (!question) return notFoundResponse(res, "Question not found");

  const alreadyReported = question.reports.some(
    (r) => r.reportedBy?.toString() === req.userId?.toString(),
  );

  if (alreadyReported) {
    return errorResponse(res, "You have already reported this question", 400);
  }

  await question.addReport(req.userId, reason, details || null);

  logger.info(
    `Question reported — Question: ${question._id} — User: ${req.userId} — Reason: ${reason}`,
  );

  return successResponse(
    res,
    "Question reported successfully. Our team will review it shortly.",
  );
});
