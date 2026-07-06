const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'recipientModel',
      required: [true, 'Recipient is required'],
    },
    recipientModel: {
      type: String,
      enum: ['User', 'Teacher', 'Admin'],
      required: [true, 'Recipient model is required'],
    },
    recipientRole: {
      type: String,
      enum: ['student', 'teacher', 'admin'],
      required: [true, 'Recipient role is required'],
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'senderModel',
      default: null,
    },
    senderModel: {
      type: String,
      enum: ['User', 'Teacher', 'Admin', 'System'],
      default: 'System',
    },
    type: {
      type: String,
      enum: [
        // Student notifications
        'quiz_completed',
        'new_achievement',
        'study_reminder',
        'leaderboard_update',
        'score_milestone',
        'streak_achieved',
        // Teacher notifications
        'question_approved',
        'question_rejected',
        'ai_generation_complete',
        'student_performance_alert',
        // Admin notifications
        'new_question_pending',
        'new_teacher_registered',
        'reported_question',
        'system_alert',
        // General
        'welcome',
        'email_verified',
        'password_changed',
        'profile_updated',
        'announcement',
        'maintenance',
      ],
      required: [true, 'Notification type is required'],
    },
    title: {
      type: String,
      required: [true, 'Notification title is required'],
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    message: {
      type: String,
      required: [true, 'Notification message is required'],
      trim: true,
      maxlength: [500, 'Message cannot exceed 500 characters'],
    },
    data: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    actionUrl: {
      type: String,
      default: null,
    },
    actionLabel: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    image: {
      type: String,
      default: null,
    },
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: {
      type: Date,
      default: null,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    isBroadcast: {
      type: Boolean,
      default: false,
    },
    broadcastId: {
      type: String,
      default: null,
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
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
NotificationSchema.index({ recipient: 1 });
NotificationSchema.index({ recipient: 1, isRead: 1 });
NotificationSchema.index({ recipient: 1, isDeleted: 1 });
NotificationSchema.index({ recipient: 1, createdAt: -1 });
NotificationSchema.index({ type: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
NotificationSchema.index({ isBroadcast: 1 });

// ── VIRTUALS ───────────────────────────────────────────────

// Check if notification is expired
NotificationSchema.virtual('isExpired').get(function () {
  if (!this.expiresAt) return false;
  return new Date() > this.expiresAt;
});

// Time since notification was created
NotificationSchema.virtual('timeAgo').get(function () {
  const now = new Date();
  const diff = now - this.createdAt;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  return 'Just now';
});

// ── INSTANCE METHODS ───────────────────────────────────────

// Mark notification as read
NotificationSchema.methods.markAsRead = async function () {
  if (!this.isRead) {
    this.isRead = true;
    this.readAt = new Date();
    await this.save({ validateBeforeSave: false });
  }
};

// Soft delete notification
NotificationSchema.methods.softDelete = async function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Mark email as sent
NotificationSchema.methods.markEmailSent = async function () {
  this.emailSent = true;
  this.emailSentAt = new Date();
  await this.save({ validateBeforeSave: false });
};

// Get safe notification for client
NotificationSchema.methods.getClientNotification = function () {
  return {
    id: this._id,
    type: this.type,
    title: this.title,
    message: this.message,
    data: this.data,
    actionUrl: this.actionUrl,
    actionLabel: this.actionLabel,
    icon: this.icon,
    image: this.image,
    priority: this.priority,
    isRead: this.isRead,
    readAt: this.readAt,
    timeAgo: this.timeAgo,
    createdAt: this.createdAt,
  };
};

// ── STATIC METHODS ─────────────────────────────────────────

// Create notification for a user
NotificationSchema.statics.createNotification = async function ({
  recipientId,
  recipientModel,
  recipientRole,
  senderId = null,
  senderModel = 'System',
  type,
  title,
  message,
  data = null,
  actionUrl = null,
  actionLabel = null,
  priority = 'normal',
  expiresAt = null,
}) {
  return this.create({
    recipient: recipientId,
    recipientModel,
    recipientRole,
    sender: senderId,
    senderModel,
    type,
    title,
    message,
    data,
    actionUrl,
    actionLabel,
    priority,
    expiresAt,
  });
};

// Create broadcast notification for all users of a role
NotificationSchema.statics.createBroadcast = async function ({
  recipientIds,
  recipientModel,
  recipientRole,
  type,
  title,
  message,
  data = null,
  actionUrl = null,
  priority = 'normal',
}) {
  const broadcastId = new mongoose.Types.ObjectId().toString();

  const notifications = recipientIds.map((recipientId) => ({
    recipient: recipientId,
    recipientModel,
    recipientRole,
    senderModel: 'System',
    type,
    title,
    message,
    data,
    actionUrl,
    priority,
    isBroadcast: true,
    broadcastId,
  }));

  return this.insertMany(notifications);
};

// Get unread notifications for a user
NotificationSchema.statics.getUnread = function (userId, limit = 20) {
  return this.find({
    recipient: userId,
    isRead: false,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .limit(limit);
};

// Get all notifications for a user with pagination
NotificationSchema.statics.getAllForUser = function (userId, options = {}) {
  const { page = 1, limit = 20 } = options;

  return this.find({
    recipient: userId,
    isDeleted: false,
  })
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit);
};

// Count unread notifications for a user
NotificationSchema.statics.countUnread = function (userId) {
  return this.countDocuments({
    recipient: userId,
    isRead: false,
    isDeleted: false,
  });
};

// Mark all notifications as read for a user
NotificationSchema.statics.markAllAsRead = async function (userId) {
  return this.updateMany(
    {
      recipient: userId,
      isRead: false,
      isDeleted: false,
    },
    {
      $set: {
        isRead: true,
        readAt: new Date(),
      },
    }
  );
};

// Delete all read notifications older than 30 days
NotificationSchema.statics.cleanOldRead = async function () {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  return this.deleteMany({
    isRead: true,
    readAt: { $lt: thirtyDaysAgo },
  });
};

// Get notification statistics for admin
NotificationSchema.statics.getStats = function () {
  return this.aggregate([
    {
      $group: {
        _id: '$type',
        total: { $sum: 1 },
        read: { $sum: { $cond: ['$isRead', 1, 0] } },
        unread: { $sum: { $cond: ['$isRead', 0, 1] } },
      },
    },
    { $sort: { total: -1 } },
  ]);
};

// Predefined notification templates
NotificationSchema.statics.templates = {
  welcome: (userName) => ({
    type: 'welcome',
    title: '🎉 Welcome to HEROY!',
    message: `Hello ${userName}! Welcome to HEROY AI Exam Practice App. Start practicing today!`,
    actionUrl: '/student/home',
    actionLabel: 'Start Practicing',
    priority: 'high',
  }),

  quizCompleted: (subject, score) => ({
    type: 'quiz_completed',
    title: '✅ Quiz Completed!',
    message: `You scored ${score}% on ${subject}. ${score >= 70 ? 'Great job!' : 'Keep practicing!'}`,
    actionUrl: '/student/profile',
    actionLabel: 'View Results',
    priority: 'normal',
  }),

  questionApproved: (subject) => ({
    type: 'question_approved',
    title: '✅ Question Approved!',
    message: `Your ${subject} question has been approved and is now live in the exam bank.`,
    actionUrl: '/teacher/manage-questions',
    actionLabel: 'View Questions',
    priority: 'normal',
  }),

  questionRejected: (subject, reason) => ({
    type: 'question_rejected',
    title: '❌ Question Needs Revision',
    message: `Your ${subject} question needs revision. Reason: ${reason}`,
    actionUrl: '/teacher/manage-questions',
    actionLabel: 'Edit Question',
    priority: 'high',
  }),

  newQuestionPending: (teacherName, subject) => ({
    type: 'new_question_pending',
    title: '📝 New Question Pending Review',
    message: `${teacherName} submitted a new ${subject} question for approval.`,
    actionUrl: '/admin/approve-questions',
    actionLabel: 'Review Question',
    priority: 'normal',
  }),

  streakAchieved: (days) => ({
    type: 'streak_achieved',
    title: '🔥 Study Streak!',
    message: `Amazing! You have maintained a ${days}-day study streak. Keep it up!`,
    actionUrl: '/student/profile',
    actionLabel: 'View Profile',
    priority: 'normal',
  }),

  studyReminder: () => ({
    type: 'study_reminder',
    title: '📚 Time to Study!',
    message: "Don't forget to practice today. Your exam preparation is important!",
    actionUrl: '/student/subjects',
    actionLabel: 'Start Practicing',
    priority: 'low',
  }),
};

module.exports = mongoose.model('Notification', NotificationSchema);