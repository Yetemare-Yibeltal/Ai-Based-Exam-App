const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const TeacherSchema = new mongoose.Schema(
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
      enum: ["teacher"],
      default: "teacher",
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
    subject: {
      type: String,
      enum: [
        "math",
        "english",
        "biology",
        "chemistry",
        "physics",
        "civics",
        "all",
      ],
      required: [true, "Subject specialization is required"],
    },
    subjects: [
      {
        type: String,
        enum: ["math", "english", "biology", "chemistry", "physics", "civics"],
      },
    ],
    school: {
      type: String,
      trim: true,
      maxlength: [100, "School name cannot exceed 100 characters"],
      default: null,
    },
    bio: {
      type: String,
      maxlength: [500, "Bio cannot exceed 500 characters"],
      default: null,
    },
    experience: {
      type: Number,
      min: [0, "Experience cannot be negative"],
      max: [50, "Experience cannot exceed 50 years"],
      default: 0,
    },
    qualification: {
      type: String,
      maxlength: [200, "Qualification cannot exceed 200 characters"],
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
    isApproved: {
      type: Boolean,
      default: false,
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
    totalQuestionsCreated: {
      type: Number,
      default: 0,
    },
    totalQuestionsApproved: {
      type: Number,
      default: 0,
    },
    totalQuestionsRejected: {
      type: Number,
      default: 0,
    },
    totalAIGenerations: {
      type: Number,
      default: 0,
    },
    aiGenerationsThisMonth: {
      type: Number,
      default: 0,
    },
    aiGenerationsResetDate: {
      type: Date,
      default: null,
    },
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
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
    socialLinks: {
      linkedin: { type: String, default: null },
      twitter: { type: String, default: null },
      website: { type: String, default: null },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── INDEXES ────────────────────────────────────────────────
TeacherSchema.index({ email: 1 }, { unique: true });
TeacherSchema.index({ subject: 1 });
TeacherSchema.index({ isActive: 1, isApproved: 1 });
TeacherSchema.index({ totalQuestionsCreated: -1 });
TeacherSchema.index({ createdAt: -1 });

// ── VIRTUALS ───────────────────────────────────────────────

// Full profile URL
TeacherSchema.virtual("profileUrl").get(function () {
  return (
    this.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=2E7D32&color=ffffff&size=200`
  );
});

// Approval rate percentage
TeacherSchema.virtual("approvalRate").get(function () {
  const total = this.totalQuestionsApproved + this.totalQuestionsRejected;
  if (total === 0) return 0;
  return Math.round((this.totalQuestionsApproved / total) * 100);
});

// ── PRE SAVE HOOKS ─────────────────────────────────────────

// Hash password before saving
TeacherSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// Reset AI generations count monthly
TeacherSchema.pre("save", function (next) {
  if (!this.aiGenerationsResetDate) {
    this.aiGenerationsResetDate = new Date();
    return next();
  }

  const now = new Date();
  const resetDate = new Date(this.aiGenerationsResetDate);
  const diffMonths =
    (now.getFullYear() - resetDate.getFullYear()) * 12 +
    (now.getMonth() - resetDate.getMonth());

  if (diffMonths >= 1) {
    this.aiGenerationsThisMonth = 0;
    this.aiGenerationsResetDate = now;
  }

  next();
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Compare password
TeacherSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password changed after JWT
TeacherSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10,
    );
    return jwtTimestamp < changedTimestamp;
  }
  return false;
};

// Get public profile
TeacherSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    subject: this.subject,
    subjects: this.subjects,
    school: this.school,
    avatar: this.profileUrl,
    bio: this.bio,
    experience: this.experience,
    qualification: this.qualification,
    isEmailVerified: this.isEmailVerified,
    isApproved: this.isApproved,
    totalQuestionsCreated: this.totalQuestionsCreated,
    totalQuestionsApproved: this.totalQuestionsApproved,
    approvalRate: this.approvalRate,
    totalAIGenerations: this.totalAIGenerations,
    rating: this.rating,
    socialLinks: this.socialLinks,
    preferredLanguage: this.preferredLanguage,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

// Update login info
TeacherSchema.methods.updateLoginInfo = async function (ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIP = ip;
  this.loginCount += 1;
  await this.save({ validateBeforeSave: false });
};

// Increment AI generation count
TeacherSchema.methods.incrementAIGenerations = async function () {
  this.totalAIGenerations += 1;
  this.aiGenerationsThisMonth += 1;
  await this.save({ validateBeforeSave: false });
};

// Check if teacher has reached AI generation limit
TeacherSchema.methods.hasReachedAILimit = function (monthlyLimit = 100) {
  return this.aiGenerationsThisMonth >= monthlyLimit;
};

// Update question stats
TeacherSchema.methods.updateQuestionStats = async function (status) {
  this.totalQuestionsCreated += 1;

  if (status === "approved") {
    this.totalQuestionsApproved += 1;
  } else if (status === "rejected") {
    this.totalQuestionsRejected += 1;
  }

  await this.save({ validateBeforeSave: false });
};

// ── STATIC METHODS ─────────────────────────────────────────

// Find teacher by email
TeacherSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find approved and active teachers
TeacherSchema.statics.findActiveTeachers = function () {
  return this.find({ isActive: true, isApproved: true, isBanned: false });
};

// Find teachers by subject
TeacherSchema.statics.findBySubject = function (subject) {
  return this.find({
    isActive: true,
    isApproved: true,
    $or: [{ subject }, { subjects: subject }],
  });
};

// Get total teacher count
TeacherSchema.statics.getTotalCount = function () {
  return this.countDocuments({ isActive: true });
};

module.exports = mongoose.model("Teacher", TeacherSchema);
