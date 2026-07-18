const Notification = require("../models/Notification");
const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const logger = require("../utils/logger");

const createNotification = async ({
  recipientId,
  recipientModel,
  recipientRole,
  senderId = null,
  senderModel = "System",
  type,
  title,
  message,
  data = null,
  actionUrl = null,
  actionLabel = null,
  priority = "normal",
  expiresAt = null,
}) => {
  try {
    const notification = await Notification.createNotification({
      recipientId,
      recipientModel,
      recipientRole,
      senderId,
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

    logger.info(
      `Notification created — Recipient: ${recipientId} — Type: ${type}`,
    );
    return notification;
  } catch (error) {
    logger.error(`Failed to create notification: ${error.message}`);
    return null;
  }
};

const broadcastNotification = async ({
  targetRole,
  type,
  title,
  message,
  data = null,
  actionUrl = null,
  priority = "normal",
}) => {
  try {
    let recipients = [];
    let recipientModel = "User";
    let recipientRole = "student";

    if (targetRole === "student" || targetRole === "all") {
      const students = await User.find({
        isActive: true,
        isBanned: false,
      }).select("_id");
      if (students.length > 0) {
        await Notification.createBroadcast({
          recipientIds: students.map((s) => s._id),
          recipientModel: "User",
          recipientRole: "student",
          type,
          title,
          message,
          data,
          actionUrl,
          priority,
        });
        recipients.push(...students);
      }
    }

    if (targetRole === "teacher" || targetRole === "all") {
      const teachers = await Teacher.find({
        isActive: true,
        isApproved: true,
        isBanned: false,
      }).select("_id");
      if (teachers.length > 0) {
        await Notification.createBroadcast({
          recipientIds: teachers.map((t) => t._id),
          recipientModel: "Teacher",
          recipientRole: "teacher",
          type,
          title,
          message,
          data,
          actionUrl,
          priority,
        });
        recipients.push(...teachers);
      }
    }

    if (targetRole === "admin" || targetRole === "all") {
      const admins = await Admin.find({ isActive: true }).select("_id");
      if (admins.length > 0) {
        await Notification.createBroadcast({
          recipientIds: admins.map((a) => a._id),
          recipientModel: "Admin",
          recipientRole: "admin",
          type,
          title,
          message,
          data,
          actionUrl,
          priority,
        });
        recipients.push(...admins);
      }
    }

    logger.info(
      `Broadcast sent — Target: ${targetRole} — Recipients: ${recipients.length}`,
    );
    return { sent: true, recipientCount: recipients.length };
  } catch (error) {
    logger.error(`Failed to broadcast notification: ${error.message}`);
    throw error;
  }
};

const getUserNotifications = async (userId, options = {}) => {
  const { page = 1, limit = 20, unreadOnly = false } = options;
  const skip = (page - 1) * limit;

  const filter = { recipient: userId, isDeleted: false };
  if (unreadOnly) filter.isRead = false;

  const [notifications, total, unreadCount] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Notification.countDocuments(filter),
    Notification.countUnread(userId),
  ]);

  return {
    notifications: notifications.map((n) => n.getClientNotification()),
    total,
    page,
    limit,
    unreadCount,
  };
};

const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) throw new Error("Notification not found");

  await notification.markAsRead();

  return { read: true };
};

const markAllNotificationsAsRead = async (userId) => {
  const result = await Notification.markAllAsRead(userId);

  logger.info(`All notifications marked as read — User: ${userId}`);

  return { updated: result.modifiedCount };
};

const deleteNotification = async (notificationId, userId) => {
  const notification = await Notification.findOne({
    _id: notificationId,
    recipient: userId,
  });

  if (!notification) throw new Error("Notification not found");

  await notification.softDelete();

  return { deleted: true };
};

const deleteAllNotifications = async (userId) => {
  const result = await Notification.updateMany(
    { recipient: userId, isDeleted: false },
    { $set: { isDeleted: true, deletedAt: new Date() } },
  );

  logger.info(`All notifications deleted — User: ${userId}`);

  return { deleted: result.modifiedCount };
};

const getUnreadCount = async (userId) => {
  return Notification.countUnread(userId);
};

const getNotificationStats = async () => {
  return Notification.getStats();
};

const sendWelcomeNotification = async (userId, userName, role) => {
  const modelMap = {
    student: {
      model: "User",
      template: Notification.templates.welcome(userName),
    },
    teacher: {
      model: "Teacher",
      template: {
        type: "welcome",
        title: "🎉 Welcome to HEROY Teacher Portal!",
        message: `Hello ${userName}! Your teacher account has been created. Please wait for admin approval to start creating questions.`,
        actionUrl: "/teacher/dashboard",
        actionLabel: "Go to Dashboard",
        priority: "high",
      },
    },
  };

  const config = modelMap[role];
  if (!config) return null;

  return createNotification({
    recipientId: userId,
    recipientModel: config.model,
    recipientRole: role,
    ...config.template,
  });
};

const sendQuizCompletedNotification = async (userId, subject, score) => {
  return createNotification({
    recipientId: userId,
    recipientModel: "User",
    recipientRole: "student",
    ...Notification.templates.quizCompleted(subject, score),
  });
};

const sendStreakNotification = async (userId, streakDays) => {
  return createNotification({
    recipientId: userId,
    recipientModel: "User",
    recipientRole: "student",
    ...Notification.templates.streakAchieved(streakDays),
  });
};

const sendQuestionApprovedNotification = async (teacherId, subject) => {
  return createNotification({
    recipientId: teacherId,
    recipientModel: "Teacher",
    recipientRole: "teacher",
    ...Notification.templates.questionApproved(subject),
  });
};

const sendQuestionRejectedNotification = async (teacherId, subject, reason) => {
  return createNotification({
    recipientId: teacherId,
    recipientModel: "Teacher",
    recipientRole: "teacher",
    ...Notification.templates.questionRejected(subject, reason),
  });
};

const sendNewQuestionPendingToAdmins = async (teacherName, subject) => {
  const admins = await Admin.find({ isActive: true }).select("_id");

  for (const admin of admins) {
    await createNotification({
      recipientId: admin._id,
      recipientModel: "Admin",
      recipientRole: "admin",
      ...Notification.templates.newQuestionPending(teacherName, subject),
    });
  }
};

const cleanOldNotifications = async () => {
  const result = await Notification.cleanOldRead();
  logger.info(`Old notifications cleaned — Deleted: ${result.deletedCount}`);
  return result;
};

module.exports = {
  createNotification,
  broadcastNotification,
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getNotificationStats,
  sendWelcomeNotification,
  sendQuizCompletedNotification,
  sendStreakNotification,
  sendQuestionApprovedNotification,
  sendQuestionRejectedNotification,
  sendNewQuestionPendingToAdmins,
  cleanOldNotifications,
};
