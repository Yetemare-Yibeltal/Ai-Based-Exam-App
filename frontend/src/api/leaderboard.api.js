import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";

export const leaderboardAPI = {
  getGlobal: (params) =>
    axiosInstance.get(API_ENDPOINTS.LEADERBOARD.GLOBAL, { params }),

  getTop: (params) =>
    axiosInstance.get(API_ENDPOINTS.LEADERBOARD.TOP, { params }),

  getWeekly: (params) =>
    axiosInstance.get(API_ENDPOINTS.LEADERBOARD.WEEKLY, { params }),

  getMonthly: (params) =>
    axiosInstance.get(API_ENDPOINTS.LEADERBOARD.MONTHLY, { params }),

  getByGrade: (params) =>
    axiosInstance.get(API_ENDPOINTS.LEADERBOARD.BY_GRADE, { params }),

  getBySchool: (params) =>
    axiosInstance.get(API_ENDPOINTS.LEADERBOARD.BY_SCHOOL, { params }),

  getMyRank: () => axiosInstance.get(API_ENDPOINTS.LEADERBOARD.MY_RANK),

  getBySubject: (subject, params) =>
    axiosInstance.get(API_ENDPOINTS.LEADERBOARD.BY_SUBJECT(subject), {
      params,
    }),

  getStudentGlobal: (params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_LEADERBOARD.GLOBAL, { params }),

  getStudentMyRank: () =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_LEADERBOARD.MY_RANK),

  getStudentWeekly: (params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_LEADERBOARD.WEEKLY, { params }),

  getStudentMonthly: (params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_LEADERBOARD.MONTHLY, { params }),

  getStudentByGrade: (params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_LEADERBOARD.BY_GRADE, { params }),

  getStudentBySchool: (params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_LEADERBOARD.BY_SCHOOL, { params }),

  getStudentBySubject: (subject, params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_LEADERBOARD.BY_SUBJECT(subject), {
      params,
    }),
};

export default leaderboardAPI;
