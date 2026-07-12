const Admin = require("../../models/Admin");
const User = require("../../models/User");
const Teacher = require("../../models/Teacher");
const Notification = require("../../models/Notification");
const { catchAsync } = require("../../middleware/errorHandler");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const { clearCache, getCacheStats } = require("../../middleware/cache");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");
const { paginatedResponse } = require("../../utils/apiResponse");
const logger = require("../../utils/logger");
const os = require("os");

const appSettings = {
  maintenance: false,
  maintenanceMessage: "HEROY is under maintenance. Please check back soon.",
  allowRegistration: true,
  allowTeacherRegistration: false,
  maxQuestionsPerTeacher: 500,
  aiGenerationLimit: 100,
  maxQuizQuestions: 50,
  minQuizQuestions: 5,
  sessionTimeout: "30d",
  supportEmail: "support@heroy.com",
  appVersion: "1.0.0",
  updatedAt: new Date(),
  updatedBy: null,
};

exports.getSettings = catchAsync(async (req, res) => {
  return successResponse(res, "Settings retrieved successfully", {
    settings: appSettings,
  });
});

exports.updateSettings = catchAsync(async (req, res) => {
  const {
    maintenance,
    maintenanceMessage,
    allowRegistration,
    allowTeacherRegistration,
    maxQuestionsPerTeacher,
    aiGenerationLimit,
    maxQuizQuestions,
    minQuizQuestions,
    supportEmail,
  } = req.body;

  if (maintenance !== undefined) appSettings.maintenance = maintenance;
  if (maintenanceMessage !== undefined)
    appSettings.maintenanceMessage = maintenanceMessage;
  if (allowRegistration !== undefined)
    appSettings.allowRegistration = allowRegistration;
  if (allowTeacherRegistration !== undefined)
    appSettings.allowTeacherRegistration = allowTeacherRegistration;
  if (maxQuestionsPerTeacher !== undefined)
    appSettings.maxQuestionsPerTeacher = maxQuestionsPerTeacher;
  if (aiGenerationLimit !== undefined)
    appSettings.aiGenerationLimit = aiGenerationLimit;
  if (maxQuizQuestions !== undefined)
    appSettings.maxQuizQuestions = maxQuizQuestions;
  if (minQuizQuestions !== undefined)
    appSettings.minQuizQuestions = minQuizQuestions;
  if (supportEmail !== undefined) appSettings.supportEmail = supportEmail;

  appSettings.updatedAt = new Date();
  appSettings.updatedBy = req.userId;

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "update_settings",
    "Settings",
    null,
    "Updated application settings",
    req.ip,
  );

  logger.info(`Settings updated by admin — Admin: ${req.userId}`);

  return successResponse(res, "Settings updated successfully", {
    settings: appSettings,
  });
});

exports.getSystemInfo = catchAsync(async (req, res) => {
  const cacheStats = getCacheStats();
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();

  const [totalStudents, totalTeachers, totalSessions] = await Promise.all([
    User.countDocuments({ isActive: true }),
    Teacher.countDocuments({ isActive: true }),
    require("../../models/Session").countDocuments({ isActive: true }),
  ]);

  const formatBytes = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const formatUptime = (seconds) => {
    const d = Math.floor(seconds / 86400);
    const h = Math.floor((seconds % 86400) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return successResponse(res, "System info retrieved successfully", {
    server: {
      nodeVersion: process.version,
      platform: process.platform,
      arch: process.arch,
      uptime: formatUptime(uptime),
      uptimeSeconds: Math.floor(uptime),
      environment: process.env.NODE_ENV,
      appVersion: appSettings.appVersion,
    },
    memory: {
      heapUsed: formatBytes(memoryUsage.heapUsed),
      heapTotal: formatBytes(memoryUsage.heapTotal),
      external: formatBytes(memoryUsage.external),
      rss: formatBytes(memoryUsage.rss),
      heapUsedPercentage: Math.round(
        (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100,
      ),
    },
    os: {
      hostname: os.hostname(),
      totalMemory: formatBytes(os.totalmem()),
      freeMemory: formatBytes(os.freemem()),
      cpus: os.cpus().length,
      loadAverage: os.loadavg().map((l) => l.toFixed(2)),
    },
    database: {
      connection:
        require("mongoose").connection.readyState === 1
          ? "connected"
          : "disconnected",
      host: require("mongoose").connection.host,
      name: require("mongoose").connection.name,
    },
    cache: {
      totalKeys: cacheStats.total,
      activeKeys: cacheStats.active,
      expiredKeys: cacheStats.expired,
    },
    users: {
      totalStudents,
      totalTeachers,
      activeSessions: totalSessions,
    },
    settings: appSettings,
  });
});

exports.clearCache = catchAsync(async (req, res) => {
  const statsBefore = getCacheStats();
  clearCache();
  const statsAfter = getCacheStats();

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "clear_cache",
    "System",
    null,
    `Cleared ${statsBefore.total} cache entries`,
    req.ip,
  );

  logger.info(
    `Cache cleared by admin — Admin: ${req.userId} — Cleared: ${statsBefore.total} entries`,
  );

  return successResponse(res, "Cache cleared successfully", {
    before: { total: statsBefore.total, active: statsBefore.active },
    after: { total: statsAfter.total, active: statsAfter.active },
    cleared: statsBefore.total - statsAfter.total,
  });
});

exports.getActivityLog = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);

  const admin = await Admin.findById(req.userId).select("activityLog");
  if (!admin) return errorResponse(res, "Admin not found", 404);

  const total = admin.activityLog.length;
  const sortedLog = [...admin.activityLog].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  );

  const paginatedLog = sortedLog.slice(skip, skip + limit);

  return paginatedResponse(
    res,
    "Activity log retrieved successfully",
    paginatedLog,
    getPaginationMeta(total, page, limit),
  );
});

exports.sendAnnouncement = catchAsync(async (req, res) => {
  const { title, message, targetRole, priority } = req.body;

  if (!title || !message) {
    return errorResponse(res, "Title and message are required", 400);
  }

  const validRoles = ["student", "teacher", "admin", "all"];
  if (targetRole && !validRoles.includes(targetRole)) {
    return errorResponse(res, "Invalid target role", 400);
  }

  const role = targetRole || "all";
  let recipientIds = [];
  let recipientModel = "User";
  let recipientRole = "student";

  if (role === "student" || role === "all") {
    const students = await User.find({
      isActive: true,
      isBanned: false,
    }).select("_id");
    recipientIds.push(...students.map((s) => s._id));
    recipientModel = "User";
    recipientRole = "student";

    await Notification.createBroadcast({
      recipientIds: students.map((s) => s._id),
      recipientModel: "User",
      recipientRole: "student",
      type: "announcement",
      title,
      message,
      priority: priority || "normal",
    });
  }

  if (role === "teacher" || role === "all") {
    const teachers = await Teacher.find({
      isActive: true,
      isApproved: true,
      isBanned: false,
    }).select("_id");

    await Notification.createBroadcast({
      recipientIds: teachers.map((t) => t._id),
      recipientModel: "Teacher",
      recipientRole: "teacher",
      type: "announcement",
      title,
      message,
      priority: priority || "normal",
    });

    recipientIds.push(...teachers.map((t) => t._id));
  }

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "send_announcement",
    "System",
    null,
    `Sent announcement to ${role}: ${title}`,
    req.ip,
  );

  logger.info(
    `Announcement sent by admin — Admin: ${req.userId} — Target: ${role} — Recipients: ${recipientIds.length}`,
  );

  return successResponse(res, "Announcement sent successfully", {
    title,
    message,
    targetRole: role,
    recipientCount: recipientIds.length,
    priority: priority || "normal",
  });
});
