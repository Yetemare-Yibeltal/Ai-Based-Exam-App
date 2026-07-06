const express = require("express");
const router = express.Router();

// ── IMPORT ALL ROUTES ──────────────────────────────────────

// Auth routes (shared for all roles)
const authRoutes = require("./auth");

// Student routes
const studentAuthRoutes = require("./student/auth");
const studentQuizRoutes = require("./student/quiz");
const studentScoresRoutes = require("./student/scores");
const studentProfileRoutes = require("./student/profile");
const studentLeaderboardRoutes = require("./student/leaderboard");
const studentStudyTipsRoutes = require("./student/studyTips");

// Teacher routes
const teacherAuthRoutes = require("./teacher/auth");
const teacherQuestionsRoutes = require("./teacher/questions");
const teacherProfileRoutes = require("./teacher/profile");
const teacherAnalyticsRoutes = require("./teacher/analytics");

// Admin routes
const adminAuthRoutes = require("./admin/auth");
const adminUsersRoutes = require("./admin/users");
const adminQuestionsRoutes = require("./admin/questions");
const adminAnalyticsRoutes = require("./admin/analytics");
const adminSettingsRoutes = require("./admin/settings");
const adminReportsRoutes = require("./admin/reports");

// Shared routes
const questionsRoutes = require("./questions");
const scoresRoutes = require("./scores");
const leaderboardRoutes = require("./leaderboard");
const notificationsRoutes = require("./notifications");
const usersRoutes = require("./users");
const aiRoutes = require("./ai");

// ── MOUNT ROUTES ───────────────────────────────────────────

// Auth
router.use("/auth", authRoutes);

// Student
router.use("/student/auth", studentAuthRoutes);
router.use("/student/quiz", studentQuizRoutes);
router.use("/student/scores", studentScoresRoutes);
router.use("/student/profile", studentProfileRoutes);
router.use("/student/leaderboard", studentLeaderboardRoutes);
router.use("/student/study-tips", studentStudyTipsRoutes);

// Teacher
router.use("/teacher/auth", teacherAuthRoutes);
router.use("/teacher/questions", teacherQuestionsRoutes);
router.use("/teacher/profile", teacherProfileRoutes);
router.use("/teacher/analytics", teacherAnalyticsRoutes);

// Admin
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin/users", adminUsersRoutes);
router.use("/admin/questions", adminQuestionsRoutes);
router.use("/admin/analytics", adminAnalyticsRoutes);
router.use("/admin/settings", adminSettingsRoutes);
router.use("/admin/reports", adminReportsRoutes);

// Shared
router.use("/questions", questionsRoutes);
router.use("/scores", scoresRoutes);
router.use("/leaderboard", leaderboardRoutes);
router.use("/notifications", notificationsRoutes);
router.use("/users", usersRoutes);
router.use("/ai", aiRoutes);

// API info route
router.get("/", (req, res) => {
  res.json({
    success: true,
    message: "HEROY API v1.0.0",
    description: "AI-Based Ethiopian University Entrance Exam Practice App",
    endpoints: {
      auth: "/api/auth",
      student: {
        auth: "/api/student/auth",
        quiz: "/api/student/quiz",
        scores: "/api/student/scores",
        profile: "/api/student/profile",
        leaderboard: "/api/student/leaderboard",
        studyTips: "/api/student/study-tips",
      },
      teacher: {
        auth: "/api/teacher/auth",
        questions: "/api/teacher/questions",
        profile: "/api/teacher/profile",
        analytics: "/api/teacher/analytics",
      },
      admin: {
        auth: "/api/admin/auth",
        users: "/api/admin/users",
        questions: "/api/admin/questions",
        analytics: "/api/admin/analytics",
        settings: "/api/admin/settings",
        reports: "/api/admin/reports",
      },
      shared: {
        questions: "/api/questions",
        scores: "/api/scores",
        leaderboard: "/api/leaderboard",
        notifications: "/api/notifications",
        users: "/api/users",
        ai: "/api/ai",
      },
      docs: "/api/docs",
      health: "/health",
    },
  });
});

module.exports = router;
