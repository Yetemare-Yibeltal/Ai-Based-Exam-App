const Question = require("../../models/Question");
const QuestionApproval = require("../../models/QuestionApproval");
const Teacher = require("../../models/Teacher");
const Admin = require("../../models/Admin");
const Notification = require("../../models/Notification");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");
const {
  sendQuestionApprovedEmail,
  sendQuestionRejectedEmail,
} = require("../../utils/sendEmail");
const { invalidateQuestionsCache } = require("../../middleware/cache");
const logger = require("../../utils/logger");

exports.getAllQuestions = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const {
    subject,
    status,
    difficulty,
    isAIGenerated,
    search,
    sortBy,
    sortOrder,
  } = req.query;

  const filter = {};
  if (subject) filter.subject = subject.toLowerCase();
  if (status) filter.status = status;
  if (difficulty) filter.difficulty = difficulty;
  if (isAIGenerated !== undefined)
    filter.isAIGenerated = isAIGenerated === "true";
  if (search) {
    filter.$or = [
      { questionText: { $regex: search, $options: "i" } },
      { topic: { $regex: search, $options: "i" } },
    ];
  }

  const sortField = sortBy || "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email avatar")
      .populate("approvedBy", "name")
      .populate("rejectedBy", "name"),
    Question.countDocuments(filter),
  ]);

  return paginatedResponse(
    res,
    "Questions retrieved successfully",
    questions.map((q) => q.getFullQuestion()),
    getPaginationMeta(total, page, limit),
  );
});

exports.getQuestionById = catchAsync(async (req, res) => {
  const question = await Question.findById(req.params.id)
    .populate("createdBy", "name email avatar subject")
    .populate("approvedBy", "name email")
    .populate("rejectedBy", "name email");

  if (!question) return notFoundResponse(res, "Question not found");

  const approval = await QuestionApproval.findOne({ question: question._id })
    .populate("submittedBy", "name email avatar")
    .populate("reviewedBy", "name email")
    .sort({ createdAt: -1 });

  return successResponse(res, "Question retrieved successfully", {
    question: question.getFullQuestion(),
    approval: approval ? approval.getSummary() : null,
  });
});

exports.updateQuestion = catchAsync(async (req, res) => {
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
    status,
  } = req.body;

  const question = await Question.findById(req.params.id);
  if (!question) return notFoundResponse(res, "Question not found");

  if (questionText !== undefined) question.questionText = questionText;
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
  if (status !== undefined) question.status = status;

  await question.save();
  invalidateQuestionsCache();

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "update_question",
    "Question",
    question._id,
    `Updated question in ${question.subject}`,
    req.ip,
  );

  logger.info(
    `Question updated by admin — Question: ${question._id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Question updated successfully", {
    question: question.getFullQuestion(),
  });
});

exports.deleteQuestion = catchAsync(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return notFoundResponse(res, "Question not found");

  await Question.findByIdAndDelete(question._id);
  await QuestionApproval.deleteMany({ question: question._id });

  if (question.createdByModel === "Teacher") {
    await Teacher.findByIdAndUpdate(question.createdBy, {
      $inc: { totalQuestionsCreated: -1 },
    });
  }

  invalidateQuestionsCache();

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "delete_question",
    "Question",
    question._id,
    `Deleted question in ${question.subject}`,
    req.ip,
  );

  logger.info(
    `Question deleted by admin — Question: ${question._id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Question deleted successfully");
});

exports.approveQuestion = catchAsync(async (req, res) => {
  const { note } = req.body;

  const question = await Question.findById(req.params.id);
  if (!question) return notFoundResponse(res, "Question not found");
  if (question.status === "approved")
    return errorResponse(res, "Question is already approved", 400);

  await question.approve(req.userId);

  const approval = await QuestionApproval.findOne({ question: question._id });
  if (approval) await approval.approve(req.userId, note || null);

  if (question.createdByModel === "Teacher") {
    await Teacher.findByIdAndUpdate(question.createdBy, {
      $inc: { totalQuestionsApproved: 1 },
    });

    const teacher = await Teacher.findById(question.createdBy);
    if (teacher) {
      await sendQuestionApprovedEmail(teacher, question);
      await Notification.createNotification({
        recipientId: teacher._id,
        recipientModel: "Teacher",
        recipientRole: "teacher",
        senderId: req.userId,
        senderModel: "Admin",
        ...Notification.templates.questionApproved(question.subject),
      });
    }
  }

  invalidateQuestionsCache();

  const admin = await Admin.findById(req.userId);
  await admin.updateQuestionReviewStats("approved");
  await admin.logActivity(
    "approve_question",
    "Question",
    question._id,
    `Approved question in ${question.subject}`,
    req.ip,
  );

  logger.info(
    `Question approved — Question: ${question._id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Question approved successfully", {
    question: question.getFullQuestion(),
  });
});

exports.rejectQuestion = catchAsync(async (req, res) => {
  const { reason, details } = req.body;

  if (!reason) return errorResponse(res, "Rejection reason is required", 400);

  const question = await Question.findById(req.params.id);
  if (!question) return notFoundResponse(res, "Question not found");
  if (question.status === "rejected")
    return errorResponse(res, "Question is already rejected", 400);

  await question.reject(req.userId, reason);

  const approval = await QuestionApproval.findOne({ question: question._id });
  if (approval) await approval.reject(req.userId, reason, details || null);

  if (question.createdByModel === "Teacher") {
    await Teacher.findByIdAndUpdate(question.createdBy, {
      $inc: { totalQuestionsRejected: 1 },
    });

    const teacher = await Teacher.findById(question.createdBy);
    if (teacher) {
      await sendQuestionRejectedEmail(teacher, question, details || reason);
      await Notification.createNotification({
        recipientId: teacher._id,
        recipientModel: "Teacher",
        recipientRole: "teacher",
        senderId: req.userId,
        senderModel: "Admin",
        ...Notification.templates.questionRejected(
          question.subject,
          details || reason,
        ),
      });
    }
  }

  const admin = await Admin.findById(req.userId);
  await admin.updateQuestionReviewStats("rejected");
  await admin.logActivity(
    "reject_question",
    "Question",
    question._id,
    `Rejected question. Reason: ${reason}`,
    req.ip,
  );

  logger.info(
    `Question rejected — Question: ${question._id} — Admin: ${req.userId} — Reason: ${reason}`,
  );

  return successResponse(res, "Question rejected successfully", {
    question: question.getFullQuestion(),
  });
});

exports.getPendingQuestions = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { subject, isAIGenerated, priority } = req.query;

  const filter = { status: "pending", isActive: true };
  if (subject) filter.subject = subject.toLowerCase();
  if (isAIGenerated !== undefined)
    filter.isAIGenerated = isAIGenerated === "true";

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .populate("createdBy", "name email avatar subject"),
    Question.countDocuments(filter),
  ]);

  return paginatedResponse(
    res,
    "Pending questions retrieved successfully",
    questions.map((q) => q.getFullQuestion()),
    getPaginationMeta(total, page, limit),
  );
});

exports.getQuestionStats = catchAsync(async (req, res) => {
  const [statusStats, subjectStats, difficultyStats, aiStats, weeklyTrend] =
    await Promise.all([
      Question.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
      Question.getSubjectStats(),
      Question.aggregate([
        { $match: { status: "approved" } },
        {
          $group: {
            _id: "$difficulty",
            count: { $sum: 1 },
            avgTimesUsed: { $avg: "$timesUsed" },
          },
        },
        { $addFields: { avgTimesUsed: { $round: ["$avgTimesUsed", 1] } } },
      ]),
      Question.aggregate([
        {
          $group: {
            _id: "$isAIGenerated",
            count: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
          },
        },
      ]),
      Question.aggregate([
        {
          $match: {
            createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
          },
        },
        {
          $group: {
            _id: { $dayOfWeek: "$createdAt" },
            count: { $sum: 1 },
            approved: {
              $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] },
            },
          },
        },
        { $sort: { _id: 1 } },
      ]),
    ]);

  const statusMap = {};
  statusStats.forEach((s) => {
    statusMap[s._id] = s.count;
  });

  const aiMap = {};
  aiStats.forEach((s) => {
    aiMap[s._id ? "aiGenerated" : "manual"] = s;
  });

  return successResponse(res, "Question statistics retrieved successfully", {
    status: {
      total: Object.values(statusMap).reduce((a, b) => a + b, 0),
      approved: statusMap.approved || 0,
      pending: statusMap.pending || 0,
      rejected: statusMap.rejected || 0,
      draft: statusMap.draft || 0,
    },
    bySubject: subjectStats,
    byDifficulty: difficultyStats,
    aiVsManual: {
      aiGenerated: aiMap.aiGenerated?.count || 0,
      aiApproved: aiMap.aiGenerated?.approved || 0,
      manual: aiMap.manual?.count || 0,
      manualApproved: aiMap.manual?.approved || 0,
    },
    weeklyTrend,
  });
});

exports.bulkApprove = catchAsync(async (req, res) => {
  const { questionIds } = req.body;

  if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    return errorResponse(res, "Question IDs array is required", 400);
  }

  if (questionIds.length > 50) {
    return errorResponse(
      res,
      "Cannot bulk approve more than 50 questions at once",
      400,
    );
  }

  const questions = await Question.find({
    _id: { $in: questionIds },
    status: "pending",
  });

  if (questions.length === 0) {
    return errorResponse(
      res,
      "No pending questions found with the provided IDs",
      404,
    );
  }

  let approvedCount = 0;

  for (const question of questions) {
    await question.approve(req.userId);

    const approval = await QuestionApproval.findOne({ question: question._id });
    if (approval) await approval.approve(req.userId, "Bulk approved");

    if (question.createdByModel === "Teacher") {
      await Teacher.findByIdAndUpdate(question.createdBy, {
        $inc: { totalQuestionsApproved: 1 },
      });
    }

    approvedCount++;
  }

  invalidateQuestionsCache();

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "bulk_approve",
    "Question",
    null,
    `Bulk approved ${approvedCount} questions`,
    req.ip,
  );

  logger.info(
    `Bulk approved ${approvedCount} questions — Admin: ${req.userId}`,
  );

  return successResponse(
    res,
    `${approvedCount} questions approved successfully`,
    {
      approvedCount,
      requestedCount: questionIds.length,
    },
  );
});

exports.bulkReject = catchAsync(async (req, res) => {
  const { questionIds, reason } = req.body;

  if (!questionIds || !Array.isArray(questionIds) || questionIds.length === 0) {
    return errorResponse(res, "Question IDs array is required", 400);
  }

  if (!reason)
    return errorResponse(
      res,
      "Rejection reason is required for bulk reject",
      400,
    );

  if (questionIds.length > 50) {
    return errorResponse(
      res,
      "Cannot bulk reject more than 50 questions at once",
      400,
    );
  }

  const questions = await Question.find({
    _id: { $in: questionIds },
    status: "pending",
  });

  if (questions.length === 0) {
    return errorResponse(
      res,
      "No pending questions found with the provided IDs",
      404,
    );
  }

  let rejectedCount = 0;

  for (const question of questions) {
    await question.reject(req.userId, reason);

    const approval = await QuestionApproval.findOne({ question: question._id });
    if (approval) await approval.reject(req.userId, reason, null);

    if (question.createdByModel === "Teacher") {
      await Teacher.findByIdAndUpdate(question.createdBy, {
        $inc: { totalQuestionsRejected: 1 },
      });
    }

    rejectedCount++;
  }

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "bulk_reject",
    "Question",
    null,
    `Bulk rejected ${rejectedCount} questions. Reason: ${reason}`,
    req.ip,
  );

  logger.info(
    `Bulk rejected ${rejectedCount} questions — Admin: ${req.userId}`,
  );

  return successResponse(
    res,
    `${rejectedCount} questions rejected successfully`,
    {
      rejectedCount,
      requestedCount: questionIds.length,
    },
  );
});

exports.featureQuestion = catchAsync(async (req, res) => {
  const question = await Question.findById(req.params.id);
  if (!question) return notFoundResponse(res, "Question not found");

  if (question.status !== "approved") {
    return errorResponse(res, "Only approved questions can be featured", 400);
  }

  question.tags = question.tags || [];
  const isFeatured = question.tags.includes("featured");

  if (isFeatured) {
    question.tags = question.tags.filter((t) => t !== "featured");
  } else {
    question.tags.push("featured");
  }

  await question.save({ validateBeforeSave: false });

  return successResponse(
    res,
    isFeatured
      ? "Question unfeatured successfully"
      : "Question featured successfully",
    { question: question.getFullQuestion() },
  );
});
