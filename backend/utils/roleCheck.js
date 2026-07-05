const ROLES = {
  STUDENT: "student",
  TEACHER: "teacher",
  ADMIN: "admin",
};

const PERMISSIONS = {
  // Student permissions
  TAKE_QUIZ: "take_quiz",
  VIEW_OWN_SCORES: "view_own_scores",
  VIEW_LEADERBOARD: "view_leaderboard",
  VIEW_OWN_PROFILE: "view_own_profile",
  UPDATE_OWN_PROFILE: "update_own_profile",
  VIEW_STUDY_TIPS: "view_study_tips",
  VIEW_QUESTIONS: "view_questions",

  // Teacher permissions
  CREATE_QUESTION: "create_question",
  UPDATE_OWN_QUESTION: "update_own_question",
  DELETE_OWN_QUESTION: "delete_own_question",
  VIEW_ALL_QUESTIONS: "view_all_questions",
  GENERATE_AI_QUESTION: "generate_ai_question",
  VIEW_STUDENT_RESULTS: "view_student_results",
  VIEW_TEACHER_ANALYTICS: "view_teacher_analytics",
  UPDATE_TEACHER_PROFILE: "update_teacher_profile",

  // Admin permissions
  MANAGE_ALL_USERS: "manage_all_users",
  MANAGE_ALL_QUESTIONS: "manage_all_questions",
  APPROVE_QUESTIONS: "approve_questions",
  DELETE_ANY_QUESTION: "delete_any_question",
  VIEW_ALL_ANALYTICS: "view_all_analytics",
  MANAGE_TEACHERS: "manage_teachers",
  MANAGE_STUDENTS: "manage_students",
  VIEW_REPORTS: "view_reports",
  MANAGE_SETTINGS: "manage_settings",
  VIEW_ALL_SCORES: "view_all_scores",
  MANAGE_NOTIFICATIONS: "manage_notifications",
};

const ROLE_PERMISSIONS = {
  [ROLES.STUDENT]: [
    PERMISSIONS.TAKE_QUIZ,
    PERMISSIONS.VIEW_OWN_SCORES,
    PERMISSIONS.VIEW_LEADERBOARD,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.VIEW_STUDY_TIPS,
    PERMISSIONS.VIEW_QUESTIONS,
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.TAKE_QUIZ,
    PERMISSIONS.VIEW_OWN_SCORES,
    PERMISSIONS.VIEW_LEADERBOARD,
    PERMISSIONS.VIEW_OWN_PROFILE,
    PERMISSIONS.UPDATE_OWN_PROFILE,
    PERMISSIONS.VIEW_STUDY_TIPS,
    PERMISSIONS.VIEW_QUESTIONS,
    PERMISSIONS.CREATE_QUESTION,
    PERMISSIONS.UPDATE_OWN_QUESTION,
    PERMISSIONS.DELETE_OWN_QUESTION,
    PERMISSIONS.VIEW_ALL_QUESTIONS,
    PERMISSIONS.GENERATE_AI_QUESTION,
    PERMISSIONS.VIEW_STUDENT_RESULTS,
    PERMISSIONS.VIEW_TEACHER_ANALYTICS,
    PERMISSIONS.UPDATE_TEACHER_PROFILE,
  ],

  [ROLES.ADMIN]: [...Object.values(PERMISSIONS)],
};

// Check if a role has a specific permission
const hasPermission = (role, permission) => {
  if (!role || !permission) return false;
  const permissions = ROLE_PERMISSIONS[role];
  if (!permissions) return false;
  return permissions.includes(permission);
};

// Check if a role has all of the given permissions
const hasAllPermissions = (role, permissionsToCheck) => {
  if (!role || !Array.isArray(permissionsToCheck)) return false;
  return permissionsToCheck.every((permission) =>
    hasPermission(role, permission),
  );
};

// Check if a role has any of the given permissions
const hasAnyPermission = (role, permissionsToCheck) => {
  if (!role || !Array.isArray(permissionsToCheck)) return false;
  return permissionsToCheck.some((permission) =>
    hasPermission(role, permission),
  );
};

// Check if role is valid
const isValidRole = (role) => {
  return Object.values(ROLES).includes(role);
};

// Check if user is admin
const isAdmin = (role) => {
  return role === ROLES.ADMIN;
};

// Check if user is teacher
const isTeacher = (role) => {
  return role === ROLES.TEACHER;
};

// Check if user is student
const isStudent = (role) => {
  return role === ROLES.STUDENT;
};

// Check if user is teacher or admin
const isTeacherOrAdmin = (role) => {
  return role === ROLES.TEACHER || role === ROLES.ADMIN;
};

// Check if user owns a resource
const isOwner = (userId, resourceOwnerId) => {
  if (!userId || !resourceOwnerId) return false;
  return userId.toString() === resourceOwnerId.toString();
};

// Check if user can access resource (owner or admin)
const canAccess = (userId, resourceOwnerId, role) => {
  if (isAdmin(role)) return true;
  return isOwner(userId, resourceOwnerId);
};

// Check if user can modify resource (owner or admin)
const canModify = (userId, resourceOwnerId, role) => {
  if (isAdmin(role)) return true;
  return isOwner(userId, resourceOwnerId);
};

// Check if user can delete resource (admin only or owner)
const canDelete = (userId, resourceOwnerId, role) => {
  if (isAdmin(role)) return true;
  return isOwner(userId, resourceOwnerId);
};

// Get all permissions for a role
const getRolePermissions = (role) => {
  if (!isValidRole(role)) return [];
  return ROLE_PERMISSIONS[role] || [];
};

// Get role hierarchy level (higher = more access)
const getRoleLevel = (role) => {
  const levels = {
    [ROLES.STUDENT]: 1,
    [ROLES.TEACHER]: 2,
    [ROLES.ADMIN]: 3,
  };
  return levels[role] || 0;
};

// Check if role has higher or equal level than required role
const hasMinimumRole = (userRole, requiredRole) => {
  return getRoleLevel(userRole) >= getRoleLevel(requiredRole);
};

// Format role for display
const formatRole = (role) => {
  const formats = {
    [ROLES.STUDENT]: "Student",
    [ROLES.TEACHER]: "Teacher",
    [ROLES.ADMIN]: "Administrator",
  };
  return formats[role] || "Unknown";
};

// Get dashboard route based on role
const getDashboardRoute = (role) => {
  const routes = {
    [ROLES.STUDENT]: "/student/home",
    [ROLES.TEACHER]: "/teacher/dashboard",
    [ROLES.ADMIN]: "/admin/dashboard",
  };
  return routes[role] || "/";
};

module.exports = {
  ROLES,
  PERMISSIONS,
  ROLE_PERMISSIONS,
  hasPermission,
  hasAllPermissions,
  hasAnyPermission,
  isValidRole,
  isAdmin,
  isTeacher,
  isStudent,
  isTeacherOrAdmin,
  isOwner,
  canAccess,
  canModify,
  canDelete,
  getRolePermissions,
  getRoleLevel,
  hasMinimumRole,
  formatRole,
  getDashboardRoute,
};
