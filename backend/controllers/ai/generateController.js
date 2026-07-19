const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../../utils/apiResponse");
const {
  generateQuestions,
  bulkGenerateQuestions,
} = require("../../services/ai/generateQuestions.service");
const {
  generateStudyTips,
  generateSubjectStudyTips,
  generatePersonalizedPlan,
  getStaticExamTips,
  getTimeManagementTips,
} = require("../../services/ai/studyTips.service");
const {
  analyzeWeakSubjects,
  getSubjectRecommendations,
} = require("../../services/ai/weakSubject.service");
const {
  explainAnswerByQuestionId,
  batchExplainAnswers,
} = require("../../services/ai/explainAnswer.service");
const { buildQuizFeedbackPrompt } = require("../../services/ai/prompt.builder");
const { generateWithAI } = require("../../config/anthropic");
const AIGenerationLog = require("../../models/AIGenerationLog");
const logger = require("../../utils/logger");

exports.generateQuestions = catchAsync(async (req, res) => {
  const { subject, difficulty, count, topic, grade, additionalInstructions } =
    req.body;

  if (!subject) return errorResponse(res, "Subject is required", 400);

  const result = await generateQuestions({
    subject,
    difficulty,
    count,
    topic,
    grade,
    additionalInstructions,
    requestedById: req.userId,
    requestedByModel: req.role === "admin" ? "Admin" : "Teacher",
    requestedByRole: req.role,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  return successResponse(
    res,
    `${result.generationStats.generated} question(s) generated successfully`,
    result,
  );
});

exports.bulkGenerateQuestions = catchAsync(async (req, res) => {
  const { subjects, difficulty, countPerSubject, grade } = req.body;

  if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
    return errorResponse(res, "Subjects array is required", 400);
  }

  if (subjects.length > 6) {
    return errorResponse(
      res,
      "Cannot bulk generate for more than 6 subjects at once",
      400,
    );
  }

  const result = await bulkGenerateQuestions({
    subjects,
    difficulty,
    countPerSubject,
    grade,
    requestedById: req.userId,
    requestedByModel: req.role === "admin" ? "Admin" : "Teacher",
    requestedByRole: req.role,
  });

  return successResponse(
    res,
    `Bulk generation completed. ${result.totalGenerated} questions generated`,
    result,
  );
});

exports.getStudyTips = catchAsync(async (req, res) => {
  const result = await generateStudyTips(req.userId);
  return successResponse(res, "Study tips generated successfully", result);
});

exports.getSubjectStudyTips = catchAsync(async (req, res) => {
  const { subject } = req.params;
  const result = await generateSubjectStudyTips(req.userId, subject);
  return successResponse(
    res,
    `${subject} study tips generated successfully`,
    result,
  );
});

exports.getPersonalizedPlan = catchAsync(async (req, res) => {
  const { daysUntilExam, targetScore, availableHoursPerDay } = req.query;

  const result = await generatePersonalizedPlan(req.userId, {
    daysUntilExam: parseInt(daysUntilExam) || 90,
    targetScore: parseInt(targetScore) || 80,
    availableHoursPerDay: parseFloat(availableHoursPerDay) || 4,
  });

  return successResponse(
    res,
    "Personalized study plan generated successfully",
    result,
  );
});

exports.getExamTips = catchAsync(async (req, res) => {
  const examTips = getStaticExamTips();
  return successResponse(res, "Exam tips retrieved successfully", { examTips });
});

exports.getTimeManagementTips = catchAsync(async (req, res) => {
  const tips = getTimeManagementTips();
  return successResponse(res, "Time management tips retrieved successfully", {
    tips,
  });
});

exports.analyzeWeakSubjects = catchAsync(async (req, res) => {
  const result = await analyzeWeakSubjects(req.userId);
  return successResponse(res, "Weak subject analysis completed", result);
});

exports.getSubjectRecommendations = catchAsync(async (req, res) => {
  const { subject } = req.params;
  const result = await getSubjectRecommendations(req.userId, subject);
  return successResponse(
    res,
    "Subject recommendations retrieved successfully",
    result,
  );
});

exports.explainAnswer = catchAsync(async (req, res) => {
  const { questionId, selectedAnswer } = req.body;

  if (!questionId || selectedAnswer === undefined) {
    return errorResponse(
      res,
      "Question ID and selected answer are required",
      400,
    );
  }

  const user = req.user;
  const result = await explainAnswerByQuestionId(
    questionId,
    selectedAnswer,
    user?.grade || "Grade 12",
  );

  return successResponse(
    res,
    "Answer explanation generated successfully",
    result,
  );
});

exports.batchExplainAnswers = catchAsync(async (req, res) => {
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers) || answers.length === 0) {
    return errorResponse(res, "Answers array is required", 400);
  }

  if (answers.length > 20) {
    return errorResponse(
      res,
      "Cannot explain more than 20 answers at once",
      400,
    );
  }

  const user = req.user;
  const results = await batchExplainAnswers(answers, user?.grade || "Grade 12");

  return successResponse(res, "Batch explanations generated successfully", {
    explanations: results,
  });
});

exports.generateQuizFeedback = catchAsync(async (req, res) => {
  const {
    subject,
    score,
    totalQuestions,
    correctAnswers,
    timeTaken,
    weakTopics,
    strongTopics,
  } = req.body;

  if (
    !subject ||
    score === undefined ||
    !totalQuestions ||
    correctAnswers === undefined
  ) {
    return errorResponse(
      res,
      "Subject, score, totalQuestions and correctAnswers are required",
      400,
    );
  }

  const prompt = buildQuizFeedbackPrompt({
    subject,
    score,
    totalQuestions,
    correctAnswers,
    timeTaken,
    weakTopics,
    strongTopics,
    grade: req.user?.grade || "Grade 12",
  });

  const startTime = Date.now();
  const aiResult = await generateWithAI(prompt, { max_tokens: 600 });
  const responseTime = Date.now() - startTime;

  if (!aiResult.success) {
    return errorResponse(
      res,
      "Failed to generate quiz feedback. Please try again",
      500,
    );
  }

  try {
    const clean = aiResult.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    logger.logAI("GenerateQuizFeedback", {
      userId: req.userId,
      subject,
      score,
      responseTime,
    });

    return successResponse(res, "Quiz feedback generated successfully", {
      feedback: parsed.feedback || "",
      studyTips: parsed.studyTips || [],
      nextSteps: parsed.nextSteps || "",
      encouragement: parsed.encouragement || "",
    });
  } catch (parseError) {
    logger.error(`Failed to parse quiz feedback: ${parseError.message}`);
    return errorResponse(
      res,
      "Failed to process feedback. Please try again",
      500,
    );
  }
});

exports.getAIUsageStats = catchAsync(async (req, res) => {
  const [platformStats, bySubject, byType] = await Promise.all([
    AIGenerationLog.getPlatformStats(),
    AIGenerationLog.getStatsBySubject(),
    AIGenerationLog.getStatsByType(),
  ]);

  return successResponse(res, "AI usage statistics retrieved successfully", {
    platform: platformStats[0] || {},
    bySubject,
    byType,
  });
});

exports.getMyAIHistory = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);

  const logs = await AIGenerationLog.find({ requestedBy: req.userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select(
      "type subject difficulty questionsGenerated status responseTimeMs estimatedCost createdAt",
    );

  return successResponse(res, "AI generation history retrieved successfully", {
    logs,
  });
});
