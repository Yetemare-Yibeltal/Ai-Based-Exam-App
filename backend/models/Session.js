const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'userModel',
      required: [true, 'User ID is required'],
    },
    userModel: {
      type: String,
      enum: ['User', 'Teacher', 'Admin'],
      required: [true, 'User model is required'],
    },
    role: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: [true, 'Role is required'],
    },
    refreshToken: {
      type: String,
      required: [true, 'Refresh token is required'],
      select: false,
    },
    refreshTokenHash: {
      type: String,
      required: [true, 'Refresh token hash is required'],
    },
    accessTokenJTI: {
      type: String,
      default: null,
    },
    deviceInfo: {
      userAgent: { type: String, default: null },
      browser: { type: String, default: null },
      os: { type: String, default: null },
      device: { type: String, default: null },
      isMobile: { type: Boolean, default: false },
    },
    ipAddress: {
      type: String,
      default: null,
    },
    location: {
      country: { type: String, default: null },
      city: { type: String, default: null },
      timezone: { type: String, default: null },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiry date is required'],
    },
    lastActivityAt: {
      type: Date,
      default: Date.now,
    },
    loginAt: {
      type: Date,
      default: Date.now,
    },
    logoutAt: {
      type: Date,
      default: null,
    },
    logoutReason: {
      type: String,
      enum: [
        'user_logout',
        'token_expired',
        'password_changed',
        'account_banned',
        'admin_logout',
        'session_timeout',
        null,
      ],
      default: null,
    },
    sessionDuration: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ── INDEXES ────────────────────────────────────────────────
SessionSchema.index({ userId: 1 });
SessionSchema.index({ userId: 1, isActive: 1 });
SessionSchema.index({ refreshTokenHash: 1 });
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
SessionSchema.index({ isActive: 1 });
SessionSchema.index({ createdAt: -1 });

// ── VIRTUALS ───────────────────────────────────────────────

// Check if session is expired
SessionSchema.virtual('isExpired').get(function () {
  return new Date() > this.expiresAt;
});

// Session duration in minutes
SessionSchema.virtual('durationMinutes').get(function () {
  if (!this.logoutAt) return null;
  return Math.round((this.logoutAt - this.loginAt) / (1000 * 60));
});

// ── PRE SAVE HOOKS ─────────────────────────────────────────

// Calculate session duration when logging out
SessionSchema.pre('save', function (next) {
  if (this.isModified('logoutAt') && this.logoutAt) {
    this.sessionDuration = Math.round(
      (this.logoutAt - this.loginAt) / (1000 * 60)
    );
  }
  next();
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Invalidate session (logout)
SessionSchema.methods.invalidate = async function (reason = 'user_logout') {
  this.isActive = false;
  this.logoutAt = new Date();
  this.logoutReason = reason;
  await this.save({ validateBeforeSave: false });
};

// Update last activity
SessionSchema.methods.updateActivity = async function () {
  this.lastActivityAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Get session info safe for client
SessionSchema.methods.getSessionInfo = function () {
  return {
    id: this._id,
    userId: this.userId,
    role: this.role,
    deviceInfo: this.deviceInfo,
    ipAddress: this.ipAddress,
    isActive: this.isActive,
    loginAt: this.loginAt,
    lastActivityAt: this.lastActivityAt,
    expiresAt: this.expiresAt,
  };
};

// ── STATIC METHODS ─────────────────────────────────────────

// Find active session by refresh token hash
SessionSchema.statics.findByRefreshTokenHash = function (hash) {
  return this.findOne({
    refreshTokenHash: hash,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

// Find all active sessions for a user
SessionSchema.statics.findActiveByUser = function (userId) {
  return this.find({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  }).sort({ lastActivityAt: -1 });
};

// Invalidate all sessions for a user
SessionSchema.statics.invalidateAllByUser = async function (userId, reason = 'password_changed') {
  return this.updateMany(
    { userId, isActive: true },
    {
      $set: {
        isActive: false,
        logoutAt: new Date(),
        logoutReason: reason,
      },
    }
  );
};

// Invalidate all sessions except current
SessionSchema.statics.invalidateOtherSessions = async function (userId, currentSessionId) {
  return this.updateMany(
    {
      userId,
      isActive: true,
      _id: { $ne: currentSessionId },
    },
    {
      $set: {
        isActive: false,
        logoutAt: new Date(),
        logoutReason: 'admin_logout',
      },
    }
  );
};

// Clean expired sessions
SessionSchema.statics.cleanExpired = async function () {
  return this.deleteMany({
    $or: [
      { expiresAt: { $lt: new Date() } },
      { isActive: false, createdAt: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    ],
  });
};

// Count active sessions for a user
SessionSchema.statics.countActiveByUser = function (userId) {
  return this.countDocuments({
    userId,
    isActive: true,
    expiresAt: { $gt: new Date() },
  });
};

// Get session statistics
SessionSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalSessions: { $sum: 1 },
        activeSessions: {
          $sum: { $cond: ['$isActive', 1, 0] },
        },
        avgDuration: { $avg: '$sessionDuration' },
        mobileUsers: {
          $sum: { $cond: ['$deviceInfo.isMobile', 1, 0] },
        },
      },
    },
    {
      $project: {
        _id: 0,
        totalSessions: 1,
        activeSessions: 1,
        avgDuration: { $round: ['$avgDuration', 1] },
        mobileUsers: 1,
      },
    },
  ]);
};

module.exports = mongoose.model('Session', SessionSchema);
