import { create } from "zustand";
import axiosInstance from "../api/axios";
import { API_ENDPOINTS } from "../constants/api";

const useTeacherStore = create((set, get) => ({
  questions: [],
  questionsTotal: 0,
  selectedQuestion: null,
  analytics: null,
  aiUsage: null,
  isLoading: false,
  isGenerating: false,
  error: null,
  filters: {
    subject: "",
    status: "",
    difficulty: "",
    page: 1,
    limit: 10,
  },

  setFilters: (filters) =>
    set((state) => ({
      filters: { ...state.filters, ...filters },
    })),

  fetchMyQuestions: async (params = {}) => {
    set({ isLoading: true });
    try {
      const { filters } = get();
      const queryParams = { ...filters, ...params };
      const res = await axiosInstance.get(
        API_ENDPOINTS.TEACHER_QUESTIONS.LIST,
        {
          params: queryParams,
        },
      );
      set({
        questions: res.data.data || [],
        questionsTotal: res.data.pagination?.total || 0,
        isLoading: false,
      });
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
    }
  },

  fetchQuestionById: async (id) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.get(
        API_ENDPOINTS.TEACHER_QUESTIONS.BY_ID(id),
      );
      set({ selectedQuestion: res.data.data, isLoading: false });
      return res.data.data;
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      return null;
    }
  },

  createQuestion: async (data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.post(
        API_ENDPOINTS.TEACHER_QUESTIONS.CREATE,
        data,
      );
      set((state) => ({
        questions: [res.data.data.question, ...state.questions],
        questionsTotal: state.questionsTotal + 1,
        isLoading: false,
      }));
      return { success: true, question: res.data.data.question };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      return { success: false, error: error.response?.data?.message };
    }
  },

  updateQuestion: async (id, data) => {
    set({ isLoading: true });
    try {
      const res = await axiosInstance.put(
        API_ENDPOINTS.TEACHER_QUESTIONS.UPDATE(id),
        data,
      );
      set((state) => ({
        questions: state.questions.map((q) =>
          q.id === id ? res.data.data.question : q,
        ),
        selectedQuestion: res.data.data.question,
        isLoading: false,
      }));
      return { success: true, question: res.data.data.question };
    } catch (error) {
      set({ isLoading: false, error: error.response?.data?.message });
      return { success: false, error: error.response?.data?.message };
    }
  },

  deleteQuestion: async (id) => {
    try {
      await axiosInstance.delete(API_ENDPOINTS.TEACHER_QUESTIONS.DELETE(id));
      set((state) => ({
        questions: state.questions.filter((q) => q.id !== id),
        questionsTotal: state.questionsTotal - 1,
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  submitForApproval: async (id, submissionNote = null) => {
    try {
      const res = await axiosInstance.post(
        API_ENDPOINTS.TEACHER_QUESTIONS.SUBMIT(id),
        { submissionNote },
      );
      set((state) => ({
        questions: state.questions.map((q) =>
          q.id === id ? { ...q, status: "pending" } : q,
        ),
      }));
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.message };
    }
  },

  generateAIQuestion: async (data) => {
    set({ isGenerating: true });
    try {
      const res = await axiosInstance.post(
        API_ENDPOINTS.AI.GENERATE_QUESTIONS,
        data,
      );
      const newQuestions = res.data.data.questions || [];
      set((state) => ({
        questions: [...newQuestions, ...state.questions],
        questionsTotal: state.questionsTotal + newQuestions.length,
        isGenerating: false,
      }));
      return { success: true, data: res.data.data };
    } catch (error) {
      set({ isGenerating: false, error: error.response?.data?.message });
      return { success: false, error: error.response?.data?.message };
    }
  },

  fetchAnalytics: async () => {
    try {
      const res = await axiosInstance.get(
        API_ENDPOINTS.TEACHER_ANALYTICS.OVERVIEW,
      );
      set({ analytics: res.data.data });
    } catch (error) {
      console.error("Failed to fetch analytics:", error);
    }
  },

  fetchAIUsage: async () => {
    try {
      const res = await axiosInstance.get(
        API_ENDPOINTS.TEACHER_PROFILE.AI_USAGE,
      );
      set({ aiUsage: res.data.data });
    } catch (error) {
      console.error("Failed to fetch AI usage:", error);
    }
  },

  setSelectedQuestion: (question) => set({ selectedQuestion: question }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      questions: [],
      questionsTotal: 0,
      selectedQuestion: null,
      analytics: null,
      aiUsage: null,
      isLoading: false,
      isGenerating: false,
      error: null,
    }),
}));

export default useTeacherStore;
