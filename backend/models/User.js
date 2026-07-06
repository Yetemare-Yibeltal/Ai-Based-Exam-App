const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please provide a valid email address"],
      maxlength: [100, "Email cannot exceed 100 characters"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false,
    },
    role: {
      type: String,
      enum: ["student"],
      default: "student",
    },
    grade: {
      type: String,
      enum: ["Grade 11", "Grade 12"],
      default: "Grade 12",
    },
    school: {
      type: String,
      trim: true,
      maxlength: [100, "School name cannot exceed 100 characters"],
      default: "Not specified",
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    avatar: {
      type: String,
      default: null,
    },
    avatarPublicId: {
      type: String,
      default: null,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBanned: {
      type: Boolean,
      default: false,
    },
    banReason: {
      type: String,
      default: null,
    },
    emailVerificationOTP: {
      type: String,
      default: null,
      select: false,
    },
    emailVerificationOTPExpiry: {
      type: Date,
      default: null,
      select: false,
    },
    passwordResetOTP: {
      type: String,
      default: null,
      select: false,
    },
    passwordResetOTPExpiry: {
      type: Date,
      default: null,
      select: false,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    lastLoginIP: {
      type: String,
      default: null,
    },
    loginCount: {
      type: Number,
      default: 0,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    totalQuizzesTaken: {
      type: Number,
      default: 0,
    },
    totalCorrectAnswers: {
      type: Number,
      default: 0,
    },
    totalQuestionsAnswered: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    bestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    favoriteSubject: {
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
    weakSubjects: [
      {
        type: String,
        enum: ["math", "english", "biology", "chemistry", "physics", "civics"],
      },
    ],
    studyStreak: {
      type: Number,
      default: 0,
    },
    lastStudyDate: {
      type: Date,
      default: null,
    },
    notificationsEnabled: {
      type: Boolean,
      default: true,
    },
    emailNotificationsEnabled: {
      type: Boolean,
      default: true,
    },
    preferredLanguage: {
      type: String,
      enum: ["en", "am"],
      default: "en",
    },
    bio: {
      type: String,
      maxlength: [300, "Bio cannot exceed 300 characters"],
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
UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ averageScore: -1 });
UserSchema.index({ totalQuizzesTaken: -1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ grade: 1 });

// ── VIRTUALS ───────────────────────────────────────────────

// Full profile URL
UserSchema.virtual("profileUrl").get(function () {
  return (
    this.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=1B3A6B&color=ffffff&size=200`
  );
});

// Accuracy percentage
UserSchema.virtual("accuracy").get(function () {
  if (this.totalQuestionsAnswered === 0) return 0;
  return Math.round(
    (this.totalCorrectAnswers / this.totalQuestionsAnswered) * 100,
  );
});

// ── PRE SAVE HOOKS ─────────────────────────────────────────

// Hash password before saving
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// Update average score before saving
UserSchema.pre("save", function (next) {
  if (this.totalQuestionsAnswered > 0) {
    this.averageScore = Math.round(
      (this.totalCorrectAnswers / this.totalQuestionsAnswered) * 100,
    );
  }
  next();
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Compare entered password with hashed password
UserSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password was changed after JWT was issued
UserSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Get public profile (safe to send to client)
UserSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    grade: this.grade,
    school: this.school,
    avatar: this.profileUrl,
    isEmailVerified: this.isEmailVerified,
    totalQuizzesTaken: this.totalQuizzesTaken,
    averageScore: this.averageScore,
    bestScore: this.bestScore,
    accuracy: this.accuracy,
    studyStreak: this.studyStreak,
    favoriteSubject: this.favoriteSubject,
    weakSubjects: this.weakSubjects,
    preferredLanguage: this.preferredLanguage,
    bio: this.bio,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

// Update login info
UserSchema.methods.updateLoginInfo = async function (ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIP = ip;
  this.loginCount += 1;
  await this.save({ validateBeforeSave: false });
};

// Update study streak
UserSchema.methods.updateStudyStreak = async function () {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!this.lastStudyDate) {
    this.studyStreak = 1;
    this.lastStudyDate = today;
  } else {
    const lastStudy = new Date(this.lastStudyDate);
    lastStudy.setHours(0, 0, 0, 0);

    const diffDays = Math.floor((today - lastStudy) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day — no change
    } else if (diffDays === 1) {
      // Consecutive day — increment streak
      this.studyStreak += 1;
      this.lastStudyDate = today;
    } else {
      // Streak broken
      this.studyStreak = 1;
      this.lastStudyDate = today;
    }
  }

  await this.save({ validateBeforeSave: false });
};

// Update quiz statistics after completing a quiz
UserSchema.methods.updateQuizStats = async function (
  correctAnswers,
  totalQuestions,
  score,
) {
  this.totalQuizzesTaken += 1;
  this.totalCorrectAnswers += correctAnswers;
  this.totalQuestionsAnswered += totalQuestions;

  if (score > this.bestScore) {
    this.bestScore = score;
  }

  this.averageScore = Math.round(
    (this.totalCorrectAnswers / this.totalQuestionsAnswered) * 100,
  );

  await this.updateStudyStreak();
  await this.save({ validateBeforeSave: false });
};

// ── STATIC METHODS ─────────────────────────────────────────

// Find user by email
UserSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find active users
UserSchema.statics.findActiveUsers = function () {
  return this.find({ isActive: true, isBanned: false });
};

// Get leaderboard
UserSchema.statics.getLeaderboard = function (limit = 10) {
  return this.find({ isActive: true, isBanned: false })
    .sort({ averageScore: -1, totalQuizzesTaken: -1 })
    .limit(limit)
    .select(
      "name avatar grade school averageScore bestScore totalQuizzesTaken studyStreak",
    );
};

// Get total student count
UserSchema.statics.getTotalCount = function () {
  return this.countDocuments({ isActive: true });
};

module.exports = mongoose.model("User", UserSchema);
