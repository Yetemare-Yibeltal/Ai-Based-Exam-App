import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import { getHomeRoute } from "../utils/roleHelpers";
import { ROUTES } from "../constants/routes";

const useAuth = () => {
  const navigate = useNavigate();
  const {
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    updateUser,
    clearError,
  } = useAuthStore();

  const handleLogin = useCallback(
    async (email, password, userRole = "student") => {
      const result = await login(email, password, userRole);
      if (result.success) {
        toast.success(`Welcome back, ${result.user.name}!`);
        navigate(getHomeRoute(result.user.role));
      } else {
        toast.error(result.error || "Login failed");
      }
      return result;
    },
    [login, navigate],
  );

  const handleRegister = useCallback(
    async (data) => {
      const result = await register(data);
      if (result.success) {
        toast.success("Account created! Please verify your email.");
        navigate(ROUTES.VERIFY_EMAIL);
      } else {
        toast.error(result.error || "Registration failed");
      }
      return result;
    },
    [register, navigate],
  );

  const handleLogout = useCallback(async () => {
    await logout();
    toast.success("Logged out successfully");
    if (role === "admin") {
      navigate(ROUTES.ADMIN_LOGIN);
    } else if (role === "teacher") {
      navigate(ROUTES.TEACHER_LOGIN);
    } else {
      navigate(ROUTES.STUDENT_LOGIN);
    }
  }, [logout, navigate, role]);

  const isStudent = role === "student";
  const isTeacher = role === "teacher";
  const isAdmin = role === "admin";

  return {
    user,
    role,
    isAuthenticated,
    isLoading,
    error,
    isStudent,
    isTeacher,
    isAdmin,
    handleLogin,
    handleRegister,
    handleLogout,
    updateUser,
    clearError,
  };
};

export default useAuth;
