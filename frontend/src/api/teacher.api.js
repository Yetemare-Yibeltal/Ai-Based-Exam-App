import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";

export const teacherAPI = {
  getAnalyticsOverview: () =>
    axiosInstance.get(API_ENDPOINTS.TEACHER_ANALYTICS.OVERVIEW),

  getQuestionPerformance: (params) =>
    axiosInstance.get(API_ENDPOINTS.TEACHER_ANALYTICS.QUESTIONS, { params }),

  getSubjectAnalytics: () =>
    axiosInstance.get(API_ENDPOINTS.TEACHER_ANALYTICS.SUBJECTS),

  getStudentResults: (params) =>
    axiosInstance.get(API_ENDPOINTS.TEACHER_ANALYTICS.STUDENTS, { params }),

  getAIAnalytics: () => axiosInstance.get(API_ENDPOINTS.TEACHER_ANALYTICS.AI),

  getProfile: () => axiosInstance.get(API_ENDPOINTS.TEACHER_PROFILE.GET),

  updateProfile: (data) =>
    axiosInstance.put(API_ENDPOINTS.TEACHER_PROFILE.UPDATE, data),

  uploadAvatar: (formData) =>
    axiosInstance.post(API_ENDPOINTS.TEACHER_PROFILE.UPLOAD_AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteAvatar: () =>
    axiosInstance.delete(API_ENDPOINTS.TEACHER_PROFILE.DELETE_AVATAR),

  getStats: () => axiosInstance.get(API_ENDPOINTS.TEACHER_PROFILE.STATS),

  getAIUsage: () => axiosInstance.get(API_ENDPOINTS.TEACHER_PROFILE.AI_USAGE),
};

export default teacherAPI;
