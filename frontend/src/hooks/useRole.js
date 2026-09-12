import { useMemo } from "react";
import useAuthStore from "../store/useAuthStore";
import { hasPermission as checkPermission } from "../constants/roles";

const useRole = () => {
  const { user, role, isAuthenticated } = useAuthStore();

  const isStudent = useMemo(() => role === "student", [role]);
  const isTeacher = useMemo(() => role === "teacher", [role]);
  const isAdmin = useMemo(() => role === "admin", [role]);

  const hasPermission = useMemo(
    () => (permission) => {
      if (!role) return false;
      return checkPermission(role, permission);
    },
    [role],
  );

  const canAccess = useMemo(
    () =>
      (allowedRoles = []) => {
        if (!role) return false;
        if (allowedRoles.length === 0) return true;
        return allowedRoles.includes(role);
      },
    [role],
  );

  const isEmailVerified = useMemo(() => user?.isEmailVerified || false, [user]);
  const isApproved = useMemo(() => {
    if (role === "teacher") return user?.isApproved || false;
    return true;
  }, [role, user]);

  const isBanned = useMemo(() => user?.isBanned || false, [user]);
  const isActive = useMemo(() => user?.isActive !== false, [user]);

  const canTakeQuiz = useMemo(
    () =>
      isStudent && isAuthenticated && isEmailVerified && isActive && !isBanned,
    [isStudent, isAuthenticated, isEmailVerified, isActive, isBanned],
  );

  const canCreateQuestion = useMemo(
    () => isTeacher && isAuthenticated && isApproved && !isBanned,
    [isTeacher, isAuthenticated, isApproved, isBanned],
  );

  const canManageUsers = useMemo(
    () => isAdmin && isAuthenticated,
    [isAdmin, isAuthenticated],
  );

  return {
    role,
    user,
    isAuthenticated,
    isStudent,
    isTeacher,
    isAdmin,
    isEmailVerified,
    isApproved,
    isBanned,
    isActive,
    canTakeQuiz,
    canCreateQuestion,
    canManageUsers,
    hasPermission,
    canAccess,
  };
};

export default useRole;
