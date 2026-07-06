const mongoose = require("mongoose");

const AIGenerationLogSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "requestedByModel",
      required: [true, "Requester is required"],
    },
    requestedByModel: {
      type: String,
      enum: ["Teacher", "Admin"],
      required: [true, "Requester model is required"],
    },
    requestedByRole: {
      type: String,
      enum: ["teacher", "admin"],
      required: [true, "Requester role is required"],
    },
    type: {
      type: String,
      enum: [
        "generate_question",
        "generate_quiz",
        "generate_study_tips",
        "explain_answer",
        "analyze_weak_subject",
        "validate_question",
      ],
      required: [true, "Generation type is required"],
    },
    subject: {
      type: String,
      enum: [
        "math",
        "english",
        "biology",
        "chemistry",
        "physics",
        "civics",
        null,
      ],
      default: null,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", null],
      default: null,
    },
    grade: {
      type: String,
      enum: ["Grade 11", "Grade 12", "Both", null],
      default: null,
    },
    topic: {
      type: String,
      default: null,
    },
    prompt: {
      type: String,
      required: [true, "Prompt is required"],
      select: false,
    },
    response: {
      type: String,
      default: null,
      select: false,
    },
    model: {
      type: String,
      default: "claude-sonnet-4-6",
    },
    inputTokens: {
      type: Number,
      default: 0,
    },
    outputTokens: {
      type: Number,
      default: 0,
    },
    totalTokens: {
      type: Number,
      default: 0,
    },
    estimatedCost: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "partial"],
      default: "pending",
    },
    errorMessage: {
      type: String,
      default: null,
    },
    responseTimeMs: {
      type: Number,
      default: 0,
    },
    questionsGenerated: {
      type: Number,
      default: 0,
    },
    questionsRequested: {
      type: Number,
      default: 1,
    },
    questionsApproved: {
      type: Number,
      default: 0,
    },
    questionsRejected: {
      type: Number,
      default: 0,
    },
    generatedQuestionIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],
    wasStreamed: {
      type: Boolean,
      default: false,
    },
    ipAddress: {
      type: String,
      default: null,
    },
    userAgent: {
      type: String,
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── INDEXES ────────────────────────────────────────────────
AIGenerationLogSchema.index({ requestedBy: 1 });
AIGenerationLogSchema.index({ requestedBy: 1, createdAt: -1 });
AIGenerationLogSchema.index({ type: 1 });
AIGenerationLogSchema.index({ subject: 1 });
AIGenerationLogSchema.index({ status: 1 });
AIGenerationLogSchema.index({ createdAt: -1 });
AIGenerationLogSchema.index({ model: 1 });

// ── PRE SAVE HOOKS ─────────────────────────────────────────

// Calculate total tokens and estimated cost
AIGenerationLogSchema.pre("save", function (next) {
  this.totalTokens = this.inputTokens + this.outputTokens;

  // Estimate cost based on Claude Sonnet pricing
  // Input: $3 per million tokens, Output: $15 per million tokens
  const inputCost = (this.inputTokens / 1000000) * 3;
  const outputCost = (this.outputTokens / 1000000) * 15;
  this.estimatedCost = parseFloat((inputCost + outputCost).toFixed(6));

  next();
});

// ── VIRTUALS ───────────────────────────────────────────────

// Success rate for questions
AIGenerationLogSchema.virtual("questionSuccessRate").get(function () {
  if (this.questionsGenerated === 0) return 0;
  return Math.round((this.questionsApproved / this.questionsGenerated) * 100);
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Mark generation as successful
AIGenerationLogSchema.methods.markSuccess = async function (
  response,
  inputTokens,
  outputTokens,
  responseTimeMs,
  questionsGenerated = 0,
) {
  this.status = "success";
  this.response = response;
  this.inputTokens = inputTokens;
  this.outputTokens = outputTokens;
  this.responseTimeMs = responseTimeMs;
  this.questionsGenerated = questionsGenerated;
  await this.save({ validateBeforeSave: false });
};

// Mark generation as failed
AIGenerationLogSchema.methods.markFailed = async function (
  errorMessage,
  responseTimeMs = 0,
) {
  this.status = "failed";
  this.errorMessage = errorMessage;
  this.responseTimeMs = responseTimeMs;
  await this.save({ validateBeforeSave: false });
};

// Add generated question ID
AIGenerationLogSchema.methods.addGeneratedQuestion = async function (
  questionId,
) {
  this.generatedQuestionIds.push(questionId);
  this.questionsGenerated = this.generatedQuestionIds.length;
  await this.save({ validateBeforeSave: false });
};

// ── STATIC METHODS ─────────────────────────────────────────

// Get usage statistics for a teacher
AIGenerationLogSchema.statics.getTeacherStats = function (teacherId) {
  return this.aggregate([
    {
      $match: {
        requestedBy: new mongoose.Types.ObjectId(teacherId),
        status: "success",
      },
    },
    {
      $group: {
        _id: null,
        totalGenerations: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$estimatedCost" },
        totalQuestionsGenerated: { $sum: "$questionsGenerated" },
        avgResponseTime: { $avg: "$responseTimeMs" },
        byType: {
          $push: "$type",
        },
        bySubject: {
          $push: "$subject",
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalGenerations: 1,
        totalTokens: 1,
        totalCost: { $round: ["$totalCost", 4] },
        totalQuestionsGenerated: 1,
        avgResponseTime: { $round: ["$avgResponseTime", 0] },
      },
    },
  ]);
};

// Get monthly usage statistics
AIGenerationLogSchema.statics.getMonthlyStats = function (year, month) {
  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59);

  return this.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate, $lte: endDate },
        status: "success",
      },
    },
    {
      $group: {
        _id: { $dayOfMonth: "$createdAt" },
        totalGenerations: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$estimatedCost" },
        totalQuestions: { $sum: "$questionsGenerated" },
      },
    },
    {
      $addFields: {
        totalCost: { $round: ["$totalCost", 4] },
      },
    },
    { $sort: { _id: 1 } },
  ]);
};

// Get overall platform AI statistics
AIGenerationLogSchema.statics.getPlatformStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalGenerations: { $sum: 1 },
        successfulGenerations: {
          $sum: { $cond: [{ $eq: ["$status", "success"] }, 1, 0] },
        },
        failedGenerations: {
          $sum: { $cond: [{ $eq: ["$status", "failed"] }, 1, 0] },
        },
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$estimatedCost" },
        totalQuestionsGenerated: { $sum: "$questionsGenerated" },
        avgResponseTime: { $avg: "$responseTimeMs" },
      },
    },
    {
      $project: {
        _id: 0,
        totalGenerations: 1,
        successfulGenerations: 1,
        failedGenerations: 1,
        successRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$successfulGenerations", "$totalGenerations"] },
                100,
              ],
            },
            1,
          ],
        },
        totalTokens: 1,
        totalCost: { $round: ["$totalCost", 4] },
        totalQuestionsGenerated: 1,
        avgResponseTime: { $round: ["$avgResponseTime", 0] },
      },
    },
  ]);
};

// Get stats grouped by subject
AIGenerationLogSchema.statics.getStatsBySubject = function () {
  return this.aggregate([
    { $match: { status: "success", subject: { $ne: null } } },
    {
      $group: {
        _id: "$subject",
        totalGenerations: { $sum: 1 },
        totalQuestionsGenerated: { $sum: "$questionsGenerated" },
        totalTokens: { $sum: "$totalTokens" },
        totalCost: { $sum: "$estimatedCost" },
      },
    },
    {
      $addFields: {
        totalCost: { $round: ["$totalCost", 4] },
      },
    },
    { $sort: { totalGenerations: -1 } },
  ]);
};

// Get stats grouped by type
AIGenerationLogSchema.statics.getStatsByType = function () {
  return this.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: "$type",
        totalGenerations: { $sum: 1 },
        totalTokens: { $sum: "$totalTokens" },
        avgResponseTime: { $avg: "$responseTimeMs" },
      },
    },
    {
      $addFields: {
        avgResponseTime: { $round: ["$avgResponseTime", 0] },
      },
    },
    { $sort: { totalGenerations: -1 } },
  ]);
};

// Count generations this month for a teacher
AIGenerationLogSchema.statics.countThisMonth = function (teacherId) {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  return this.countDocuments({
    requestedBy: teacherId,
    status: "success",
    createdAt: { $gte: startOfMonth },
  });
};

module.exports = mongoose.model("AIGenerationLog", AIGenerationLogSchema);
