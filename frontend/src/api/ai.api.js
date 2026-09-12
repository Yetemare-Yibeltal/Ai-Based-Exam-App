import axiosInstance from "./axios";
import { API_ENDPOINTS } from "../constants/api";
import { AI_REQUEST_TIMEOUT } from "../constants/api";

const aiAxios = axiosInstance;

export const aiAPI = {
  getStudyTips: () =>
    aiAxios.get(API_ENDPOINTS.AI.STUDY_TIPS, { timeout: AI_REQUEST_TIMEOUT }),

  getSubjectTips: (subject) =>
    aiAxios.get(API_ENDPOINTS.AI.SUBJECT_TIPS(subject), {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  getPersonalizedPlan: (params) =>
    aiAxios.get(API_ENDPOINTS.AI.PERSONALIZED_PLAN, {
      params,
      timeout: AI_REQUEST_TIMEOUT,
    }),

  getExamTips: () => aiAxios.get(API_ENDPOINTS.AI.EXAM_TIPS),

  getTimeManagementTips: () => aiAxios.get(API_ENDPOINTS.AI.TIME_MANAGEMENT),

  analyzeWeakSubjects: () =>
    aiAxios.get(API_ENDPOINTS.AI.WEAK_SUBJECTS, {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  getSubjectRecommendations: (subject) =>
    aiAxios.get(API_ENDPOINTS.AI.SUBJECT_RECOMMENDATIONS(subject), {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  explainAnswer: (data) =>
    aiAxios.post(API_ENDPOINTS.AI.EXPLAIN_ANSWER, data, {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  batchExplain: (answers) =>
    aiAxios.post(
      API_ENDPOINTS.AI.BATCH_EXPLAIN,
      { answers },
      {
        timeout: AI_REQUEST_TIMEOUT,
      },
    ),

  generateQuizFeedback: (data) =>
    aiAxios.post(API_ENDPOINTS.AI.QUIZ_FEEDBACK, data, {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  generateQuestions: (data) =>
    aiAxios.post(API_ENDPOINTS.AI.GENERATE_QUESTIONS, data, {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  validateQuestion: (data) =>
    aiAxios.post(API_ENDPOINTS.AI.VALIDATE_QUESTION, data, {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  batchValidate: (questions) =>
    aiAxios.post(
      API_ENDPOINTS.AI.BATCH_VALIDATE,
      { questions },
      {
        timeout: AI_REQUEST_TIMEOUT,
      },
    ),

  getMyHistory: (params) =>
    aiAxios.get(API_ENDPOINTS.AI.MY_HISTORY, { params }),

  getUsageStats: () => aiAxios.get(API_ENDPOINTS.AI.USAGE_STATS),

  getStudyTipsForSubject: (subject) =>
    aiAxios.get(API_ENDPOINTS.STUDENT_STUDY_TIPS.BY_SUBJECT(subject), {
      timeout: AI_REQUEST_TIMEOUT,
    }),

  getPersonalizedStudyPlan: (params) =>
    aiAxios.get(API_ENDPOINTS.STUDENT_STUDY_TIPS.PERSONALIZED_PLAN, {
      params,
      timeout: AI_REQUEST_TIMEOUT,
    }),
};

export default aiAPI;
