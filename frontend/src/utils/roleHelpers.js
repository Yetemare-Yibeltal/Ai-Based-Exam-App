import { ROUTES } from "../constants/routes";

export const getHomeRoute = (role) => {
  if (role === "admin") return ROUTES.ADMIN_DASHBOARD;
  if (role === "teacher") return ROUTES.TEACHER_DASHBOARD;
  return ROUTES.STUDENT_HOME;
};

export const getLoginRoute = (role) => {
  if (role === "admin") return ROUTES.ADMIN_LOGIN;
  if (role === "teacher") return ROUTES.TEACHER_LOGIN;
  return ROUTES.STUDENT_LOGIN;
};

export const canAccess = (userRole, allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};

export const isStudent = (role) => role === "student";
export const isTeacher = (role) => role === "teacher";
export const isAdmin = (role) => role === "admin";

export const getRoleLabel = (role) => {
  const labels = {
    student: "Student",
    teacher: "Teacher",
    admin: "Administrator",
  };
  return labels[role] || role;
};

export const getRoleBadgeColor = (role) => {
  const colors = {
    student: "bg-blue-100 text-blue-800",
    teacher: "bg-green-100 text-green-800",
    admin: "bg-red-100 text-red-800",
  };
  return colors[role] || "bg-gray-100 text-gray-700";
};

export const getRoleIcon = (role) => {
  const icons = { student: "👨‍🎓", teacher: "👨‍🏫", admin: "👨‍💼" };
  return icons[role] || "👤";
};

export const getNavItems = (role) => {
  if (role === "student") {
    return [
      { label: "Home", path: ROUTES.STUDENT_HOME, icon: "🏠" },
      { label: "Practice", path: ROUTES.STUDENT_SUBJECTS, icon: "📝" },
      { label: "Scores", path: ROUTES.STUDENT_SCORES, icon: "📊" },
      { label: "Leaderboard", path: ROUTES.STUDENT_LEADERBOARD, icon: "🏆" },
      { label: "Study Tips", path: ROUTES.STUDENT_STUDY_TIPS, icon: "💡" },
      { label: "AI Chat", path: ROUTES.STUDENT_AI_CHAT, icon: "🤖" },
      { label: "Profile", path: ROUTES.STUDENT_PROFILE, icon: "👤" },
    ];
  }
  if (role === "teacher") {
    return [
      { label: "Dashboard", path: ROUTES.TEACHER_DASHBOARD, icon: "📊" },
      {
        label: "Create Question",
        path: ROUTES.TEACHER_CREATE_QUESTION,
        icon: "✍️",
      },
      {
        label: "My Questions",
        path: ROUTES.TEACHER_MANAGE_QUESTIONS,
        icon: "📋",
      },
      { label: "AI Generate", path: ROUTES.TEACHER_AI_GENERATE, icon: "🤖" },
      { label: "Analytics", path: ROUTES.TEACHER_ANALYTICS, icon: "📈" },
      { label: "Profile", path: ROUTES.TEACHER_PROFILE, icon: "👤" },
    ];
  }
  if (role === "admin") {
    return [
      { label: "Dashboard", path: ROUTES.ADMIN_DASHBOARD, icon: "📊" },
      { label: "Students", path: ROUTES.ADMIN_STUDENTS, icon: "👨‍🎓" },
      { label: "Teachers", path: ROUTES.ADMIN_TEACHERS, icon: "👨‍🏫" },
      { label: "Questions", path: ROUTES.ADMIN_QUESTIONS, icon: "❓" },
      { label: "Approve", path: ROUTES.ADMIN_APPROVE_QUESTIONS, icon: "✅" },
      { label: "Analytics", path: ROUTES.ADMIN_ANALYTICS, icon: "📈" },
      { label: "Reports", path: ROUTES.ADMIN_REPORTS, icon: "📄" },
      { label: "Settings", path: ROUTES.ADMIN_SETTINGS, icon: "⚙️" },
    ];
  }
  return [];
};
