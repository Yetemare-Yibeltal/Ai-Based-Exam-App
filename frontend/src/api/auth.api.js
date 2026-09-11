import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";

export const authAPI = {
  register: (data) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.REGISTER, data),

  login: (data) => axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.LOGIN, data),

  teacherLogin: (data) =>
    axiosInstance.post(API_ENDPOINTS.TEACHER_AUTH.LOGIN, data),

  adminLogin: (data) =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_AUTH.LOGIN, data),

  logout: (refreshToken) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.LOGOUT, { refreshToken }),

  teacherLogout: (refreshToken) =>
    axiosInstance.post(API_ENDPOINTS.TEACHER_AUTH.LOGOUT, { refreshToken }),

  adminLogout: (refreshToken) =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_AUTH.LOGOUT, { refreshToken }),

  refreshToken: (refreshToken) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.REFRESH_TOKEN, {
      refreshToken,
    }),

  verifyEmail: (data) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.VERIFY_EMAIL, data),

  resendVerification: (email) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.RESEND_VERIFICATION, {
      email,
    }),

  forgotPassword: (email) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.FORGOT_PASSWORD, { email }),

  resetPassword: (data) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.RESET_PASSWORD, data),

  changePassword: (data) =>
    axiosInstance.put(API_ENDPOINTS.STUDENT_AUTH.CHANGE_PASSWORD, data),

  getMe: () => axiosInstance.get(API_ENDPOINTS.STUDENT_AUTH.ME),

  updateProfile: (data) =>
    axiosInstance.put(API_ENDPOINTS.STUDENT_AUTH.UPDATE_PROFILE, data),

  uploadAvatar: (formData) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_AUTH.UPLOAD_AVATAR, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteAccount: (password) =>
    axiosInstance.delete(API_ENDPOINTS.STUDENT_AUTH.DELETE_ACCOUNT, {
      data: { password },
    }),

  teacherForgotPassword: (email) =>
    axiosInstance.post(API_ENDPOINTS.TEACHER_AUTH.FORGOT_PASSWORD, { email }),

  teacherResetPassword: (data) =>
    axiosInstance.post(API_ENDPOINTS.TEACHER_AUTH.RESET_PASSWORD, data),

  teacherChangePassword: (data) =>
    axiosInstance.put(API_ENDPOINTS.TEACHER_AUTH.CHANGE_PASSWORD, data),

  adminForgotPassword: (email) =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_AUTH.FORGOT_PASSWORD, { email }),

  adminResetPassword: (data) =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_AUTH.RESET_PASSWORD, data),

  adminChangePassword: (data) =>
    axiosInstance.put(API_ENDPOINTS.ADMIN_AUTH.CHANGE_PASSWORD, data),
};

export default authAPI;
