export const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

export const ROLE_LABELS = {
  student: "Student",
  teacher: "Teacher",
  admin: "Administrator",
};

export const ROLE_COLORS = {
  student: "bg-blue-100 text-blue-800",
  teacher: "bg-green-100 text-green-800",
  admin: "bg-red-100 text-red-800",
};

export const PERMISSIONS = {
  student: [
    "take_quiz",
    "view_scores",
    "view_leaderboard",
    "view_profile",
    "get_study_tips",
    "get_ai_feedback",
    "view_notifications",
  ],
  teacher: [
    "create_question",
    "edit_own_question",
    "delete_own_question",
    "submit_question",
    "generate_ai_question",
    "validate_ai_question",
    "view_analytics",
    "view_profile",
    "view_notifications",
  ],
  admin: [
    "manage_students",
    "manage_teachers",
    "approve_questions",
    "reject_questions",
    "manage_questions",
    "view_analytics",
    "view_reports",
    "manage_settings",
    "send_announcements",
    "manage_notifications",
    "export_data",
  ],
};

export const hasPermission = (role, permission) => {
  return PERMISSIONS[role]?.includes(permission) || false;
};

export const isAdmin = (role) => role === ROLES.ADMIN;
export const isTeacher = (role) => role === ROLES.TEACHER;
export const isStudent = (role) => role === ROLES.STUDENT;
