import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";

export const questionsAPI = {
  getQuestions: (params) =>
    axiosInstance.get(API_ENDPOINTS.QUESTIONS.LIST, { params }),

  getQuestionById: (id) => axiosInstance.get(API_ENDPOINTS.QUESTIONS.BY_ID(id)),

  getSubjectStats: () =>
    axiosInstance.get(API_ENDPOINTS.QUESTIONS.SUBJECT_STATS),

  checkAnswers: (answers) =>
    axiosInstance.post(API_ENDPOINTS.QUESTIONS.CHECK, { answers }),

  reportQuestion: (id, data) =>
    axiosInstance.post(API_ENDPOINTS.QUESTIONS.REPORT(id), data),

  getSubjects: () => axiosInstance.get(API_ENDPOINTS.STUDENT_QUIZ.SUBJECTS),

  getQuestionsBySubject: (subject, params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_QUIZ.QUESTIONS(subject), {
      params,
    }),

  startQuiz: (data) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_QUIZ.START, data),

  submitQuiz: (data) =>
    axiosInstance.post(API_ENDPOINTS.STUDENT_QUIZ.SUBMIT, data),

  getQuizHistory: (params) =>
    axiosInstance.get(API_ENDPOINTS.STUDENT_QUIZ.HISTORY, { params }),

  getQuizById: (id) => axiosInstance.get(API_ENDPOINTS.STUDENT_QUIZ.BY_ID(id)),

  retryQuiz: (id) => axiosInstance.post(API_ENDPOINTS.STUDENT_QUIZ.RETRY(id)),

  getQuizStats: () => axiosInstance.get(API_ENDPOINTS.STUDENT_QUIZ.STATS),

  getTeacherQuestions: (params) =>
    axiosInstance.get(API_ENDPOINTS.TEACHER_QUESTIONS.LIST, { params }),

  getTeacherQuestionById: (id) =>
    axiosInstance.get(API_ENDPOINTS.TEACHER_QUESTIONS.BY_ID(id)),

  createQuestion: (data) =>
    axiosInstance.post(API_ENDPOINTS.TEACHER_QUESTIONS.CREATE, data),

  updateTeacherQuestion: (id, data) =>
    axiosInstance.put(API_ENDPOINTS.TEACHER_QUESTIONS.UPDATE(id), data),

  deleteTeacherQuestion: (id) =>
    axiosInstance.delete(API_ENDPOINTS.TEACHER_QUESTIONS.DELETE(id)),

  submitForApproval: (id, data) =>
    axiosInstance.post(API_ENDPOINTS.TEACHER_QUESTIONS.SUBMIT(id), data),

  getApprovalStatus: (id) =>
    axiosInstance.get(API_ENDPOINTS.TEACHER_QUESTIONS.APPROVAL_STATUS(id)),

  uploadQuestionImage: (id, formData) =>
    axiosInstance.post(
      API_ENDPOINTS.TEACHER_QUESTIONS.UPLOAD_IMAGE(id),
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
      },
    ),

  getAdminQuestions: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_QUESTIONS.LIST, { params }),

  getAdminQuestionById: (id) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_QUESTIONS.BY_ID(id)),

  getAdminQuestionStats: () =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_QUESTIONS.STATS),

  getPendingQuestions: (params) =>
    axiosInstance.get(API_ENDPOINTS.ADMIN_QUESTIONS.PENDING, { params }),

  approveQuestion: (id, data) =>
    axiosInstance.put(API_ENDPOINTS.ADMIN_QUESTIONS.APPROVE(id), data),

  rejectQuestion: (id, data) =>
    axiosInstance.put(API_ENDPOINTS.ADMIN_QUESTIONS.REJECT(id), data),

  featureQuestion: (id) =>
    axiosInstance.put(API_ENDPOINTS.ADMIN_QUESTIONS.FEATURE(id)),

  bulkApprove: (data) =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_QUESTIONS.BULK_APPROVE, data),

  bulkReject: (data) =>
    axiosInstance.post(API_ENDPOINTS.ADMIN_QUESTIONS.BULK_REJECT, data),

  updateAdminQuestion: (id, data) =>
    axiosInstance.put(API_ENDPOINTS.ADMIN_QUESTIONS.UPDATE(id), data),

  deleteAdminQuestion: (id) =>
    axiosInstance.delete(API_ENDPOINTS.ADMIN_QUESTIONS.DELETE(id)),
};

export default questionsAPI;
