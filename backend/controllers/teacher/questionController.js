const Question = require("../../models/Question");
const QuestionApproval = require("../../models/QuestionApproval");
const AIGenerationLog = require("../../models/AIGenerationLog");
const Notification = require("../../models/Notification");
const Teacher = require("../../models/Teacher");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  forbiddenResponse,
  paginatedResponse,
} = require("../../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");
const { generateWithAI, streamWithAI } = require("../../config/anthropic");
const { uploadImage, deleteImage } = require("../../config/cloudinary");
const { getFileInfo } = require("../../middleware/upload");
const { sanitizeQuestionText } = require("../../utils/sanitize");
const logger = require("../../utils/logger");

exports.createQuestion = catchAsync(async (req, res) => {
  const {
    questionText,
    options,
    correctAnswer,
    subject,
    difficulty,
    explanation,
    year,
    grade,
    topic,
    tags,
  } = req.body;

  const question = await Question.create({
    questionText: sanitizeQuestionText(questionText),
    options,
    correctAnswer: parseInt(correctAnswer),
    subject: subject.toLowerCase(),
    difficulty: difficulty || "medium",
    explanation,
    year,
    grade: grade || "Grade 12",
    topic,
    tags,
    createdBy: req.userId,
    createdByModel: "Teacher",
    status: "draft",
    isAIGenerated: false,
  });

  await Teacher.findByIdAndUpdate(req.userId, {
    $inc: { totalQuestionsCreated: 1 },
  });

  logger.info(
    `Question created — Teacher: ${req.userId} — Subject: ${subject}`,
  );

  return createdResponse(res, "Question created successfully", {
    question: question.getFullQuestion(),
  });
});

exports.getMyQuestions = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { subject, status, difficulty, isAIGenerated } = req.query;

  const filter = { createdBy: req.userId };

  if (subject) filter.subject = subject.toLowerCase();
  if (status) filter.status = status;
  if (difficulty) filter.difficulty = difficulty;
  if (isAIGenerated !== undefined)
    filter.isAIGenerated = isAIGenerated === "true";

  const [questions, total] = await Promise.all([
    Question.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Question.countDocuments(filter),
  ]);

  const pagination = getPaginationMeta(total, page, limit);

  return paginatedResponse(
    res,
    "Questions retrieved successfully",
    questions.map((q) => q.getFullQuestion()),
    pagination,
  );
});

exports.getQuestionById = catchAsync(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    createdBy: req.userId,
  });

  if (!question) {
    return notFoundResponse(
      res,
      "Question not found or you do not have permission to view it",
    );
  }

  const approval = await QuestionApproval.findOne({
    question: question._id,
  })
    .populate("reviewedBy", "name avatar")
    .sort({ createdAt: -1 });

  return successResponse(res, "Question retrieved successfully", {
    question: question.getFullQuestion(),
    approval: approval ? approval.getSummary() : null,
  });
});

exports.updateQuestion = catchAsync(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    createdBy: req.userId,
  });

  if (!question) {
    return notFoundResponse(
      res,
      "Question not found or you do not have permission to edit it",
    );
  }

  if (question.status === "approved") {
    return forbiddenResponse(
      res,
      "Approved questions cannot be edited. Please contact admin",
    );
  }

  const {
    questionText,
    options,
    correctAnswer,
    subject,
    difficulty,
    explanation,
    year,
    grade,
    topic,
    tags,
  } = req.body;

  if (questionText !== undefined)
    question.questionText = sanitizeQuestionText(questionText);
  if (options !== undefined) question.options = options;
  if (correctAnswer !== undefined)
    question.correctAnswer = parseInt(correctAnswer);
  if (subject !== undefined) question.subject = subject.toLowerCase();
  if (difficulty !== undefined) question.difficulty = difficulty;
  if (explanation !== undefined) question.explanation = explanation;
  if (year !== undefined) question.year = year;
  if (grade !== undefined) question.grade = grade;
  if (topic !== undefined) question.topic = topic;
  if (tags !== undefined) question.tags = tags;

  if (question.status === "rejected") {
    question.status = "draft";
    question.rejectionReason = null;
  }

  await question.save();

  logger.info(
    `Question updated — Teacher: ${req.userId} — Question: ${question._id}`,
  );

  return successResponse(res, "Question updated successfully", {
    question: question.getFullQuestion(),
  });
});

exports.deleteQuestion = catchAsync(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    createdBy: req.userId,
  });

  if (!question) {
    return notFoundResponse(
      res,
      "Question not found or you do not have permission to delete it",
    );
  }

  if (question.status === "approved" && question.timesUsed > 0) {
    return forbiddenResponse(
      res,
      "This question has been used in quizzes and cannot be deleted. Please contact admin.",
    );
  }

  if (question.imagePublicId) {
    await deleteImage(question.imagePublicId);
  }

  await Question.findByIdAndDelete(question._id);
  await QuestionApproval.deleteMany({ question: question._id });

  await Teacher.findByIdAndUpdate(req.userId, {
    $inc: { totalQuestionsCreated: -1 },
  });

  logger.info(
    `Question deleted — Teacher: ${req.userId} — Question: ${question._id}`,
  );

  return successResponse(res, "Question deleted successfully");
});

exports.generateAIQuestion = catchAsync(async (req, res) => {
  const { subject, difficulty, count = 1, topic, grade } = req.body;

  const teacher = await Teacher.findById(req.userId);

  if (teacher.hasReachedAILimit(100)) {
    return errorResponse(
      res,
      "Monthly AI generation limit reached. Limit resets next month.",
      429,
    );
  }

  const aiLog = await AIGenerationLog.create({
    requestedBy: req.userId,
    requestedByModel: "Teacher",
    requestedByRole: "teacher",
    type: "generate_question",
    subject,
    difficulty: difficulty || "medium",
    grade: grade || "Grade 12",
    topic: topic || null,
    questionsRequested: Math.min(parseInt(count) || 1, 5),
    prompt: "pending",
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  const questionCount = Math.min(parseInt(count) || 1, 5);

  const prompt = `
You are an expert teacher creating questions for Ethiopian Grade 12 university entrance exam.

Generate ${questionCount} high-quality multiple choice question(s) for:
- Subject: ${subject}
- Difficulty: ${difficulty || "medium"}
- Grade: ${grade || "Grade 12"}
${topic ? `- Topic: ${topic}` : ""}

Requirements:
- Questions must be aligned with Ethiopian national curriculum
- Each question must have exactly 4 options (A, B, C, D)
- Only one option must be correct
- Include a clear explanation for the correct answer
- Questions must be appropriate for university entrance exam level

Respond ONLY in this exact JSON format with no extra text:
{
  "questions": [
    {
      "questionText": "The full question text here?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Explanation of why this answer is correct",
      "topic": "specific topic within the subject",
      "difficulty": "${difficulty || "medium"}"
    }
  ]
}

correctAnswer is the INDEX (0=A, 1=B, 2=C, 3=D) of the correct option.
`;

  const startTime = Date.now();
  const aiResult = await generateWithAI(prompt, { max_tokens: 1500 });
  const responseTime = Date.now() - startTime;

  if (!aiResult.success) {
    await aiLog.markFailed(aiResult.error, responseTime);
    return errorResponse(res, "AI generation failed. Please try again", 500);
  }

  try {
    const clean = aiResult.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      await aiLog.markFailed("Invalid AI response format", responseTime);
      return errorResponse(
        res,
        "AI returned invalid format. Please try again",
        500,
      );
    }

    const savedQuestions = [];

    for (const q of parsed.questions) {
      if (
        !q.questionText ||
        !Array.isArray(q.options) ||
        q.options.length !== 4 ||
        typeof q.correctAnswer !== "number" ||
        q.correctAnswer < 0 ||
        q.correctAnswer > 3
      ) {
        continue;
      }

      const question = await Question.create({
        questionText: sanitizeQuestionText(q.questionText),
        options: q.options,
        correctAnswer: q.correctAnswer,
        subject: subject.toLowerCase(),
        difficulty: q.difficulty || difficulty || "medium",
        explanation: q.explanation || "",
        grade: grade || "Grade 12",
        topic: q.topic || topic || null,
        createdBy: req.userId,
        createdByModel: "Teacher",
        status: "draft",
        isAIGenerated: true,
        aiModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
      });

      savedQuestions.push(question);
      await aiLog.addGeneratedQuestion(question._id);
    }

    await aiLog.markSuccess(
      aiResult.content,
      aiResult.usage?.input_tokens || 0,
      aiResult.usage?.output_tokens || 0,
      responseTime,
      savedQuestions.length,
    );

    await teacher.incrementAIGenerations();

    logger.logAI("GenerateQuestion", {
      teacherId: req.userId,
      subject,
      count: savedQuestions.length,
    });

    return successResponse(
      res,
      `${savedQuestions.length} AI question(s) generated successfully`,
      {
        questions: savedQuestions.map((q) => q.getFullQuestion()),
        aiUsage: {
          inputTokens: aiResult.usage?.input_tokens || 0,
          outputTokens: aiResult.usage?.output_tokens || 0,
          generationsThisMonth: teacher.aiGenerationsThisMonth + 1,
          monthlyLimit: 100,
          remaining: 100 - (teacher.aiGenerationsThisMonth + 1),
        },
      },
    );
  } catch (parseError) {
    await aiLog.markFailed(`Parse error: ${parseError.message}`, responseTime);
    logger.error(`AI question parse error: ${parseError.message}`);
    return errorResponse(
      res,
      "Failed to process AI response. Please try again",
      500,
    );
  }
});

exports.submitForApproval = catchAsync(async (req, res) => {
  const { submissionNote } = req.body;

  const question = await Question.findOne({
    _id: req.params.id,
    createdBy: req.userId,
  });

  if (!question) {
    return notFoundResponse(
      res,
      "Question not found or you do not have permission",
    );
  }

  if (question.status === "approved") {
    return errorResponse(res, "Question is already approved", 400);
  }

  if (question.status === "pending") {
    return errorResponse(res, "Question is already pending review", 400);
  }

  if (!question.explanation) {
    return errorResponse(
      res,
      "Please add an explanation before submitting for approval",
      400,
    );
  }

  question.status = "pending";
  await question.save({ validateBeforeSave: false });

  const existingApproval = await QuestionApproval.findOne({
    question: question._id,
  });

  if (existingApproval) {
    existingApproval.status = "pending";
    existingApproval.submissionNote = submissionNote || null;
    existingApproval.reviewedBy = null;
    existingApproval.reviewedAt = null;
    existingApproval.rejectionReason = null;
    existingApproval.submittedAt = new Date();
    await existingApproval.save({ validateBeforeSave: false });
  } else {
    await QuestionApproval.create({
      question: question._id,
      submittedBy: req.userId,
      status: "pending",
      submissionNote: submissionNote || null,
      isAIGenerated: question.isAIGenerated,
      submittedAt: new Date(),
    });
  }

  const adminModel = require("../../models/Admin");
  const admins = await adminModel.find({ isActive: true }).select("_id");

  for (const admin of admins) {
    await Notification.createNotification({
      recipientId: admin._id,
      recipientModel: "Admin",
      recipientRole: "admin",
      senderId: req.userId,
      senderModel: "Teacher",
      ...Notification.templates.newQuestionPending(req.user.name, subject),
    });
  }

  logger.info(
    `Question submitted for approval — Teacher: ${req.userId} — Question: ${question._id}`,
  );

  return successResponse(res, "Question submitted for approval successfully", {
    question: question.getFullQuestion(),
  });
});

exports.getApprovalStatus = catchAsync(async (req, res) => {
  const question = await Question.findOne({
    _id: req.params.id,
    createdBy: req.userId,
  });

  if (!question) {
    return notFoundResponse(res, "Question not found");
  }

  const approval = await QuestionApproval.findOne({ question: question._id })
    .populate("reviewedBy", "name avatar")
    .sort({ createdAt: -1 });

  return successResponse(res, "Approval status retrieved successfully", {
    questionId: question._id,
    questionStatus: question.status,
    approval: approval ? approval.getSummary() : null,
    submissionHistory: approval?.submissionHistory || [],
    revisionRequests: approval?.revisionRequests || [],
  });
});

exports.uploadQuestionImage = catchAsync(async (req, res) => {
  if (!req.file) {
    return errorResponse(res, "Please select an image file to upload", 400);
  }

  const question = await Question.findOne({
    _id: req.params.id,
    createdBy: req.userId,
  });

  if (!question) {
    return notFoundResponse(
      res,
      "Question not found or you do not have permission",
    );
  }

  if (question.imagePublicId) {
    await deleteImage(question.imagePublicId);
  }

  const fileInfo = getFileInfo(req.file);
  const base64Image = `data:${fileInfo.mimeType};base64,${fileInfo.buffer.toString("base64")}`;
  const uploadResult = await uploadImage(base64Image, "heroy/questions");

  if (!uploadResult.success) {
    return errorResponse(res, "Image upload failed. Please try again", 500);
  }

  question.imageUrl = uploadResult.url;
  question.imagePublicId = uploadResult.publicId;
  await question.save({ validateBeforeSave: false });

  logger.info(
    `Question image uploaded — Teacher: ${req.userId} — Question: ${question._id}`,
  );

  return successResponse(res, "Question image uploaded successfully", {
    imageUrl: uploadResult.url,
    question: question.getFullQuestion(),
  });
});
