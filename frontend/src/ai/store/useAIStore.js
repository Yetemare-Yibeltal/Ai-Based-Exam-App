import { create } from "zustand";
import aiClient from "../client";
import { AI_STATUS } from "../constants";

const useAIStore = create((set, get) => ({
  studyTips: null,
  weakSubjects: null,
  personalizedPlan: null,
  examTips: null,
  timeTips: null,
  generatedQuestions: [],
  validationResults: {},
  quizFeedback: null,
  aiHistory: [],
  usageStats: null,
  monthlyUsed: 0,
  monthlyLimit: 100,

  status: {
    studyTips: AI_STATUS.IDLE,
    weakSubjects: AI_STATUS.IDLE,
    generateQuestions: AI_STATUS.IDLE,
    validateQuestion: AI_STATUS.IDLE,
    explainAnswer: AI_STATUS.IDLE,
    quizFeedback: AI_STATUS.IDLE,
    personalizedPlan: AI_STATUS.IDLE,
  },

  errors: {},

  setStatus: (key, status) =>
    set((state) => ({
      status: { ...state.status, [key]: status },
    })),

  setError: (key, error) =>
    set((state) => ({
      errors: { ...state.errors, [key]: error },
    })),

  clearError: (key) =>
    set((state) => ({
      errors: { ...state.errors, [key]: null },
    })),

  fetchStudyTips: async () => {
    get().setStatus("studyTips", AI_STATUS.LOADING);
    const result = await aiClient.getStudyTips();
    if (result.success) {
      set({ studyTips: result.data });
      get().setStatus("studyTips", AI_STATUS.SUCCESS);
    } else {
      get().setError("studyTips", result.error);
      get().setStatus("studyTips", AI_STATUS.ERROR);
    }
    return result;
  },

  fetchWeakSubjects: async () => {
    get().setStatus("weakSubjects", AI_STATUS.LOADING);
    const result = await aiClient.analyzeWeakSubjects();
    if (result.success) {
      set({ weakSubjects: result.data });
      get().setStatus("weakSubjects", AI_STATUS.SUCCESS);
    } else {
      get().setError("weakSubjects", result.error);
      get().setStatus("weakSubjects", AI_STATUS.ERROR);
    }
    return result;
  },

  generateQuestions: async (params) => {
    get().setStatus("generateQuestions", AI_STATUS.LOADING);
    const result = await aiClient.generateQuestions(params);
    if (result.success) {
      const newQuestions = result.data?.questions || [];
      set((state) => ({
        generatedQuestions: [...newQuestions, ...state.generatedQuestions],
        monthlyUsed:
          result.data?.aiUsage?.generationsThisMonth || state.monthlyUsed,
      }));
      get().setStatus("generateQuestions", AI_STATUS.SUCCESS);
    } else {
      get().setError("generateQuestions", result.error);
      get().setStatus("generateQuestions", AI_STATUS.ERROR);
    }
    return result;
  },

  validateQuestion: async (questionId, data) => {
    get().setStatus("validateQuestion", AI_STATUS.LOADING);
    const result = await aiClient.validateQuestion(data);
    if (result.success) {
      set((state) => ({
        validationResults: {
          ...state.validationResults,
          [questionId]: result.data,
        },
      }));
      get().setStatus("validateQuestion", AI_STATUS.SUCCESS);
    } else {
      get().setError("validateQuestion", result.error);
      get().setStatus("validateQuestion", AI_STATUS.ERROR);
    }
    return result;
  },

  explainAnswer: async (data) => {
    get().setStatus("explainAnswer", AI_STATUS.LOADING);
    const result = await aiClient.explainAnswer(data);
    if (result.success) {
      get().setStatus("explainAnswer", AI_STATUS.SUCCESS);
    } else {
      get().setError("explainAnswer", result.error);
      get().setStatus("explainAnswer", AI_STATUS.ERROR);
    }
    return result;
  },

  getQuizFeedback: async (data) => {
    get().setStatus("quizFeedback", AI_STATUS.LOADING);
    const result = await aiClient.getQuizFeedback(data);
    if (result.success) {
      set({ quizFeedback: result.data });
      get().setStatus("quizFeedback", AI_STATUS.SUCCESS);
    } else {
      get().setError("quizFeedback", result.error);
      get().setStatus("quizFeedback", AI_STATUS.ERROR);
    }
    return result;
  },

  fetchPersonalizedPlan: async (params) => {
    get().setStatus("personalizedPlan", AI_STATUS.LOADING);
    const result = await aiClient.getPersonalizedPlan(params);
    if (result.success) {
      set({ personalizedPlan: result.data });
      get().setStatus("personalizedPlan", AI_STATUS.SUCCESS);
    } else {
      get().setError("personalizedPlan", result.error);
      get().setStatus("personalizedPlan", AI_STATUS.ERROR);
    }
    return result;
  },

  fetchHistory: async (params) => {
    const result = await aiClient.getMyHistory(params);
    if (result.success) {
      set({ aiHistory: result.data?.logs || [] });
    }
    return result;
  },

  fetchUsageStats: async () => {
    const result = await aiClient.getUsageStats();
    if (result.success) {
      set({ usageStats: result.data });
    }
    return result;
  },

  removeGeneratedQuestion: (id) =>
    set((state) => ({
      generatedQuestions: state.generatedQuestions.filter(
        (q) => (q.id || q._id) !== id,
      ),
    })),

  clearGeneratedQuestions: () => set({ generatedQuestions: [] }),
  resetAll: () =>
    set({
      studyTips: null,
      weakSubjects: null,
      personalizedPlan: null,
      generatedQuestions: [],
      validationResults: {},
      quizFeedback: null,
    }),
}));

export default useAIStore;
