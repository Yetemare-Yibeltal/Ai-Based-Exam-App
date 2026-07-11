const User = require("../../models/User");
const Teacher = require("../../models/Teacher");
const Admin = require("../../models/Admin");
const Session = require("../../models/Session");
const Notification = require("../../models/Notification");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  successResponse,
  createdResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../../utils/pagination");
const { generateTemporaryPassword } = require("../../utils/passwordReset");
const { sendTeacherWelcomeEmail } = require("../../utils/sendEmail");
const logger = require("../../utils/logger");

exports.getUserStats = catchAsync(async (req, res) => {
  const [studentStats, teacherStats, sessionStats] = await Promise.all([
    User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          banned: { $sum: { $cond: ["$isBanned", 1, 0] } },
          verified: { $sum: { $cond: ["$isEmailVerified", 1, 0] } },
          grade11: { $sum: { $cond: [{ $eq: ["$grade", "Grade 11"] }, 1, 0] } },
          grade12: { $sum: { $cond: [{ $eq: ["$grade", "Grade 12"] }, 1, 0] } },
          avgScore: { $avg: "$averageScore" },
          totalQuizzes: { $sum: "$totalQuizzesTaken" },
        },
      },
      { $addFields: { avgScore: { $round: ["$avgScore", 1] } } },
    ]),
    Teacher.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: { $sum: { $cond: ["$isActive", 1, 0] } },
          approved: { $sum: { $cond: ["$isApproved", 1, 0] } },
          banned: { $sum: { $cond: ["$isBanned", 1, 0] } },
          pending: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$isApproved", false] },
                    { $eq: ["$isBanned", false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
          totalAIGenerations: { $sum: "$totalAIGenerations" },
          totalQuestionsCreated: { $sum: "$totalQuestionsCreated" },
        },
      },
    ]),
    Session.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: "$role", count: { $sum: 1 } } },
    ]),
  ]);

  const sessionMap = {};
  sessionStats.forEach((s) => {
    sessionMap[s._id] = s.count;
  });

  const newStudentsThisWeek = await User.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  const newTeachersThisWeek = await Teacher.countDocuments({
    createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  });

  return successResponse(res, "User statistics retrieved successfully", {
    students: studentStats[0] || {
      total: 0,
      active: 0,
      banned: 0,
      verified: 0,
      grade11: 0,
      grade12: 0,
      avgScore: 0,
      totalQuizzes: 0,
    },
    teachers: teacherStats[0] || {
      total: 0,
      active: 0,
      approved: 0,
      banned: 0,
      pending: 0,
      totalAIGenerations: 0,
      totalQuestionsCreated: 0,
    },
    activeSessions: {
      students: sessionMap.student || 0,
      teachers: sessionMap.teacher || 0,
      admins: sessionMap.admin || 0,
      total: Object.values(sessionMap).reduce((a, b) => a + b, 0),
    },
    newThisWeek: {
      students: newStudentsThisWeek,
      teachers: newTeachersThisWeek,
    },
  });
});

exports.getAllStudents = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const {
    search,
    grade,
    isActive,
    isBanned,
    isEmailVerified,
    sortBy,
    sortOrder,
  } = req.query;

  const filter = {};
  if (grade) filter.grade = grade;
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isBanned !== undefined) filter.isBanned = isBanned === "true";
  if (isEmailVerified !== undefined)
    filter.isEmailVerified = isEmailVerified === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { school: { $regex: search, $options: "i" } },
    ];
  }

  const sortField = sortBy || "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [students, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .select("-password -emailVerificationOTP -passwordResetOTP"),
    User.countDocuments(filter),
  ]);

  return paginatedResponse(
    res,
    "Students retrieved successfully",
    students.map((s) => s.getPublicProfile()),
    getPaginationMeta(total, page, limit),
  );
});

exports.getStudentById = catchAsync(async (req, res) => {
  const student = await User.findById(req.params.id).select(
    "-password -emailVerificationOTP -passwordResetOTP",
  );

  if (!student) return notFoundResponse(res, "Student not found");

  const Score = require("../../models/Score");
  const subjectStats = await Score.getUserSubjectStats(req.params.id);
  const recentScores = await Score.getRecentScores(req.params.id, 5);

  return successResponse(res, "Student retrieved successfully", {
    student: student.getPublicProfile(),
    subjectStats,
    recentScores: recentScores.map((s) => s.getSummary()),
  });
});

exports.updateStudent = catchAsync(async (req, res) => {
  const { name, email, grade, school, isEmailVerified, isActive } = req.body;

  const student = await User.findById(req.params.id);
  if (!student) return notFoundResponse(res, "Student not found");

  if (name !== undefined) student.name = name;
  if (email !== undefined) student.email = email.toLowerCase();
  if (grade !== undefined) student.grade = grade;
  if (school !== undefined) student.school = school;
  if (isEmailVerified !== undefined) student.isEmailVerified = isEmailVerified;
  if (isActive !== undefined) student.isActive = isActive;

  await student.save({ validateBeforeSave: false });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "update_student",
    "User",
    student._id,
    `Updated student: ${student.name}`,
    req.ip,
  );

  logger.info(
    `Student updated by admin — Student: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Student updated successfully", {
    student: student.getPublicProfile(),
  });
});

exports.banStudent = catchAsync(async (req, res) => {
  const { reason } = req.body;

  if (!reason) return errorResponse(res, "Ban reason is required", 400);

  const student = await User.findById(req.params.id);
  if (!student) return notFoundResponse(res, "Student not found");
  if (student.isBanned)
    return errorResponse(res, "Student is already banned", 400);

  student.isBanned = true;
  student.banReason = reason;
  await student.save({ validateBeforeSave: false });

  await Session.invalidateAllByUser(student._id, "account_banned");

  await Notification.createNotification({
    recipientId: student._id,
    recipientModel: "User",
    recipientRole: "student",
    type: "announcement",
    title: "🚫 Account Suspended",
    message: `Your account has been suspended. Reason: ${reason}`,
    priority: "urgent",
  });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "ban_student",
    "User",
    student._id,
    `Banned student: ${student.name}. Reason: ${reason}`,
    req.ip,
  );

  logger.info(
    `Student banned — Student: ${req.params.id} — Admin: ${req.userId} — Reason: ${reason}`,
  );

  return successResponse(res, "Student banned successfully");
});

exports.unbanStudent = catchAsync(async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student) return notFoundResponse(res, "Student not found");
  if (!student.isBanned)
    return errorResponse(res, "Student is not banned", 400);

  student.isBanned = false;
  student.banReason = null;
  await student.save({ validateBeforeSave: false });

  await Notification.createNotification({
    recipientId: student._id,
    recipientModel: "User",
    recipientRole: "student",
    type: "announcement",
    title: "✅ Account Restored",
    message: "Your account has been restored. Welcome back to HEROY!",
    priority: "high",
  });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "unban_student",
    "User",
    student._id,
    `Unbanned student: ${student.name}`,
    req.ip,
  );

  logger.info(
    `Student unbanned — Student: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Student unbanned successfully");
});

exports.deleteStudent = catchAsync(async (req, res) => {
  const student = await User.findById(req.params.id);
  if (!student) return notFoundResponse(res, "Student not found");

  await Session.invalidateAllByUser(student._id, "user_logout");

  student.isActive = false;
  student.email = `deleted_${Date.now()}_${student.email}`;
  await student.save({ validateBeforeSave: false });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "delete_student",
    "User",
    student._id,
    `Deleted student: ${student.name}`,
    req.ip,
  );

  logger.info(
    `Student deleted by admin — Student: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Student deleted successfully");
});

exports.getAllTeachers = catchAsync(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const { search, subject, isApproved, isActive, isBanned, sortBy, sortOrder } =
    req.query;

  const filter = {};
  if (subject) filter.subject = subject.toLowerCase();
  if (isApproved !== undefined) filter.isApproved = isApproved === "true";
  if (isActive !== undefined) filter.isActive = isActive === "true";
  if (isBanned !== undefined) filter.isBanned = isBanned === "true";
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { school: { $regex: search, $options: "i" } },
    ];
  }

  const sortField = sortBy || "createdAt";
  const sortDirection = sortOrder === "asc" ? 1 : -1;

  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .sort({ [sortField]: sortDirection })
      .skip(skip)
      .limit(limit)
      .select("-password -emailVerificationOTP -passwordResetOTP"),
    Teacher.countDocuments(filter),
  ]);

  return paginatedResponse(
    res,
    "Teachers retrieved successfully",
    teachers.map((t) => t.getPublicProfile()),
    getPaginationMeta(total, page, limit),
  );
});

exports.getTeacherById = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .select("-password -emailVerificationOTP -passwordResetOTP")
    .populate("approvedBy", "name email");

  if (!teacher) return notFoundResponse(res, "Teacher not found");

  const Question = require("../../models/Question");
  const questionStats = await Question.aggregate([
    { $match: { createdBy: teacher._id } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 },
      },
    },
  ]);

  const qStats = { draft: 0, pending: 0, approved: 0, rejected: 0 };
  questionStats.forEach((s) => {
    qStats[s._id] = s.count;
  });

  return successResponse(res, "Teacher retrieved successfully", {
    teacher: teacher.getPublicProfile(),
    questionStats: qStats,
  });
});

exports.createTeacher = catchAsync(async (req, res) => {
  const { name, email, subject, school, experience, qualification } = req.body;

  if (!name || !email || !subject) {
    return errorResponse(res, "Name, email and subject are required", 400);
  }

  const existingTeacher = await Teacher.findOne({ email: email.toLowerCase() });
  if (existingTeacher)
    return errorResponse(res, "A teacher with this email already exists", 409);

  const temporaryPassword = generateTemporaryPassword();

  const teacher = await Teacher.create({
    name,
    email: email.toLowerCase(),
    password: temporaryPassword,
    subject,
    school: school || null,
    experience: experience || 0,
    qualification: qualification || null,
    isEmailVerified: true,
    isApproved: true,
    approvedBy: req.userId,
    approvedAt: new Date(),
  });

  await sendTeacherWelcomeEmail(teacher, temporaryPassword);

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "create_teacher",
    "Teacher",
    teacher._id,
    `Created teacher: ${teacher.name}`,
    req.ip,
  );

  logger.info(
    `Teacher created by admin — Teacher: ${teacher._id} — Admin: ${req.userId}`,
  );

  return createdResponse(res, "Teacher account created successfully", {
    teacher: teacher.getPublicProfile(),
  });
});

exports.updateTeacher = catchAsync(async (req, res) => {
  const { name, email, subject, school, experience, qualification, subjects } =
    req.body;

  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  if (name !== undefined) teacher.name = name;
  if (email !== undefined) teacher.email = email.toLowerCase();
  if (subject !== undefined) teacher.subject = subject;
  if (school !== undefined) teacher.school = school;
  if (experience !== undefined) teacher.experience = experience;
  if (qualification !== undefined) teacher.qualification = qualification;
  if (subjects !== undefined) teacher.subjects = subjects;

  await teacher.save({ validateBeforeSave: false });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "update_teacher",
    "Teacher",
    teacher._id,
    `Updated teacher: ${teacher.name}`,
    req.ip,
  );

  logger.info(
    `Teacher updated by admin — Teacher: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Teacher updated successfully", {
    teacher: teacher.getPublicProfile(),
  });
});

exports.approveTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return notFoundResponse(res, "Teacher not found");
  if (teacher.isApproved)
    return errorResponse(res, "Teacher is already approved", 400);

  teacher.isApproved = true;
  teacher.approvedBy = req.userId;
  teacher.approvedAt = new Date();
  await teacher.save({ validateBeforeSave: false });

  await Notification.createNotification({
    recipientId: teacher._id,
    recipientModel: "Teacher",
    recipientRole: "teacher",
    type: "announcement",
    title: "✅ Account Approved!",
    message:
      "Your teacher account has been approved. You can now create and submit questions.",
    actionUrl: "/teacher/dashboard",
    actionLabel: "Go to Dashboard",
    priority: "high",
  });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "approve_teacher",
    "Teacher",
    teacher._id,
    `Approved teacher: ${teacher.name}`,
    req.ip,
  );

  logger.info(
    `Teacher approved — Teacher: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Teacher approved successfully", {
    teacher: teacher.getPublicProfile(),
  });
});

exports.banTeacher = catchAsync(async (req, res) => {
  const { reason } = req.body;
  if (!reason) return errorResponse(res, "Ban reason is required", 400);

  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return notFoundResponse(res, "Teacher not found");
  if (teacher.isBanned)
    return errorResponse(res, "Teacher is already banned", 400);

  teacher.isBanned = true;
  teacher.banReason = reason;
  await teacher.save({ validateBeforeSave: false });

  await Session.invalidateAllByUser(teacher._id, "account_banned");

  await Notification.createNotification({
    recipientId: teacher._id,
    recipientModel: "Teacher",
    recipientRole: "teacher",
    type: "announcement",
    title: "🚫 Account Suspended",
    message: `Your teacher account has been suspended. Reason: ${reason}`,
    priority: "urgent",
  });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "ban_teacher",
    "Teacher",
    teacher._id,
    `Banned teacher: ${teacher.name}. Reason: ${reason}`,
    req.ip,
  );

  logger.info(
    `Teacher banned — Teacher: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Teacher banned successfully");
});

exports.unbanTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return notFoundResponse(res, "Teacher not found");
  if (!teacher.isBanned)
    return errorResponse(res, "Teacher is not banned", 400);

  teacher.isBanned = false;
  teacher.banReason = null;
  await teacher.save({ validateBeforeSave: false });

  await Notification.createNotification({
    recipientId: teacher._id,
    recipientModel: "Teacher",
    recipientRole: "teacher",
    type: "announcement",
    title: "✅ Account Restored",
    message: "Your teacher account has been restored. Welcome back!",
    priority: "high",
  });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "unban_teacher",
    "Teacher",
    teacher._id,
    `Unbanned teacher: ${teacher.name}`,
    req.ip,
  );

  logger.info(
    `Teacher unbanned — Teacher: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Teacher unbanned successfully");
});

exports.deleteTeacher = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  await Session.invalidateAllByUser(teacher._id, "user_logout");

  teacher.isActive = false;
  teacher.email = `deleted_${Date.now()}_${teacher.email}`;
  await teacher.save({ validateBeforeSave: false });

  const admin = await Admin.findById(req.userId);
  await admin.logActivity(
    "delete_teacher",
    "Teacher",
    teacher._id,
    `Deleted teacher: ${teacher.name}`,
    req.ip,
  );

  logger.info(
    `Teacher deleted by admin — Teacher: ${req.params.id} — Admin: ${req.userId}`,
  );

  return successResponse(res, "Teacher deleted successfully");
});
