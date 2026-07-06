const mongoose = require("mongoose");

const QuestionApprovalSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question is required"],
    },
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: [true, "Submitter is required"],
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "revision_requested"],
      default: "pending",
    },
    submissionNote: {
      type: String,
      trim: true,
      maxlength: [500, "Submission note cannot exceed 500 characters"],
      default: null,
    },
    reviewNote: {
      type: String,
      trim: true,
      maxlength: [1000, "Review note cannot exceed 1000 characters"],
      default: null,
    },
    rejectionReason: {
      type: String,
      enum: [
        "wrong_answer",
        "unclear_question",
        "duplicate_question",
        "not_curriculum_aligned",
        "poor_quality",
        "inappropriate_content",
        "incorrect_difficulty",
        "missing_explanation",
        "other",
        null,
      ],
      default: null,
    },
    rejectionDetails: {
      type: String,
      trim: true,
      maxlength: [500, "Rejection details cannot exceed 500 characters"],
      default: null,
    },
    revisionRequests: [
      {
        requestedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Admin",
        },
        requestNote: {
          type: String,
          trim: true,
          maxlength: [500, "Request note cannot exceed 500 characters"],
        },
        requestedAt: {
          type: Date,
          default: Date.now,
        },
        resolvedAt: {
          type: Date,
          default: null,
        },
        isResolved: {
          type: Boolean,
          default: false,
        },
      },
    ],
    submissionHistory: [
      {
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["pending", "approved", "rejected", "revision_requested"],
        },
        changedBy: {
          type: mongoose.Schema.Types.ObjectId,
          refPath: "submissionHistory.changedByModel",
        },
        changedByModel: {
          type: String,
          enum: ["Teacher", "Admin"],
        },
        note: {
          type: String,
          default: null,
        },
      },
    ],
    priority: {
      type: String,
      enum: ["low", "normal", "high"],
      default: "normal",
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    aiConfidenceScore: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },
    reviewedAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    timeToReview: {
      type: Number,
      default: null,
    },
    notificationSent: {
      type: Boolean,
      default: false,
    },
    notificationSentAt: {
      type: Date,
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
QuestionApprovalSchema.index({ question: 1 });
QuestionApprovalSchema.index({ submittedBy: 1 });
QuestionApprovalSchema.index({ reviewedBy: 1 });
QuestionApprovalSchema.index({ status: 1 });
QuestionApprovalSchema.index({ status: 1, createdAt: -1 });
QuestionApprovalSchema.index({ submittedBy: 1, status: 1 });
QuestionApprovalSchema.index({ createdAt: -1 });
QuestionApprovalSchema.index({ priority: 1, status: 1 });

// ── VIRTUALS ───────────────────────────────────────────────

// Days since submission
QuestionApprovalSchema.virtual("daysSinceSubmission").get(function () {
  const diff = new Date() - this.submittedAt;
  return Math.floor(diff / (1000 * 60 * 60 * 24));
});

// Is overdue — pending for more than 3 days
QuestionApprovalSchema.virtual("isOverdue").get(function () {
  if (this.status !== "pending") return false;
  return this.daysSinceSubmission > 3;
});

// ── PRE SAVE HOOKS ─────────────────────────────────────────

// Track status changes in history
QuestionApprovalSchema.pre("save", function (next) {
  if (this.isModified("status") && !this.isNew) {
    this.submissionHistory.push({
      submittedAt: new Date(),
      status: this.status,
      note: this.reviewNote || this.rejectionDetails || null,
    });
  }

  // Calculate time to review when reviewed
  if (this.isModified("reviewedAt") && this.reviewedAt) {
    const diff = this.reviewedAt - this.submittedAt;
    this.timeToReview = Math.round(diff / (1000 * 60));
  }

  next();
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Approve the question
QuestionApprovalSchema.methods.approve = async function (adminId, note = null) {
  this.status = "approved";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.reviewNote = note;

  this.submissionHistory.push({
    submittedAt: new Date(),
    status: "approved",
    changedBy: adminId,
    changedByModel: "Admin",
    note,
  });

  await this.save({ validateBeforeSave: false });
};

// Reject the question
QuestionApprovalSchema.methods.reject = async function (
  adminId,
  reason,
  details = null,
) {
  this.status = "rejected";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();
  this.rejectionReason = reason;
  this.rejectionDetails = details;

  this.submissionHistory.push({
    submittedAt: new Date(),
    status: "rejected",
    changedBy: adminId,
    changedByModel: "Admin",
    note: details,
  });

  await this.save({ validateBeforeSave: false });
};

// Request revision from teacher
QuestionApprovalSchema.methods.requestRevision = async function (
  adminId,
  requestNote,
) {
  this.status = "revision_requested";
  this.reviewedBy = adminId;
  this.reviewedAt = new Date();

  this.revisionRequests.push({
    requestedBy: adminId,
    requestNote,
    requestedAt: new Date(),
  });

  this.submissionHistory.push({
    submittedAt: new Date(),
    status: "revision_requested",
    changedBy: adminId,
    changedByModel: "Admin",
    note: requestNote,
  });

  await this.save({ validateBeforeSave: false });
};

// Mark notification as sent
QuestionApprovalSchema.methods.markNotificationSent = async function () {
  this.notificationSent = true;
  this.notificationSentAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Get approval summary
QuestionApprovalSchema.methods.getSummary = function () {
  return {
    id: this._id,
    question: this.question,
    submittedBy: this.submittedBy,
    status: this.status,
    priority: this.priority,
    isAIGenerated: this.isAIGenerated,
    submittedAt: this.submittedAt,
    reviewedAt: this.reviewedAt,
    daysSinceSubmission: this.daysSinceSubmission,
    isOverdue: this.isOverdue,
    reviewNote: this.reviewNote,
    rejectionReason: this.rejectionReason,
    rejectionDetails: this.rejectionDetails,
    timeToReview: this.timeToReview,
  };
};

// ── STATIC METHODS ─────────────────────────────────────────

// Get pending approvals with pagination
QuestionApprovalSchema.statics.getPending = function (options = {}) {
  const { page = 1, limit = 20, priority, isAIGenerated } = options;
  const filter = { status: "pending" };

  if (priority) filter.priority = priority;
  if (isAIGenerated !== undefined) filter.isAIGenerated = isAIGenerated;

  return this.find(filter)
    .populate(
      "question",
      "questionText subject difficulty options correctAnswer explanation isAIGenerated",
    )
    .populate("submittedBy", "name email subject avatar")
    .sort({ priority: -1, submittedAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Get approvals by teacher
QuestionApprovalSchema.statics.getByTeacher = function (
  teacherId,
  options = {},
) {
  const { page = 1, limit = 20, status } = options;
  const filter = { submittedBy: teacherId };

  if (status) filter.status = status;

  return this.find(filter)
    .populate("question", "questionText subject difficulty status")
    .populate("reviewedBy", "name avatar")
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Get overdue pending approvals
QuestionApprovalSchema.statics.getOverdue = function () {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);

  return this.find({
    status: "pending",
    submittedAt: { $lt: threeDaysAgo },
  })
    .populate("question", "questionText subject difficulty")
    .populate("submittedBy", "name email")
    .sort({ submittedAt: 1 });
};

// Get approval statistics
QuestionApprovalSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgTimeToReview: { $avg: "$timeToReview" },
        aiGeneratedCount: {
          $sum: { $cond: ["$isAIGenerated", 1, 0] },
        },
      },
    },
    {
      $addFields: {
        avgTimeToReview: { $round: ["$avgTimeToReview", 0] },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

// Get admin review statistics
QuestionApprovalSchema.statics.getAdminReviewStats = function (adminId) {
  return this.aggregate([
    {
      $match: {
        reviewedBy: new mongoose.Types.ObjectId(adminId),
        status: { $in: ["approved", "rejected"] },
      },
    },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
        avgTimeToReview: { $avg: "$timeToReview" },
      },
    },
    {
      $addFields: {
        avgTimeToReview: { $round: ["$avgTimeToReview", 0] },
      },
    },
  ]);
};

// Count pending approvals
QuestionApprovalSchema.statics.countPending = function () {
  return this.countDocuments({ status: "pending" });
};

// Count approvals by teacher
QuestionApprovalSchema.statics.countByTeacher = function (teacherId, status) {
  const filter = { submittedBy: teacherId };
  if (status) filter.status = status;
  return this.countDocuments(filter);
};

module.exports = mongoose.model("QuestionApproval", QuestionApprovalSchema);
