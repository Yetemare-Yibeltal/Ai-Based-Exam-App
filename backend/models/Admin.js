const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const AdminSchema = new mongoose.Schema(
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
      enum: ["admin"],
      default: "admin",
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
    isSuperAdmin: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: true,
    },
    permissions: {
      manageStudents: { type: Boolean, default: true },
      manageTeachers: { type: Boolean, default: true },
      manageQuestions: { type: Boolean, default: true },
      approveQuestions: { type: Boolean, default: true },
      viewAnalytics: { type: Boolean, default: true },
      manageSettings: { type: Boolean, default: true },
      viewReports: { type: Boolean, default: true },
      manageNotifications: { type: Boolean, default: true },
      manageAdmins: { type: Boolean, default: false },
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
    totalQuestionsApproved: {
      type: Number,
      default: 0,
    },
    totalQuestionsRejected: {
      type: Number,
      default: 0,
    },
    totalStudentsManaged: {
      type: Number,
      default: 0,
    },
    totalTeachersManaged: {
      type: Number,
      default: 0,
    },
    activityLog: [
      {
        action: { type: String },
        target: { type: String },
        targetId: { type: mongoose.Schema.Types.ObjectId },
        details: { type: String },
        ip: { type: String },
        createdAt: { type: Date, default: Date.now },
      },
    ],
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
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: String,
      default: null,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// ── INDEXES ────────────────────────────────────────────────
AdminSchema.index({ email: 1 }, { unique: true });
AdminSchema.index({ isActive: 1 });
AdminSchema.index({ createdAt: -1 });

// ── VIRTUALS ───────────────────────────────────────────────

// Profile URL
AdminSchema.virtual("profileUrl").get(function () {
  return (
    this.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=B71C1C&color=ffffff&size=200`
  );
});

// ── PRE SAVE HOOKS ─────────────────────────────────────────

// Hash password before saving
AdminSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  if (!this.isNew) {
    this.passwordChangedAt = new Date(Date.now() - 1000);
  }

  next();
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Compare password
AdminSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Check if password changed after JWT
AdminSchema.methods.passwordChangedAfter = function (jwtTimestamp) {
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
AdminSchema.methods.getPublicProfile = function () {
  return {
    id: this._id,
    name: this.name,
    email: this.email,
    role: this.role,
    avatar: this.profileUrl,
    isSuperAdmin: this.isSuperAdmin,
    permissions: this.permissions,
    isEmailVerified: this.isEmailVerified,
    totalQuestionsApproved: this.totalQuestionsApproved,
    totalQuestionsRejected: this.totalQuestionsRejected,
    totalStudentsManaged: this.totalStudentsManaged,
    totalTeachersManaged: this.totalTeachersManaged,
    preferredLanguage: this.preferredLanguage,
    twoFactorEnabled: this.twoFactorEnabled,
    createdAt: this.createdAt,
    lastLoginAt: this.lastLoginAt,
  };
};

// Update login info
AdminSchema.methods.updateLoginInfo = async function (ip) {
  this.lastLoginAt = new Date();
  this.lastLoginIP = ip;
  this.loginCount += 1;
  await this.save({ validateBeforeSave: false });
};

// Log admin activity
AdminSchema.methods.logActivity = async function (
  action,
  target,
  targetId,
  details,
  ip,
) {
  this.activityLog.push({
    action,
    target,
    targetId,
    details,
    ip,
    createdAt: new Date(),
  });

  // Keep only last 100 activity logs
  if (this.activityLog.length > 100) {
    this.activityLog = this.activityLog.slice(-100);
  }

  await this.save({ validateBeforeSave: false });
};

// Check if admin has a specific permission
AdminSchema.methods.hasPermission = function (permission) {
  if (this.isSuperAdmin) return true;
  return this.permissions[permission] === true;
};

// Update question review stats
AdminSchema.methods.updateQuestionReviewStats = async function (status) {
  if (status === "approved") {
    this.totalQuestionsApproved += 1;
  } else if (status === "rejected") {
    this.totalQuestionsRejected += 1;
  }
  await this.save({ validateBeforeSave: false });
};

// ── STATIC METHODS ─────────────────────────────────────────

// Find admin by email
AdminSchema.statics.findByEmail = function (email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Find active admins
AdminSchema.statics.findActiveAdmins = function () {
  return this.find({ isActive: true });
};

// Get super admin
AdminSchema.statics.getSuperAdmin = function () {
  return this.findOne({ isSuperAdmin: true, isActive: true });
};

// Get total admin count
AdminSchema.statics.getTotalCount = function () {
  return this.countDocuments({ isActive: true });
};

module.exports = mongoose.model("Admin", AdminSchema);
