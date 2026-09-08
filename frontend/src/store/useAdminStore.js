import { create } from "zustand";
import axiosInstance from "../api/axios";
import { API_ENDPOINTS } from "../constants/api";

const useAdminStore = create((set, get) => ({
  overview: null,
  students: [],
  teachers: [],
  pendingQuestions: [],
  analytics: null,
  settings: null,
  isLoading: false,
  error: null,
  studentsTotal: 0,
  teachersTotal: 0,
  pendingTotal: 0,

  fetchOverview: async () => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(
        API_ENDPOINTS.ADMIN_ANALYTICS.OVERVIEW,
      );
      set({ overview: res.data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
    }
  },

  fetchStudents: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.STUDENTS, {
        params,
      });
      set({
        students: res.data.data || [],
        studentsTotal: res.data.pagination?.total || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
    }
  },

  fetchTeachers: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_USERS.TEACHERS, {
        params,
      });
      set({
        teachers: res.data.data || [],
        teachersTotal: res.data.pagination?.total || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
    }
  },

  fetchPendingQuestions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(
        API_ENDPOINTS.ADMIN_QUESTIONS.PENDING,
        { params },
      );
      set({
        pendingQuestions: res.data.data || [],
        pendingTotal: res.data.pagination?.total || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
    }
  },

  approveQuestion: async (id, note = null) => {
    try {
      await axiosInstance.put(API_ENDPOINTS.ADMIN_QUESTIONS.APPROVE(id), {
        note,
      });
      set((state) => ({
        pendingQuestions: state.pendingQuestions.filter((q) => q.id !== id),
        pendingTotal: state.pendingTotal - 1,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  rejectQuestion: async (id, reason, details = null) => {
    try {
      await axiosInstance.put(API_ENDPOINTS.ADMIN_QUESTIONS.REJECT(id), {
        reason,
        details,
      });
      set((state) => ({
        pendingQuestions: state.pendingQuestions.filter((q) => q.id !== id),
        pendingTotal: state.pendingTotal - 1,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  banUser: async (type, id, reason) => {
    try {
      const endpoint =
        type === "student"
          ? API_ENDPOINTS.ADMIN_USERS.BAN_STUDENT(id)
          : API_ENDPOINTS.ADMIN_USERS.BAN_TEACHER(id);
      await axiosInstance.put(endpoint, { reason });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  unbanUser: async (type, id) => {
    try {
      const endpoint =
        type === "student"
          ? API_ENDPOINTS.ADMIN_USERS.UNBAN_STUDENT(id)
          : API_ENDPOINTS.ADMIN_USERS.UNBAN_TEACHER(id);
      await axiosInstance.put(endpoint);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  approveTeacher: async (id) => {
    try {
      await axiosInstance.put(API_ENDPOINTS.ADMIN_USERS.APPROVE_TEACHER(id));
      set((state) => ({
        teachers: state.teachers.map((t) =>
          t.id === id ? { ...t, isApproved: true } : t,
        ),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  fetchSettings: async () => {
    try {
      const res = await axiosInstance.get(API_ENDPOINTS.ADMIN_SETTINGS.GET);
      set({ settings: res.data.data.settings });
    } catch (error) {
      console.error("Failed to fetch settings:", error);
    }
  },

  updateSettings: async (data) => {
    try {
      const res = await axiosInstance.put(
        API_ENDPOINTS.ADMIN_SETTINGS.UPDATE,
        data,
      );
      set({ settings: res.data.data.settings });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  clearError: () => set({ error: null }),
}));

export default useAdminStore;
