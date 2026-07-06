const mongoose = require("mongoose");

const ScoreSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
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
    totalQuestions: {
      type: Number,
      required: [true, "Total questions is required"],
      min: [1, "Total questions must be at least 1"],
      max: [100, "Total questions cannot exceed 100"],
    },
    correctAnswers: {
      type: Number,
      required: [true, "Correct answers count is required"],
      min: [0, "Correct answers cannot be negative"],
      validate: {
        validator: function (value) {
          return value <= this.totalQuestions;
        },
        message: "Correct answers cannot exceed total questions",
      },
    },
    wrongAnswers: {
      type: Number,
      default: 0,
    },
    skippedAnswers: {
      type: Number,
      default: 0,
    },
    percentage: {
      type: Number,
      required: [true, "Percentage is required"],
      min: [0, "Percentage cannot be negative"],
      max: [100, "Percentage cannot exceed 100"],
    },
    grade: {
      type: String,
      enum: ["A+", "A", "B+", "B", "C+", "C", "D", "F"],
      default: null,
    },
    timeTaken: {
      type: Number,
      default: 0,
      min: [0, "Time taken cannot be negative"],
    },
    averageTimePerQuestion: {
      type: Number,
      default: 0,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "mixed"],
      default: "mixed",
    },
    answers: [
      {
        questionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
          required: true,
        },
        selectedAnswer: {
          type: Number,
          required: true,
          min: 0,
          max: 3,
        },
        correctAnswer: {
          type: Number,
          required: true,
          min: 0,
          max: 3,
        },
        isCorrect: {
          type: Boolean,
          required: true,
        },
        timeToAnswer: {
          type: Number,
          default: 0,
        },
      },
    ],
    isPerfectScore: {
      type: Boolean,
      default: false,
    },
    isPassingScore: {
      type: Boolean,
      default: false,
    },
    rank: {
      type: Number,
      default: null,
    },
    feedback: {
      type: String,
      default: null,
    },
    aiFeedback: {
      type: String,
      default: null,
    },
    aiStudyTips: [
      {
        type: String,
      },
    ],
    weakTopics: [
      {
        type: String,
      },
    ],
    strongTopics: [
      {
        type: String,
      },
    ],
    sessionId: {
      type: String,
      default: null,
    },
    deviceInfo: {
      type: String,
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
ScoreSchema.index({ userId: 1 });
ScoreSchema.index({ userId: 1, subject: 1 });
ScoreSchema.index({ userId: 1, createdAt: -1 });
ScoreSchema.index({ subject: 1 });
ScoreSchema.index({ percentage: -1 });
ScoreSchema.index({ createdAt: -1 });
ScoreSchema.index({ isPerfectScore: 1 });

// ── PRE SAVE HOOKS ─────────────────────────────────────────

// Calculate derived fields before saving
ScoreSchema.pre("save", function (next) {
  // Calculate wrong answers
  this.wrongAnswers =
    this.totalQuestions - this.correctAnswers - this.skippedAnswers;
  if (this.wrongAnswers < 0) this.wrongAnswers = 0;

  // Calculate average time per question
  if (this.timeTaken > 0 && this.totalQuestions > 0) {
    this.averageTimePerQuestion = Math.round(
      this.timeTaken / this.totalQuestions,
    );
  }

  // Calculate percentage
  this.percentage = Math.round(
    (this.correctAnswers / this.totalQuestions) * 100,
  );

  // Set grade based on percentage
  if (this.percentage >= 95) this.grade = "A+";
  else if (this.percentage >= 85) this.grade = "A";
  else if (this.percentage >= 75) this.grade = "B+";
  else if (this.percentage >= 65) this.grade = "B";
  else if (this.percentage >= 55) this.grade = "C+";
  else if (this.percentage >= 50) this.grade = "C";
  else if (this.percentage >= 40) this.grade = "D";
  else this.grade = "F";

  // Set flags
  this.isPerfectScore = this.percentage === 100;
  this.isPassingScore = this.percentage >= 50;

  // Generate feedback message
  if (this.percentage >= 90) {
    this.feedback =
      "Excellent performance! You are very well prepared for the exam.";
  } else if (this.percentage >= 75) {
    this.feedback = "Great job! Keep practicing to reach an even higher score.";
  } else if (this.percentage >= 60) {
    this.feedback =
      "Good effort! Focus on your weak areas to improve your score.";
  } else if (this.percentage >= 50) {
    this.feedback =
      "You passed but there is room for improvement. Keep studying!";
  } else {
    this.feedback =
      "Keep practicing! Review the topics you missed and try again.";
  }

  next();
});

// ── VIRTUALS ───────────────────────────────────────────────

// Formatted time taken
ScoreSchema.virtual("formattedTime").get(function () {
  if (!this.timeTaken) return "0:00";
  const minutes = Math.floor(this.timeTaken / 60);
  const seconds = this.timeTaken % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
});

// Performance level
ScoreSchema.virtual("performanceLevel").get(function () {
  if (this.percentage >= 90) return "Excellent";
  if (this.percentage >= 75) return "Good";
  if (this.percentage >= 60) return "Average";
  if (this.percentage >= 50) return "Below Average";
  return "Poor";
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Get score summary
ScoreSchema.methods.getSummary = function () {
  return {
    id: this._id,
    subject: this.subject,
    totalQuestions: this.totalQuestions,
    correctAnswers: this.correctAnswers,
    wrongAnswers: this.wrongAnswers,
    percentage: this.percentage,
    grade: this.grade,
    timeTaken: this.timeTaken,
    formattedTime: this.formattedTime,
    performanceLevel: this.performanceLevel,
    isPerfectScore: this.isPerfectScore,
    isPassingScore: this.isPassingScore,
    feedback: this.feedback,
    aiFeedback: this.aiFeedback,
    aiStudyTips: this.aiStudyTips,
    weakTopics: this.weakTopics,
    strongTopics: this.strongTopics,
    createdAt: this.createdAt,
  };
};

// ── STATIC METHODS ─────────────────────────────────────────

// Get user scores by subject
ScoreSchema.statics.getByUserAndSubject = function (
  userId,
  subject,
  limit = 10,
) {
  return this.find({ userId, subject })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("-answers");
};

// Get user subject statistics
ScoreSchema.statics.getUserSubjectStats = function (userId) {
  return this.aggregate([
    { $match: { userId: new mongoose.Types.ObjectId(userId) } },
    {
      $group: {
        _id: "$subject",
        avgScore: { $avg: "$percentage" },
        bestScore: { $max: "$percentage" },
        lowestScore: { $min: "$percentage" },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: "$correctAnswers" },
        totalQuestions: { $sum: "$totalQuestions" },
        totalTimeTaken: { $sum: "$timeTaken" },
        perfectScores: { $sum: { $cond: ["$isPerfectScore", 1, 0] } },
        passedQuizzes: { $sum: { $cond: ["$isPassingScore", 1, 0] } },
      },
    },
    {
      $addFields: {
        avgScore: { $round: ["$avgScore", 1] },
        passRate: {
          $round: [
            {
              $multiply: [
                { $divide: ["$passedQuizzes", "$totalAttempts"] },
                100,
              ],
            },
            1,
          ],
        },
        overallAccuracy: {
          $round: [
            {
              $multiply: [
                { $divide: ["$totalCorrect", "$totalQuestions"] },
                100,
              ],
            },
            1,
          ],
        },
      },
    },
    { $sort: { avgScore: -1 } },
  ]);
};

// Get leaderboard for a subject
ScoreSchema.statics.getSubjectLeaderboard = function (subject, limit = 10) {
  return this.aggregate([
    { $match: { subject } },
    {
      $group: {
        _id: "$userId",
        avgScore: { $avg: "$percentage" },
        bestScore: { $max: "$percentage" },
        totalAttempts: { $sum: 1 },
      },
    },
    { $sort: { avgScore: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        avatar: "$user.avatar",
        grade: "$user.grade",
        school: "$user.school",
        avgScore: { $round: ["$avgScore", 1] },
        bestScore: 1,
        totalAttempts: 1,
      },
    },
  ]);
};

// Get global leaderboard
ScoreSchema.statics.getGlobalLeaderboard = function (limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: "$userId",
        avgScore: { $avg: "$percentage" },
        bestScore: { $max: "$percentage" },
        totalAttempts: { $sum: 1 },
        totalCorrect: { $sum: "$correctAnswers" },
        totalQuestions: { $sum: "$totalQuestions" },
      },
    },
    {
      $addFields: {
        avgScore: { $round: ["$avgScore", 1] },
        accuracy: {
          $round: [
            {
              $multiply: [
                { $divide: ["$totalCorrect", "$totalQuestions"] },
                100,
              ],
            },
            1,
          ],
        },
      },
    },
    { $sort: { avgScore: -1, totalAttempts: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "user",
      },
    },
    { $unwind: "$user" },
    {
      $project: {
        name: "$user.name",
        avatar: "$user.avatar",
        grade: "$user.grade",
        school: "$user.school",
        avgScore: 1,
        bestScore: 1,
        totalAttempts: 1,
        accuracy: 1,
      },
    },
  ]);
};

// Get overall platform statistics
ScoreSchema.statics.getPlatformStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalQuizzesTaken: { $sum: 1 },
        avgScore: { $avg: "$percentage" },
        totalCorrectAnswers: { $sum: "$correctAnswers" },
        totalQuestionsAnswered: { $sum: "$totalQuestions" },
        perfectScores: { $sum: { $cond: ["$isPerfectScore", 1, 0] } },
      },
    },
    {
      $project: {
        _id: 0,
        totalQuizzesTaken: 1,
        avgScore: { $round: ["$avgScore", 1] },
        totalCorrectAnswers: 1,
        totalQuestionsAnswered: 1,
        perfectScores: 1,
        overallAccuracy: {
          $round: [
            {
              $multiply: [
                {
                  $divide: ["$totalCorrectAnswers", "$totalQuestionsAnswered"],
                },
                100,
              ],
            },
            1,
          ],
        },
      },
    },
  ]);
};

// Get recent scores for a user
ScoreSchema.statics.getRecentScores = function (userId, limit = 5) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select("-answers");
};

// Get score progress over time
ScoreSchema.statics.getProgressOverTime = function (
  userId,
  subject,
  days = 30,
) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  return this.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        subject,
        createdAt: { $gte: startDate },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: "$createdAt" },
          month: { $month: "$createdAt" },
          day: { $dayOfMonth: "$createdAt" },
        },
        avgScore: { $avg: "$percentage" },
        attempts: { $sum: 1 },
        date: { $first: "$createdAt" },
      },
    },
    {
      $addFields: {
        avgScore: { $round: ["$avgScore", 1] },
      },
    },
    { $sort: { date: 1 } },
  ]);
};

module.exports = mongoose.model("Score", ScoreSchema);
