const Teacher = require("../../models/Teacher");
const Question = require("../../models/Question");
const QuestionApproval = require("../../models/QuestionApproval");
const AIGenerationLog = require("../../models/AIGenerationLog");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
} = require("../../utils/apiResponse");
const { uploadImage, deleteImage } = require("../../config/cloudinary");
const { getFileInfo } = require("../../middleware/upload");
const logger = require("../../utils/logger");

exports.getProfile = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.userId);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  const [questionStats, approvalStats] = await Promise.all([
    Question.aggregate([
      { $match: { createdBy: teacher._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
    QuestionApproval.aggregate([
      { $match: { submittedBy: teacher._id } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const questionStatsMap = {};
  questionStats.forEach((s) => {
    questionStatsMap[s._id] = s.count;
  });

  const approvalStatsMap = {};
  approvalStats.forEach((s) => {
    approvalStatsMap[s._id] = s.count;
  });

  return successResponse(res, "Profile retrieved successfully", {
    teacher: teacher.getPublicProfile(),
    questionStats: {
      total: teacher.totalQuestionsCreated,
      draft: questionStatsMap.draft || 0,
      pending: questionStatsMap.pending || 0,
      approved: questionStatsMap.approved || 0,
      rejected: questionStatsMap.rejected || 0,
    },
    approvalStats: {
      pending: approvalStatsMap.pending || 0,
      approved: approvalStatsMap.approved || 0,
      rejected: approvalStatsMap.rejected || 0,
      revisionRequested: approvalStatsMap.revision_requested || 0,
    },
    aiStats: {
      totalGenerations: teacher.totalAIGenerations,
      thisMonth: teacher.aiGenerationsThisMonth,
      monthlyLimit: 100,
      remaining: Math.max(0, 100 - teacher.aiGenerationsThisMonth),
      approvalRate: teacher.approvalRate,
    },
  });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const {
    name,
    phone,
    bio,
    school,
    experience,
    qualification,
    subjects,
    preferredLanguage,
    socialLinks,
    notificationsEnabled,
    emailNotificationsEnabled,
  } = req.body;

  const teacher = await Teacher.findById(req.userId);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  if (name !== undefined) teacher.name = name;
  if (phone !== undefined) teacher.phone = phone;
  if (bio !== undefined) teacher.bio = bio;
  if (school !== undefined) teacher.school = school;
  if (experience !== undefined) teacher.experience = experience;
  if (qualification !== undefined) teacher.qualification = qualification;
  if (subjects !== undefined) teacher.subjects = subjects;
  if (preferredLanguage !== undefined)
    teacher.preferredLanguage = preferredLanguage;
  if (socialLinks !== undefined)
    teacher.socialLinks = { ...teacher.socialLinks, ...socialLinks };
  if (notificationsEnabled !== undefined)
    teacher.notificationsEnabled = notificationsEnabled;
  if (emailNotificationsEnabled !== undefined)
    teacher.emailNotificationsEnabled = emailNotificationsEnabled;

  await teacher.save({ validateBeforeSave: false });

  logger.info(`Teacher profile updated — Teacher: ${req.userId}`);

  return successResponse(res, "Profile updated successfully", {
    teacher: teacher.getPublicProfile(),
  });
});

exports.uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) return errorResponse(res, "Please select an image file", 400);

  const teacher = await Teacher.findById(req.userId);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  if (teacher.avatarPublicId) await deleteImage(teacher.avatarPublicId);

  const fileInfo = getFileInfo(req.file);
  const base64Image = `data:${fileInfo.mimeType};base64,${fileInfo.buffer.toString("base64")}`;
  const uploadResult = await uploadImage(base64Image, "heroy/avatars/teachers");

  if (!uploadResult.success)
    return errorResponse(res, "Image upload failed. Please try again", 500);

  teacher.avatar = uploadResult.url;
  teacher.avatarPublicId = uploadResult.publicId;
  await teacher.save({ validateBeforeSave: false });

  logger.info(`Teacher avatar uploaded — Teacher: ${req.userId}`);

  return successResponse(res, "Avatar uploaded successfully", {
    avatar: uploadResult.url,
    teacher: teacher.getPublicProfile(),
  });
});

exports.deleteAvatar = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.userId);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  if (!teacher.avatar || !teacher.avatarPublicId) {
    return errorResponse(res, "No avatar to delete", 400);
  }

  await deleteImage(teacher.avatarPublicId);

  teacher.avatar = null;
  teacher.avatarPublicId = null;
  await teacher.save({ validateBeforeSave: false });

  logger.info(`Teacher avatar deleted — Teacher: ${req.userId}`);

  return successResponse(res, "Avatar deleted successfully", {
    teacher: teacher.getPublicProfile(),
  });
});

exports.getMyStats = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.userId).select(
    "totalQuestionsCreated totalQuestionsApproved totalQuestionsRejected totalAIGenerations aiGenerationsThisMonth approvalRate rating createdAt",
  );

  if (!teacher) return notFoundResponse(res, "Teacher not found");

  const subjectBreakdown = await Question.aggregate([
    { $match: { createdBy: teacher._id, status: "approved" } },
    {
      $group: {
        _id: "$subject",
        count: { $sum: 1 },
        aiGenerated: { $sum: { $cond: ["$isAIGenerated", 1, 0] } },
        avgTimesUsed: { $avg: "$timesUsed" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const recentActivity = await QuestionApproval.find({
    submittedBy: teacher._id,
  })
    .populate("question", "questionText subject status")
    .sort({ createdAt: -1 })
    .limit(10);

  const monthlyCreation = await Question.aggregate([
    { $match: { createdBy: teacher._id } },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
        },
        count: { $sum: 1 },
        approved: { $sum: { $cond: [{ $eq: ["$status", "approved"] }, 1, 0] } },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);

  return successResponse(res, "Teacher statistics retrieved successfully", {
    overview: {
      totalQuestionsCreated: teacher.totalQuestionsCreated,
      totalQuestionsApproved: teacher.totalQuestionsApproved,
      totalQuestionsRejected: teacher.totalQuestionsRejected,
      approvalRate: teacher.approvalRate,
      totalAIGenerations: teacher.totalAIGenerations,
      rating: teacher.rating,
      memberSince: teacher.createdAt,
    },
    subjectBreakdown,
    recentActivity: recentActivity.map((a) => ({
      questionId: a.question?._id,
      questionText: a.question?.questionText?.slice(0, 80) + "...",
      subject: a.question?.subject,
      status: a.status,
      submittedAt: a.submittedAt,
      reviewedAt: a.reviewedAt,
    })),
    monthlyCreation: monthlyCreation.reverse(),
  });
});

exports.getMyAIUsage = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.userId).select(
    "totalAIGenerations aiGenerationsThisMonth aiGenerationsResetDate",
  );

  if (!teacher) return notFoundResponse(res, "Teacher not found");

  const aiLogs = await AIGenerationLog.find({
    requestedBy: req.userId,
    status: "success",
  })
    .sort({ createdAt: -1 })
    .limit(20)
    .select("-prompt -response");

  const usageByType = await AIGenerationLog.aggregate([
    { $match: { requestedBy: teacher._id, status: "success" } },
    {
      $group: {
        _id: "$type",
        count: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$estimatedCost" },
        totalQuestions: { $sum: "$questionsGenerated" },
      },
    },
    { $addFields: { totalCost: { $round: ["$totalCost", 4] } } },
    { $sort: { count: -1 } },
  ]);

  const usageBySubject = await AIGenerationLog.aggregate([
    {
      $match: {
        requestedBy: teacher._id,
        status: "success",
        subject: { $ne: null },
      },
    },
    {
      $group: {
        _id: "$subject",
        count: { $sum: 1 },
        totalQuestions: { $sum: "$questionsGenerated" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  return successResponse(res, "AI usage retrieved successfully", {
    summary: {
      totalGenerations: teacher.totalAIGenerations,
      thisMonth: teacher.aiGenerationsThisMonth,
      monthlyLimit: 100,
      remaining: Math.max(0, 100 - teacher.aiGenerationsThisMonth),
      resetDate: teacher.aiGenerationsResetDate,
    },
    usageByType,
    usageBySubject,
    recentLogs: aiLogs,
  });
});
