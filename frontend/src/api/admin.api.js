import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";

export const adminAPI = {
  getOverview: () => axiosInstance.get(API_ENDPOINTS.ADMIN_ANALYTICS.OVERVIEW),

  getUserAnalytics: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_ANALYTICS.USERS, { params }),

  getQuestionAnalytics: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_ANALYTICS.QUESTIONS, { params }),

  getScoreAnalytics: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_ANALYTICS.SCORES, { params }),

  getAIAnalytics: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_ANALYTICS.AI, { params }),

  getPlatformGrowth: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_ANALYTICS.GROWTH, { params }),

  getSettings: () => axiosInstance.get(API_ENDPOINTS.ADMIN_SETTINGS.GET),

  updateSettings: (data) =>
    axiosInstance.put(API_ENDPOINTS.ADMIN_SETTINGS.UPDATE, data),

  getSystemInfo: () => axiosInstance.get(API_ENDPOINTS.ADMIN_SETTINGS.SYSTEM),

  clearCache: () =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_SETTINGS.CLEAR_CACHE),

  getActivityLog: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_SETTINGS.ACTIVITY_LOG, { params }),

  sendAnnouncement: (data) =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_SETTINGS.ANNOUNCEMENT, data),

  getStudentReport: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_REPORTS.STUDENTS, { params }),

  getQuestionReport: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_REPORTS.QUESTIONS, { params }),

  getPerformanceReport: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_REPORTS.PERFORMANCE, { params }),

  getAIReport: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_REPORTS.AI, { params }),

  exportStudents: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_REPORTS.EXPORT_STUDENTS, {
      params,
      responseType: "blob",
    }),

  exportQuestions: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_REPORTS.EXPORT_QUESTIONS, {
      params,
      responseType: "blob",
    }),
};

export default adminAPI;
