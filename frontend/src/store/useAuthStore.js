import { create } from "zustand";
import { tokenStorage } from "../utils/storage";
import axiosInstance from "../api/axios";
import { API_ENDPOINTS } from "../constants/api";

const useAuthStore = create((set, get) => ({
  user: null,
  role: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,

  checkAuth: async () => {
    const token = tokenStorage.getAccessToken();
    const user = tokenStorage.getUser();
    const role = tokenStorage.getRole();

    if (token && user) {
      set({
        user,
        role,
        accessToken: token,
        refreshToken: tokenStorage.getRefreshToken(),
        isAuthenticated: true,
        isInitialized: true,
      });
    } else {
      set({ isInitialized: true, isAuthenticated: false });
    }
  },

  login: async (email, password, role = "student") => {
    set({ isLoading: true, error: null });
    try {
      const endpoints = {
        student: API_ENDPOINTS.STUDENT_AUTH.LOGIN,
        teacher: API_ENDPOINTS.TEACHER_AUTH.LOGIN,
        admin: API_ENDPOINTS.ADMIN_AUTH.LOGIN,
      };

      const res = await axiosInstance.post(endpoints[role], {
        email,
        password,
      });
      const { accessToken, refreshToken } = res.data.data;
      const userData =
        res.data.data.user || res.data.data.teacher || res.data.data.admin;

      tokenStorage.setTokens(accessToken, refreshToken);
      tokenStorage.setUser(userData);
      tokenStorage.setRole(userData.role);

      set({
        user: userData,
        role: userData.role,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user: userData };
    } catch (error) {
      const message = error.response?.data?.message || "Login failed";
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (data) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post(
        API_ENDPOINTS.STUDENT_AUTH.REGISTER,
        data,
      );
      const { accessToken, refreshToken, user } = res.data.data;

      tokenStorage.setTokens(accessToken, refreshToken);
      tokenStorage.setUser(user);
      tokenStorage.setRole(user.role);

      set({
        user,
        role: user.role,
        accessToken,
        refreshToken,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return { success: true, user };
    } catch (error) {
      const message = error.response?.data?.message || "Registration failed";
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: async () => {
    const { refreshToken, role } = get();
    try {
      const endpoints = {
        student: API_ENDPOINTS.STUDENT_AUTH.LOGOUT,
        teacher: API_ENDPOINTS.TEACHER_AUTH.LOGOUT,
        admin: API_ENDPOINTS.ADMIN_AUTH.LOGOUT,
      };
      await axiosInstance.post(
        endpoints[role] || API_ENDPOINTS.STUDENT_AUTH.LOGOUT,
        { refreshToken },
      );
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      tokenStorage.clearAll();
      set({
        user: null,
        role: null,
        accessToken: null,
        refreshToken: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData };
    tokenStorage.setUser(updated);
    set({ user: updated });
  },

  setTokens: (accessToken, refreshToken) => {
    tokenStorage.setTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken });
  },

  clearError: () => set({ error: null }),
  setLoading: (isLoading) => set({ isLoading }),
}));

export default useAuthStore;
