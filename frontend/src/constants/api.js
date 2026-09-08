export const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    REFRESH_TOKEN: "/auth/refresh-token",
    VERIFY_EMAIL: "/auth/verify-email",
    RESEND_VERIFICATION: "/auth/resend-verification",
    FORGOT_PASSWORD: "/auth/forgot-password",
    RESET_PASSWORD: "/auth/reset-password",
    CHANGE_PASSWORD: "/auth/change-password",
    ME: "/auth/me",
    UPDATE_PROFILE: "/auth/update-profile",
    UPLOAD_AVATAR: "/auth/upload-avatar",
    DELETE_ACCOUNT: "/auth/delete-account",
  },

  // Student Auth
  STUDENT_AUTH: {
    REGISTER: "/student/auth/register",
    LOGIN: "/student/auth/login",
    LOGOUT: "/student/auth/logout",
    REFRESH_TOKEN: "/student/auth/refresh-token",
    VERIFY_EMAIL: "/student/auth/verify-email",
    RESEND_VERIFICATION: "/student/auth/resend-verification",
    FORGOT_PASSWORD: "/student/auth/forgot-password",
    RESET_PASSWORD: "/student/auth/reset-password",
    CHANGE_PASSWORD: "/student/auth/change-password",
    ME: "/student/auth/me",
    UPDATE_PROFILE: "/student/auth/update-profile",
    UPLOAD_AVATAR: "/student/auth/upload-avatar",
    DELETE_ACCOUNT: "/student/auth/delete-account",
  },

  // Student Quiz
  STUDENT_QUIZ: {
    SUBJECTS: "/student/quiz/subjects",
    QUESTIONS: (subject) => `/student/quiz/questions/${subject}`,
    START: "/student/quiz/start",
    SUBMIT: "/student/quiz/submit",
    HISTORY: "/student/quiz/history",
    BY_ID: (id) => `/student/quiz/${id}`,
    RETRY: (id) => `/student/quiz/retry/${id}`,
    STATS: "/student/quiz/stats/overview",
  },

  // Student Scores
  STUDENT_SCORES: {
    LIST: "/student/scores",
    SUMMARY: "/student/scores/summary",
    BEST: "/student/scores/best",
    BY_ID: (id) => `/student/scores/${id}`,
    BY_SUBJECT: (subject) => `/student/scores/subject/${subject}`,
    PROGRESS: (subject) => `/student/scores/progress/${subject}`,
    SUBJECT_STATS: "/student/scores/stats/subjects",
    DELETE: (id) => `/student/scores/${id}`,
  },

  // Student Profile
  STUDENT_PROFILE: {
    GET: "/student/profile",
    UPDATE: "/student/profile",
    UPLOAD_AVATAR: "/student/profile/avatar",
    DELETE_AVATAR: "/student/profile/avatar",
    STREAK: "/student/profile/streak",
    ACHIEVEMENTS: "/student/profile/achievements",
    WEAK_SUBJECTS: "/student/profile/weak-subjects",
    NOTIFICATIONS: "/student/profile/notifications",
    ACTIVITY: "/student/profile/activity",
    PUBLIC: (id) => `/student/profile/public/${id}`,
  },

  // Student Leaderboard
  STUDENT_LEADERBOARD: {
    GLOBAL: "/student/leaderboard",
    MY_RANK: "/student/leaderboard/my-rank",
    TOP: "/student/leaderboard/top",
    WEEKLY: "/student/leaderboard/weekly",
    MONTHLY: "/student/leaderboard/monthly",
    BY_GRADE: "/student/leaderboard/grade",
    BY_SCHOOL: "/student/leaderboard/school",
    BY_SUBJECT: (subject) => `/student/leaderboard/subject/${subject}`,
  },

  // Student Study Tips
  STUDENT_STUDY_TIPS: {
    GET: "/student/study-tips",
    BY_SUBJECT: (subject) => `/student/study-tips/subject/${subject}`,
    PERSONALIZED_PLAN: "/student/study-tips/personalized-plan",
    EXAM_TIPS: "/student/study-tips/exam-tips",
    TIME_MANAGEMENT: "/student/study-tips/time-management",
  },

  // Teacher Auth
  TEACHER_AUTH: {
    LOGIN: "/teacher/auth/login",
    LOGOUT: "/teacher/auth/logout",
    REFRESH_TOKEN: "/teacher/auth/refresh-token",
    VERIFY_EMAIL: "/teacher/auth/verify-email",
    FORGOT_PASSWORD: "/teacher/auth/forgot-password",
    RESET_PASSWORD: "/teacher/auth/reset-password",
    CHANGE_PASSWORD: "/teacher/auth/change-password",
    ME: "/teacher/auth/me",
    UPDATE_PROFILE: "/teacher/auth/update-profile",
    UPLOAD_AVATAR: "/teacher/auth/upload-avatar",
  },

  // Teacher Questions
  TEACHER_QUESTIONS: {
    LIST: "/teacher/questions",
    CREATE: "/teacher/questions",
    BY_ID: (id) => `/teacher/questions/${id}`,
    UPDATE: (id) => `/teacher/questions/${id}`,
    DELETE: (id) => `/teacher/questions/${id}`,
    AI_GENERATE: "/teacher/questions/ai/generate",
    SUBMIT: (id) => `/teacher/questions/${id}/submit`,
    APPROVAL_STATUS: (id) => `/teacher/questions/${id}/approval-status`,
    UPLOAD_IMAGE: (id) => `/teacher/questions/${id}/image`,
  },

  // Teacher Profile
  TEACHER_PROFILE: {
    GET: "/teacher/profile",
    UPDATE: "/teacher/profile",
    UPLOAD_AVATAR: "/teacher/profile/avatar",
    DELETE_AVATAR: "/teacher/profile/avatar",
    STATS: "/teacher/profile/stats",
    AI_USAGE: "/teacher/profile/ai-usage",
  },

  // Teacher Analytics
  TEACHER_ANALYTICS: {
    OVERVIEW: "/teacher/analytics/overview",
    QUESTIONS: "/teacher/analytics/questions",
    SUBJECTS: "/teacher/analytics/subjects",
    STUDENTS: "/teacher/analytics/students",
    AI: "/teacher/analytics/ai",
  },

  // Admin Auth
  ADMIN_AUTH: {
    LOGIN: "/admin/auth/login",
    LOGOUT: "/admin/auth/logout",
    REFRESH_TOKEN: "/admin/auth/refresh-token",
    FORGOT_PASSWORD: "/admin/auth/forgot-password",
    RESET_PASSWORD: "/admin/auth/reset-password",
    CHANGE_PASSWORD: "/admin/auth/change-password",
    ME: "/admin/auth/me",
    UPDATE_PROFILE: "/admin/auth/update-profile",
    UPLOAD_AVATAR: "/admin/auth/upload-avatar",
  },

  // Admin Users
  ADMIN_USERS: {
    STATS: "/admin/users/stats",
    STUDENTS: "/admin/users/students",
    STUDENT_BY_ID: (id) => `/admin/users/students/${id}`,
    UPDATE_STUDENT: (id) => `/admin/users/students/${id}`,
    BAN_STUDENT: (id) => `/admin/users/students/${id}/ban`,
    UNBAN_STUDENT: (id) => `/admin/users/students/${id}/unban`,
    DELETE_STUDENT: (id) => `/admin/users/students/${id}`,
    TEACHERS: "/admin/users/teachers",
    TEACHER_BY_ID: (id) => `/admin/users/teachers/${id}`,
    CREATE_TEACHER: "/admin/users/teachers",
    UPDATE_TEACHER: (id) => `/admin/users/teachers/${id}`,
    APPROVE_TEACHER: (id) => `/admin/users/teachers/${id}/approve`,
    BAN_TEACHER: (id) => `/admin/users/teachers/${id}/ban`,
    UNBAN_TEACHER: (id) => `/admin/users/teachers/${id}/unban`,
    DELETE_TEACHER: (id) => `/admin/users/teachers/${id}`,
  },

  // Admin Questions
  ADMIN_QUESTIONS: {
    LIST: "/admin/questions",
    STATS: "/admin/questions/stats",
    PENDING: "/admin/questions/pending",
    BY_ID: (id) => `/admin/questions/${id}`,
    UPDATE: (id) => `/admin/questions/${id}`,
    DELETE: (id) => `/admin/questions/${id}`,
    APPROVE: (id) => `/admin/questions/${id}/approve`,
    REJECT: (id) => `/admin/questions/${id}/reject`,
    FEATURE: (id) => `/admin/questions/${id}/feature`,
    BULK_APPROVE: "/admin/questions/bulk-approve",
    BULK_REJECT: "/admin/questions/bulk-reject",
  },

  // Admin Analytics
  ADMIN_ANALYTICS: {
    OVERVIEW: "/admin/analytics/overview",
    USERS: "/admin/analytics/users",
    QUESTIONS: "/admin/analytics/questions",
    SCORES: "/admin/analytics/scores",
    AI: "/admin/analytics/ai",
    GROWTH: "/admin/analytics/growth",
  },

  // Admin Settings
  ADMIN_SETTINGS: {
    GET: "/admin/settings",
    UPDATE: "/admin/settings",
    SYSTEM: "/admin/settings/system",
    CLEAR_CACHE: "/admin/settings/clear-cache",
    ACTIVITY_LOG: "/admin/settings/activity-log",
    ANNOUNCEMENT: "/admin/settings/announcement",
  },

  // Admin Reports
  ADMIN_REPORTS: {
    STUDENTS: "/admin/reports/students",
    QUESTIONS: "/admin/reports/questions",
    PERFORMANCE: "/admin/reports/performance",
    AI: "/admin/reports/ai",
    EXPORT_STUDENTS: "/admin/reports/export/students",
    EXPORT_QUESTIONS: "/admin/reports/export/questions",
  },

  // Shared
  QUESTIONS: {
    LIST: "/questions",
    BY_ID: (id) => `/questions/${id}`,
    SUBJECT_STATS: "/questions/stats/subjects",
    CHECK: "/questions/check",
    REPORT: (id) => `/questions/${id}/report`,
  },

  LEADERBOARD: {
    GLOBAL: "/leaderboard",
    TOP: "/leaderboard/top",
    WEEKLY: "/leaderboard/weekly",
    MONTHLY: "/leaderboard/monthly",
    BY_GRADE: "/leaderboard/grade",
    BY_SCHOOL: "/leaderboard/school",
    MY_RANK: "/leaderboard/my-rank",
    BY_SUBJECT: (subject) => `/leaderboard/subject/${subject}`,
  },

  NOTIFICATIONS: {
    LIST: "/notifications",
    UNREAD_COUNT: "/notifications/unread-count",
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: "/notifications/mark-all-read",
    DELETE: (id) => `/notifications/${id}`,
    DELETE_ALL: "/notifications/delete-all",
  },

  AI: {
    STUDY_TIPS: "/ai/study-tips",
    SUBJECT_TIPS: (subject) => `/ai/study-tips/${subject}`,
    PERSONALIZED_PLAN: "/ai/personalized-plan",
    EXAM_TIPS: "/ai/exam-tips",
    TIME_MANAGEMENT: "/ai/time-management",
    WEAK_SUBJECTS: "/ai/weak-subjects",
    SUBJECT_RECOMMENDATIONS: (subject) =>
      `/ai/subject-recommendations/${subject}`,
    EXPLAIN_ANSWER: "/ai/explain-answer",
    BATCH_EXPLAIN: "/ai/batch-explain",
    QUIZ_FEEDBACK: "/ai/quiz-feedback",
    GENERATE_QUESTIONS: "/ai/generate-questions",
    VALIDATE_QUESTION: "/ai/validate-question",
    BATCH_VALIDATE: "/ai/batch-validate",
    MY_HISTORY: "/ai/my-history",
    USAGE_STATS: "/ai/usage-stats",
  },
};

export const REQUEST_TIMEOUT = 30000;
export const AI_REQUEST_TIMEOUT = 60000;

export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  VALIDATION_ERROR: 422,
  TOO_MANY_REQUESTS: 429,
  SERVER_ERROR: 500,
};
