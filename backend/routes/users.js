const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");
const {
  validateMongoId,
  validatePaginationQuery,
} = require("../middleware/validate");
const { adminLimiter } = require("../middleware/rateLimiter");
const { cacheAdminStats } = require("../middleware/cache");

const {
  getUserStats,
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
} = require("../controllers/usersController");

router.use(protect);
router.use(adminOnly);

router.get("/stats", cacheAdminStats, getUserStats);

router.get("/students", validatePaginationQuery, getAllStudents);
router.get("/students/:id", validateMongoId("id"), getStudentById);
router.put("/students/:id", validateMongoId("id"), updateStudent);
router.put("/students/:id/ban", validateMongoId("id"), banStudent);
router.put("/students/:id/unban", validateMongoId("id"), unbanStudent);
router.delete("/students/:id", validateMongoId("id"), deleteStudent);

router.get("/teachers", validatePaginationQuery, getAllTeachers);
router.get("/teachers/:id", validateMongoId("id"), getTeacherById);
router.post("/teachers", adminLimiter, createTeacher);
router.put("/teachers/:id", validateMongoId("id"), updateTeacher);
router.put("/teachers/:id/approve", validateMongoId("id"), approveTeacher);
router.put("/teachers/:id/ban", validateMongoId("id"), banTeacher);
router.put("/teachers/:id/unban", validateMongoId("id"), unbanTeacher);
router.delete("/teachers/:id", validateMongoId("id"), deleteTeacher);

module.exports = router;
