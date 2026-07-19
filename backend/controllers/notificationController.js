const { catchAsync } = require("../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const notificationService = require("../services/notification.service");

exports.getMyNotifications = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { unreadOnly } = req.query;

  const result = await notificationService.getUserNotifications(req.userId, {
    page,
    limit,
    unreadOnly: unreadOnly === "true",
  });

  return paginatedResponse(
    res,
    "Notifications retrieved successfully",
    result.notifications,
    getPaginationMeta(result.total, page, limit),
    { unreadCount: result.unreadCount },
  );
});

exports.getUnreadCount = catchAsync(async (req, res) => {
  const count = await notificationService.getUnreadCount(req.userId);
  return successResponse(res, "Unread count retrieved successfully", {
    unreadCount: count,
  });
});

exports.markAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markNotificationAsRead(
    req.params.id,
    req.userId,
  );
  return successResponse(res, "Notification marked as read", result);
});

exports.markAllAsRead = catchAsync(async (req, res) => {
  const result = await notificationService.markAllNotificationsAsRead(
    req.userId,
  );
  return successResponse(res, "All notifications marked as read", result);
});

exports.deleteNotification = catchAsync(async (req, res) => {
  const result = await notificationService.deleteNotification(
    req.params.id,
    req.userId,
  );
  return successResponse(res, "Notification deleted successfully", result);
});

exports.deleteAllNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.deleteAllNotifications(req.userId);
  return successResponse(res, "All notifications deleted successfully", result);
});

exports.sendAnnouncement = catchAsync(async (req, res) => {
  const { title, message, targetRole, priority } = req.body;

  if (!title || !message) {
    return errorResponse(res, "Title and message are required", 400);
  }

  const validRoles = ["student", "teacher", "admin", "all"];
  if (targetRole && !validRoles.includes(targetRole)) {
    return errorResponse(
      res,
      `Target role must be one of: ${validRoles.join(", ")}`,
      400,
    );
  }

  const result = await notificationService.broadcastNotification({
    targetRole: targetRole || "all",
    type: "announcement",
    title,
    message,
    priority: priority || "normal",
  });

  return successResponse(res, "Announcement sent successfully", result);
});

exports.getNotificationStats = catchAsync(async (req, res) => {
  const stats = await notificationService.getNotificationStats();
  return successResponse(
    res,
    "Notification statistics retrieved successfully",
    { stats },
  );
});

exports.cleanOldNotifications = catchAsync(async (req, res) => {
  const result = await notificationService.cleanOldNotifications();
  return successResponse(res, "Old notifications cleaned successfully", {
    deletedCount: result.deletedCount || 0,
  });
});
