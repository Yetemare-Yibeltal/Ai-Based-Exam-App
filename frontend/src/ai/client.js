import axiosInstance from "../api/axios";
import { AI_CONFIG, AI_MONTHLY_LIMIT } from "./config";
import { AI_ERROR_MESSAGES } from "./constants";

class AIClient {
  constructor() {
    this.baseUrl = AI_CONFIG.baseUrl;
    this.timeout = AI_CONFIG.timeout;
  }

  async request(endpoint, method = "GET", data = null, params = null) {
    try {
      const config = {
        method,
        url: endpoint,
        timeout: this.timeout,
      };
      if (data) config.data = data;
      if (params) config.params = params;

      const response = await axiosInstance(config);
      return { success: true, data: response.data.data };
    } catch (error) {
      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 429)
        return { success: false, error: AI_ERROR_MESSAGES.RATE_LIMIT };
      if (status === 503)
        return { success: false, error: AI_ERROR_MESSAGES.SERVER };
      if (error.code === "ECONNABORTED")
        return { success: false, error: AI_ERROR_MESSAGES.TIMEOUT };
      if (!error.response)
        return { success: false, error: AI_ERROR_MESSAGES.NETWORK };

      return { success: false, error: message || AI_ERROR_MESSAGES.SERVER };
    }
  }

  async getStudyTips() {
    return this.request("/ai/study-tips");
  }

  async getSubjectTips(subject) {
    return this.request(`/ai/study-tips/${subject}`);
  }

  async analyzeWeakSubjects() {
    return this.request("/ai/weak-subjects");
  }

  async getPersonalizedPlan(params = {}) {
    return this.request("/ai/personalized-plan", "GET", null, params);
  }

  async explainAnswer(data) {
    return this.request("/ai/explain-answer", "POST", data);
  }

  async getQuizFeedback(data) {
    return this.request("/ai/quiz-feedback", "POST", data);
  }

  async generateQuestions(data) {
    return this.request("/ai/generate-questions", "POST", data);
  }

  async validateQuestion(data) {
    return this.request("/ai/validate-question", "POST", data);
  }

  async getExamTips() {
    return this.request("/ai/exam-tips");
  }

  async getTimeManagementTips() {
    return this.request("/ai/time-management");
  }

  async getMyHistory(params = {}) {
    return this.request("/ai/my-history", "GET", null, params);
  }

  async getUsageStats() {
    return this.request("/ai/usage-stats");
  }
}

export const aiClient = new AIClient();
export default aiClient;
