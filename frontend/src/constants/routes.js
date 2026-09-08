export const ROUTES = {
  // Public
  LANDING: "/",
  VERIFY_EMAIL: "/verify-email",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",

  // Student Auth
  STUDENT_LOGIN: "/login",
  STUDENT_REGISTER: "/register",

  // Student Pages
  STUDENT_HOME: "/student/home",
  STUDENT_SUBJECTS: "/student/subjects",
  STUDENT_QUIZ: "/student/quiz",
  STUDENT_RESULTS: "/student/results",
  STUDENT_SCORES: "/student/scores",
  STUDENT_LEADERBOARD: "/student/leaderboard",
  STUDENT_PROFILE: "/student/profile",
  STUDENT_STUDY_TIPS: "/student/study-tips",
  STUDENT_AI_CHAT: "/student/ai-chat",

  // Teacher Auth
  TEACHER_LOGIN: "/teacher/login",

  // Teacher Pages
  TEACHER_DASHBOARD: "/teacher/dashboard",
  TEACHER_CREATE_QUESTION: "/teacher/create-question",
  TEACHER_MANAGE_QUESTIONS: "/teacher/manage-questions",
  TEACHER_AI_GENERATE: "/teacher/ai-generate",
  TEACHER_PROFILE: "/teacher/profile",
  TEACHER_ANALYTICS: "/teacher/analytics",

  // Admin Auth
  ADMIN_LOGIN: "/admin/login",

  // Admin Pages
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_STUDENTS: "/admin/students",
  ADMIN_TEACHERS: "/admin/teachers",
  ADMIN_QUESTIONS: "/admin/questions",
  ADMIN_APPROVE_QUESTIONS: "/admin/approve-questions",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_SETTINGS: "/admin/settings",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
};

export const getQuizRoute = (subject) => `/student/quiz/${subject}`;
export const getResultsRoute = (scoreId) => `/student/results/${scoreId}`;
export const getPublicProfileRoute = (userId) =>
  `/student/profile/public/${userId}`;

export const HOME_BY_ROLE = {
  student: ROUTES.STUDENT_HOME,
  teacher: ROUTES.TEACHER_DASHBOARD,
  admin: ROUTES.ADMIN_DASHBOARD,
};

export const LOGIN_BY_ROLE = {
  student: ROUTES.STUDENT_LOGIN,
  teacher: ROUTES.TEACHER_LOGIN,
  admin: ROUTES.ADMIN_LOGIN,
};
