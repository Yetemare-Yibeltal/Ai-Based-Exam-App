const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
      minlength: [10, "Question text must be at least 10 characters"],
      maxlength: [1000, "Question text cannot exceed 1000 characters"],
    },
    options: {
      type: [String],
      required: [true, "Options are required"],
      validate: {
        validator: function (arr) {
          return arr.length === 4;
        },
        message: "Question must have exactly 4 options",
      },
    },
    correctAnswer: {
      type: Number,
      required: [true, "Correct answer index is required"],
      min: [0, "Correct answer index must be between 0 and 3"],
      max: [3, "Correct answer index must be between 0 and 3"],
    },
    subject: {
      type: String,
      required: [true, "Subject is required"],
      enum: {
        values: [
          "math",
          "english",
          "biology",
          "chemistry",
          "physics",
          "civics",
        ],
        message:
          "Subject must be one of: math, english, biology, chemistry, physics, civics",
      },
      lowercase: true,
    },
    difficulty: {
      type: String,
      enum: {
        values: ["easy", "medium", "hard"],
        message: "Difficulty must be one of: easy, medium, hard",
      },
      default: "medium",
    },
    explanation: {
      type: String,
      trim: true,
      maxlength: [2000, "Explanation cannot exceed 2000 characters"],
      default: null,
    },
    year: {
      type: Number,
      min: [1990, "Year must be after 1990"],
      max: [new Date().getFullYear(), "Year cannot be in the future"],
      default: null,
    },
    grade: {
      type: String,
      enum: ["Grade 11", "Grade 12", "Both"],
      default: "Grade 12",
    },
    topic: {
      type: String,
      trim: true,
      maxlength: [200, "Topic cannot exceed 200 characters"],
      default: null,
    },
    imageUrl: {
      type: String,
      default: null,
    },
    imagePublicId: {
      type: String,
      default: null,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    aiModel: {
      type: String,
      default: null,
    },
    aiPrompt: {
      type: String,
      default: null,
      select: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "draft"],
      default: "pending",
    },
    rejectionReason: {
      type: String,
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    },
    rejectedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Admin",
      default: null,
    },
    rejectedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "createdByModel",
      required: [true, "Question creator is required"],
    },
    createdByModel: {
      type: String,
      enum: ["Teacher", "Admin"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    timesUsed: {
      type: Number,
      default: 0,
    },
    timesAnsweredCorrectly: {
      type: Number,
      default: 0,
    },
    timesAnsweredIncorrectly: {
      type: Number,
      default: 0,
    },
    averageTimeToAnswer: {
      type: Number,
      default: 0,
    },
    reportCount: {
      type: Number,
      default: 0,
    },
    reports: [
      {
        reportedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        reason: {
          type: String,
          enum: [
            "wrong_answer",
            "unclear_question",
            "outdated",
            "duplicate",
            "inappropriate",
            "other",
          ],
        },
        details: { type: String, default: null },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    tags: [
      {
        type: String,
        trim: true,
        maxlength: 50,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── INDEXES ────────────────────────────────────────────────
QuestionSchema.index({ subject: 1 });
QuestionSchema.index({ subject: 1, difficulty: 1 });
QuestionSchema.index({ subject: 1, status: 1 });
QuestionSchema.index({ subject: 1, difficulty: 1, status: 1 });
QuestionSchema.index({ status: 1 });
QuestionSchema.index({ createdBy: 1 });
QuestionSchema.index({ isAIGenerated: 1 });
QuestionSchema.index({ createdAt: -1 });
QuestionSchema.index({ timesUsed: -1 });
QuestionSchema.index({ grade: 1 });
QuestionSchema.index({ topic: 1 });

// ── VIRTUALS ───────────────────────────────────────────────

// Correct answer rate percentage
QuestionSchema.virtual("correctRate").get(function () {
  if (this.timesUsed === 0) return 0;
  return Math.round((this.timesAnsweredCorrectly / this.timesUsed) * 100);
});

// Difficulty based on actual performance
QuestionSchema.virtual("actualDifficulty").get(function () {
  const rate = this.correctRate;
  if (rate >= 70) return "easy";
  if (rate >= 40) return "medium";
  return "hard";
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Get safe question for student (without correct answer)
QuestionSchema.methods.getSafeQuestion = function () {
  return {
    id: this._id,
    questionText: this.questionText,
    options: this.options,
    subject: this.subject,
    difficulty: this.difficulty,
    grade: this.grade,
    topic: this.topic,
    imageUrl: this.imageUrl,
    year: this.year,
    isAIGenerated: this.isAIGenerated,
  };
};

// Get full question with answer (for teacher and admin)
QuestionSchema.methods.getFullQuestion = function () {
  return {
    id: this._id,
    questionText: this.questionText,
    options: this.options,
    correctAnswer: this.correctAnswer,
    subject: this.subject,
    difficulty: this.difficulty,
    explanation: this.explanation,
    grade: this.grade,
    topic: this.topic,
    year: this.year,
    imageUrl: this.imageUrl,
    isAIGenerated: this.isAIGenerated,
    status: this.status,
    timesUsed: this.timesUsed,
    correctRate: this.correctRate,
    tags: this.tags,
    createdAt: this.createdAt,
  };
};

// Update usage statistics
QuestionSchema.methods.updateStats = async function (isCorrect, timeToAnswer) {
  this.timesUsed += 1;

  if (isCorrect) {
    this.timesAnsweredCorrectly += 1;
  } else {
    this.timesAnsweredIncorrectly += 1;
  }

  if (timeToAnswer && timeToAnswer > 0) {
    if (this.averageTimeToAnswer === 0) {
      this.averageTimeToAnswer = timeToAnswer;
    } else {
      this.averageTimeToAnswer = Math.round(
        (this.averageTimeToAnswer * (this.timesUsed - 1) + timeToAnswer) /
          this.timesUsed,
      );
    }
  }

  await this.save({ validateBeforeSave: false });
};

// Approve question
QuestionSchema.methods.approve = async function (adminId) {
  this.status = "approved";
  this.approvedBy = adminId;
  this.approvedAt = new Date();
  this.rejectionReason = null;
  this.rejectedBy = null;
  this.rejectedAt = null;
  await this.save({ validateBeforeSave: false });
};

// Reject question
QuestionSchema.methods.reject = async function (adminId, reason) {
  this.status = "rejected";
  this.rejectedBy = adminId;
  this.rejectedAt = new Date();
  this.rejectionReason = reason;
  this.approvedBy = null;
  this.approvedAt = null;
  await this.save({ validateBeforeSave: false });
};

// Report question
QuestionSchema.methods.addReport = async function (userId, reason, details) {
  this.reports.push({
    reportedBy: userId,
    reason,
    details,
  });
  this.reportCount += 1;

  // Auto flag for review if too many reports
  if (this.reportCount >= 5) {
    this.status = "pending";
  }

  await this.save({ validateBeforeSave: false });
};

// ── STATIC METHODS ─────────────────────────────────────────

// Get random approved questions by subject
QuestionSchema.statics.getRandomBySubject = function (
  subject,
  limit = 20,
  difficulty = null,
) {
  const filter = {
    subject,
    status: "approved",
    isActive: true,
  };

  if (difficulty) {
    filter.difficulty = difficulty;
  }

  return this.aggregate([
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
};

// Get questions by subject with pagination
QuestionSchema.statics.getBySubject = function (subject, options = {}) {
  const filter = { subject, status: "approved", isActive: true };
  const { page = 1, limit = 20, difficulty } = options;

  if (difficulty) filter.difficulty = difficulty;

  return this.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Get pending questions for admin approval
QuestionSchema.statics.getPendingQuestions = function (options = {}) {
  const { page = 1, limit = 20, subject } = options;
  const filter = { status: "pending", isActive: true };

  if (subject) filter.subject = subject;

  return this.find(filter)
    .populate("createdBy", "name email")
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Get questions by teacher
QuestionSchema.statics.getByTeacher = function (teacherId, options = {}) {
  const { page = 1, limit = 20, status } = options;
  const filter = { createdBy: teacherId };

  if (status) filter.status = status;

  return this.find(filter)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 });
};

// Get subject statistics
QuestionSchema.statics.getSubjectStats = function () {
  return this.aggregate([
    { $match: { status: "approved", isActive: true } },
    {
      $group: {
        _id: "$subject",
        total: { $sum: 1 },
        easy: { $sum: { $cond: [{ $eq: ["$difficulty", "easy"] }, 1, 0] } },
        medium: { $sum: { $cond: [{ $eq: ["$difficulty", "medium"] }, 1, 0] } },
        hard: { $sum: { $cond: [{ $eq: ["$difficulty", "hard"] }, 1, 0] } },
        aiGenerated: { $sum: { $cond: ["$isAIGenerated", 1, 0] } },
        avgTimesUsed: { $avg: "$timesUsed" },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

// Check correct answer for a question
QuestionSchema.statics.checkAnswer = async function (
  questionId,
  selectedAnswer,
) {
  const question = await this.findById(questionId).select(
    "correctAnswer explanation options",
  );

  if (!question) return null;

  const isCorrect = question.correctAnswer === selectedAnswer;

  return {
    questionId,
    isCorrect,
    correctAnswer: question.correctAnswer,
    selectedAnswer,
    explanation: question.explanation,
  };
};

module.exports = mongoose.model("Question", QuestionSchema);
