import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";

export const scoresAPI = {
  getMyScores: (params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_SCORES.LIST, { params }),

  getScoreById: (id) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_SCORES.BY_ID(id)),

  getScoreSummary: () =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_SCORES.SUMMARY),

  getBestScores: () => axiosInstance.get(API_ENDPOINTS.STUDENT_SCORES.BEST),

  getScoresBySubject: (subject, params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_SCORES.BY_SUBJECT(subject), {
      params,
    }),

  getScoreProgress: (subject, params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_SCORES.PROGRESS(subject), {
      params,
    }),

  getSubjectStats: () =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_SCORES.SUBJECT_STATS),

  deleteScore: (id) =>
    axiosInstance.delete(API_ENDPOINTS.STUDENT_SCORES.DELETE(id)),
};

export default scoresAPI;
