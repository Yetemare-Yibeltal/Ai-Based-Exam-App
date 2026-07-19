const { catchAsync } = require("../middleware/errorHandler");
const {
  successResponse,
  errorResponse,
  notFoundResponse,
  paginatedResponse,
} = require("../utils/apiResponse");
const { getPagination, getPaginationMeta } = require("../utils/pagination");
const usersService = require("../services/users.service");

exports.getUserStats = catchAsync(async (req, res) => {
  const stats = await usersService.getUserStats();
  return successResponse(res, "User statistics retrieved successfully", stats);
});

exports.getAllStudents = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const {
    search,
    grade,
    isActive,
    isBanned,
    isEmailVerified,
    sortBy,
    sortOrder,
  } = req.query;

  const result = await usersService.getAllStudents({
    page,
    limit,
    search,
    grade,
    isActive,
    isBanned,
    isEmailVerified,
    sortBy,
    sortOrder,
  });

  return paginatedResponse(
    res,
    "Students retrieved successfully",
    result.students,
    getPaginationMeta(result.total, page, limit),
  );
});

exports.getStudentById = catchAsync(async (req, res) => {
  const result = await usersService.getStudentById(req.params.id);
  return successResponse(res, "Student retrieved successfully", result);
});

exports.updateStudent = catchAsync(async (req, res) => {
  const student = await usersService.updateStudent(
    req.params.id,
    req.body,
    req.userId,
  );
  return successResponse(res, "Student updated successfully", { student });
});

exports.banStudent = catchAsync(async (req, res) => {
  const { reason } = req.body;
  if (!reason) return errorResponse(res, "Ban reason is required", 400);

  await usersService.banStudent(req.params.id, reason, req.userId);
  return successResponse(res, "Student banned successfully");
});

exports.unbanStudent = catchAsync(async (req, res) => {
  await usersService.unbanStudent(req.params.id, req.userId);
  return successResponse(res, "Student unbanned successfully");
});

exports.deleteStudent = catchAsync(async (req, res) => {
  await usersService.deleteStudent(req.params.id, req.userId);
  return successResponse(res, "Student deleted successfully");
});

exports.getAllTeachers = catchAsync(async (req, res) => {
  const { page, limit } = getPagination(req.query);
  const { search, subject, isApproved, isActive, isBanned, sortBy, sortOrder } =
    req.query;

  const result = await usersService.getAllTeachers({
    page,
    limit,
    search,
    subject,
    isApproved,
    isActive,
    isBanned,
    sortBy,
    sortOrder,
  });

  return paginatedResponse(
    res,
    "Teachers retrieved successfully",
    result.teachers,
    getPaginationMeta(result.total, page, limit),
  );
});

exports.getTeacherById = catchAsync(async (req, res) => {
  const result = await usersService.getTeacherById(req.params.id);
  return successResponse(res, "Teacher retrieved successfully", result);
});

exports.createTeacher = catchAsync(async (req, res) => {
  const teacher = await usersService.createTeacher(req.body, req.userId);
  return successResponse(res, "Teacher created successfully", { teacher });
});

exports.updateTeacher = catchAsync(async (req, res) => {
  const teacher = await usersService.updateTeacher(
    req.params.id,
    req.body,
    req.userId,
  );
  return successResponse(res, "Teacher updated successfully", { teacher });
});

exports.approveTeacher = catchAsync(async (req, res) => {
  const teacher = await usersService.approveTeacher(req.params.id, req.userId);
  return successResponse(res, "Teacher approved successfully", { teacher });
});

exports.banTeacher = catchAsync(async (req, res) => {
  const { reason } = req.body;
  if (!reason) return errorResponse(res, "Ban reason is required", 400);

  await usersService.banTeacher(req.params.id, reason, req.userId);
  return successResponse(res, "Teacher banned successfully");
});

exports.unbanTeacher = catchAsync(async (req, res) => {
  await usersService.unbanTeacher(req.params.id, req.userId);
  return successResponse(res, "Teacher unbanned successfully");
});

exports.deleteTeacher = catchAsync(async (req, res) => {
  await usersService.deleteTeacher(req.params.id, req.userId);
  return successResponse(res, "Teacher deleted successfully");
});
