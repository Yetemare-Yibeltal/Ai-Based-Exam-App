const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const Session = require("../models/Session");
const Score = require("../models/Score");
const Notification = require("../models/Notification");
const { generateTemporaryPassword } = require("../utils/passwordReset");
const { sendTeacherWelcomeEmail } = require("../utils/sendEmail");
const { deleteImage } = require("../config/cloudinary");
const logger = require("../utils/logger");

const getAllStudents = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    search,
    grade,
    isActive,
    isBanned,
    isEmailVerified,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;
  const filter = {};

  if (grade) filter.grade = grade;
  if (isActive !== undefined)
    filter.isActive = isActive === "true" || isActive === true;
  if (isBanned !== undefined)
    filter.isBanned = isBanned === "true" || isBanned === true;
  if (isEmailVerified !== undefined)
    filter.isEmailVerified =
      isEmailVerified === "true" || isEmailVerified === true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { school: { $regex: search, $options: "i" } },
    ];
  }

  const [students, total] = await Promise.all([
    User.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select("-password -emailVerificationOTP -passwordResetOTP"),
    User.countDocuments(filter),
  ]);

  return {
    students: students.map((s) => s.getPublicProfile()),
    total,
    page,
    limit,
  };
};

const getStudentById = async (studentId) => {
  const student = await User.findById(studentId).select(
    "-password -emailVerificationOTP -passwordResetOTP",
  );

  if (!student) throw new Error("Student not found");

  const [subjectStats, recentScores] = await Promise.all([
    Score.getUserSubjectStats(studentId),
    Score.getRecentScores(studentId, 5),
  ]);

  return {
    student: student.getPublicProfile(),
    subjectStats,
    recentScores: recentScores.map((s) => s.getSummary()),
  };
};

const updateStudent = async (studentId, updateData, adminId) => {
  const student = await User.findById(studentId);
  if (!student) throw new Error("Student not found");

  const allowedFields = [
    "name",
    "email",
    "grade",
    "school",
    "isEmailVerified",
    "isActive",
  ];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      student[field] =
        field === "email" ? updateData[field].toLowerCase() : updateData[field];
    }
  });

  await student.save({ validateBeforeSave: false });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "update_student",
      "User",
      studentId,
      `Updated student: ${student.name}`,
      null,
    );
  }

  logger.info(`Student updated — Student: ${studentId} — Admin: ${adminId}`);

  return student.getPublicProfile();
};

const banStudent = async (studentId, reason, adminId) => {
  if (!reason) throw new Error("Ban reason is required");

  const student = await User.findById(studentId);
  if (!student) throw new Error("Student not found");
  if (student.isBanned) throw new Error("Student is already banned");

  student.isBanned = true;
  student.banReason = reason;
  await student.save({ validateBeforeSave: false });

  await Session.invalidateAllByUser(studentId, "account_banned");

  await Notification.createNotification({
    recipientId: studentId,
    recipientModel: "User",
    recipientRole: "student",
    type: "announcement",
    title: "🚫 Account Suspended",
    message: `Your account has been suspended. Reason: ${reason}`,
    priority: "urgent",
  });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "ban_student",
      "User",
      studentId,
      `Banned: ${reason}`,
      null,
    );
  }

  logger.info(`Student banned — Student: ${studentId} — Admin: ${adminId}`);

  return { banned: true };
};

const unbanStudent = async (studentId, adminId) => {
  const student = await User.findById(studentId);
  if (!student) throw new Error("Student not found");
  if (!student.isBanned) throw new Error("Student is not banned");

  student.isBanned = false;
  student.banReason = null;
  await student.save({ validateBeforeSave: false });

  await Notification.createNotification({
    recipientId: studentId,
    recipientModel: "User",
    recipientRole: "student",
    type: "announcement",
    title: "✅ Account Restored",
    message: "Your account has been restored. Welcome back to HEROY!",
    priority: "high",
  });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "unban_student",
      "User",
      studentId,
      `Unbanned student`,
      null,
    );
  }

  logger.info(`Student unbanned — Student: ${studentId} — Admin: ${adminId}`);

  return { unbanned: true };
};

const deleteStudent = async (studentId, adminId) => {
  const student = await User.findById(studentId);
  if (!student) throw new Error("Student not found");

  if (student.avatarPublicId) await deleteImage(student.avatarPublicId);

  await Session.invalidateAllByUser(studentId, "user_logout");

  student.isActive = false;
  student.email = `deleted_${Date.now()}_${student.email}`;
  await student.save({ validateBeforeSave: false });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "delete_student",
      "User",
      studentId,
      `Deleted student: ${student.name}`,
      null,
    );
  }

  logger.info(`Student deleted — Student: ${studentId} — Admin: ${adminId}`);

  return { deleted: true };
};

const getAllTeachers = async (options = {}) => {
  const {
    page = 1,
    limit = 20,
    search,
    subject,
    isApproved,
    isActive,
    isBanned,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = options;

  const skip = (page - 1) * limit;
  const filter = {};

  if (subject) filter.subject = subject.toLowerCase();
  if (isApproved !== undefined)
    filter.isApproved = isApproved === "true" || isApproved === true;
  if (isActive !== undefined)
    filter.isActive = isActive === "true" || isActive === true;
  if (isBanned !== undefined)
    filter.isBanned = isBanned === "true" || isBanned === true;
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { school: { $regex: search, $options: "i" } },
    ];
  }

  const [teachers, total] = await Promise.all([
    Teacher.find(filter)
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limit)
      .select("-password -emailVerificationOTP -passwordResetOTP"),
    Teacher.countDocuments(filter),
  ]);

  return {
    teachers: teachers.map((t) => t.getPublicProfile()),
    total,
    page,
    limit,
  };
};

const getTeacherById = async (teacherId) => {
  const teacher = await Teacher.findById(teacherId)
    .select("-password -emailVerificationOTP -passwordResetOTP")
    .populate("approvedBy", "name email");

  if (!teacher) throw new Error("Teacher not found");

  const Question = require("../models/Question");
  const questionStats = await Question.aggregate([
    { $match: { createdBy: teacher._id } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  const qStats = { draft: 0, pending: 0, approved: 0, rejected: 0 };
  questionStats.forEach((s) => {
    qStats[s._id] = s.count;
  });

  return { teacher: teacher.getPublicProfile(), questionStats: qStats };
};

const createTeacher = async (teacherData, adminId) => {
  const { name, email, subject, school, experience, qualification } =
    teacherData;

  if (!name || !email || !subject) {
    throw new Error("Name, email and subject are required");
  }

  const existing = await Teacher.findOne({ email: email.toLowerCase() });
  if (existing) throw new Error("A teacher with this email already exists");

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
    approvedBy: adminId,
    approvedAt: new Date(),
  });

  await sendTeacherWelcomeEmail(teacher, temporaryPassword);

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "create_teacher",
      "Teacher",
      teacher._id,
      `Created teacher: ${teacher.name}`,
      null,
    );
  }

  logger.info(`Teacher created — Teacher: ${teacher._id} — Admin: ${adminId}`);

  return teacher.getPublicProfile();
};

const updateTeacher = async (teacherId, updateData, adminId) => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error("Teacher not found");

  const allowedFields = [
    "name",
    "email",
    "subject",
    "school",
    "experience",
    "qualification",
    "subjects",
  ];
  allowedFields.forEach((field) => {
    if (updateData[field] !== undefined) {
      teacher[field] =
        field === "email" ? updateData[field].toLowerCase() : updateData[field];
    }
  });

  await teacher.save({ validateBeforeSave: false });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "update_teacher",
      "Teacher",
      teacherId,
      `Updated teacher: ${teacher.name}`,
      null,
    );
  }

  logger.info(`Teacher updated — Teacher: ${teacherId} — Admin: ${adminId}`);

  return teacher.getPublicProfile();
};

const approveTeacher = async (teacherId, adminId) => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error("Teacher not found");
  if (teacher.isApproved) throw new Error("Teacher is already approved");

  teacher.isApproved = true;
  teacher.approvedBy = adminId;
  teacher.approvedAt = new Date();
  await teacher.save({ validateBeforeSave: false });

  await Notification.createNotification({
    recipientId: teacherId,
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

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "approve_teacher",
      "Teacher",
      teacherId,
      `Approved teacher: ${teacher.name}`,
      null,
    );
  }

  logger.info(`Teacher approved — Teacher: ${teacherId} — Admin: ${adminId}`);

  return teacher.getPublicProfile();
};

const banTeacher = async (teacherId, reason, adminId) => {
  if (!reason) throw new Error("Ban reason is required");

  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error("Teacher not found");
  if (teacher.isBanned) throw new Error("Teacher is already banned");

  teacher.isBanned = true;
  teacher.banReason = reason;
  await teacher.save({ validateBeforeSave: false });

  await Session.invalidateAllByUser(teacherId, "account_banned");

  await Notification.createNotification({
    recipientId: teacherId,
    recipientModel: "Teacher",
    recipientRole: "teacher",
    type: "announcement",
    title: "🚫 Account Suspended",
    message: `Your account has been suspended. Reason: ${reason}`,
    priority: "urgent",
  });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "ban_teacher",
      "Teacher",
      teacherId,
      `Banned: ${reason}`,
      null,
    );
  }

  logger.info(`Teacher banned — Teacher: ${teacherId} — Admin: ${adminId}`);

  return { banned: true };
};

const unbanTeacher = async (teacherId, adminId) => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error("Teacher not found");
  if (!teacher.isBanned) throw new Error("Teacher is not banned");

  teacher.isBanned = false;
  teacher.banReason = null;
  await teacher.save({ validateBeforeSave: false });

  await Notification.createNotification({
    recipientId: teacherId,
    recipientModel: "Teacher",
    recipientRole: "teacher",
    type: "announcement",
    title: "✅ Account Restored",
    message: "Your teacher account has been restored. Welcome back!",
    priority: "high",
  });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "unban_teacher",
      "Teacher",
      teacherId,
      `Unbanned teacher`,
      null,
    );
  }

  logger.info(`Teacher unbanned — Teacher: ${teacherId} — Admin: ${adminId}`);

  return { unbanned: true };
};

const deleteTeacher = async (teacherId, adminId) => {
  const teacher = await Teacher.findById(teacherId);
  if (!teacher) throw new Error("Teacher not found");

  if (teacher.avatarPublicId) await deleteImage(teacher.avatarPublicId);

  await Session.invalidateAllByUser(teacherId, "user_logout");

  teacher.isActive = false;
  teacher.email = `deleted_${Date.now()}_${teacher.email}`;
  await teacher.save({ validateBeforeSave: false });

  const admin = await Admin.findById(adminId);
  if (admin) {
    await admin.logActivity(
      "delete_teacher",
      "Teacher",
      teacherId,
      `Deleted teacher: ${teacher.name}`,
      null,
    );
  }

  logger.info(`Teacher deleted — Teacher: ${teacherId} — Admin: ${adminId}`);

  return { deleted: true };
};

const getUserStats = async () => {
  const [studentStats, teacherStats, sessionStats, newThisWeek] =
    await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: null,
            total: { $sum: 1 },
            active: { $sum: { $cond: ["$isActive", 1, 0] } },
            banned: { $sum: { $cond: ["$isBanned", 1, 0] } },
            verified: { $sum: { $cond: ["$isEmailVerified", 1, 0] } },
            grade11: {
              $sum: { $cond: [{ $eq: ["$grade", "Grade 11"] }, 1, 0] },
            },
            grade12: {
              $sum: { $cond: [{ $eq: ["$grade", "Grade 12"] }, 1, 0] },
            },
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
      Promise.all([
        User.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
        Teacher.countDocuments({
          createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        }),
      ]),
    ]);

  const sessionMap = {};
  sessionStats.forEach((s) => {
    sessionMap[s._id] = s.count;
  });

  return {
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
      students: newThisWeek[0],
      teachers: newThisWeek[1],
    },
  };
};

module.exports = {
  getAllStudents,
  getStudentById,
  updateStudent,
  banStudent,
  unbanStudent,
  deleteStudent,
  getAllTeachers,
  getTeacherById,
  createTeacher,
  updateTeacher,
  approveTeacher,
  banTeacher,
  unbanTeacher,
  deleteTeacher,
  getUserStats,
};
