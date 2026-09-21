export const AI_CONFIG = {
  model: "claude-sonnet-4-6",
  maxTokens: 1000,
  temperature: 0.7,
  baseUrl: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 60000,
  retries: 2,
  retryDelay: 1000,
};

export const AI_SUBJECTS = {
  math: "Mathematics",
  english: "English",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  civics: "Civics and Ethics",
};

export const AI_DIFFICULTY_LEVELS = {
  easy: { label: "Easy", description: "Basic knowledge and recall", weight: 1 },
  medium: {
    label: "Medium",
    description: "Understanding and application",
    weight: 2,
  },
  hard: {
    label: "Hard",
    description: "Analysis and critical thinking",
    weight: 3,
  },
};

export const AI_MONTHLY_LIMIT = 100;

export const AI_GENERATION_LIMITS = {
  questionsPerRequest: 5,
  maxRequestsPerDay: 20,
  maxMonthlyGenerations: AI_MONTHLY_LIMIT,
};

export const AI_FEATURES = {
  studyTips: true,
  weakSubjectAnalysis: true,
  explainAnswer: true,
  generateQuestions: true,
  validateQuestion: true,
  quizFeedback: true,
  personalizedPlan: true,
};
