export const AI_TYPES = {
  GENERATE_QUESTION: "generate_question",
  VALIDATE_QUESTION: "validate_question",
  EXPLAIN_ANSWER: "explain_answer",
  STUDY_TIPS: "study_tips",
  WEAK_SUBJECT: "weak_subject_analysis",
  QUIZ_FEEDBACK: "quiz_feedback",
  PERSONALIZED_PLAN: "personalized_plan",
};

export const AI_STATUS = {
  IDLE: "idle",
  LOADING: "loading",
  SUCCESS: "success",
  ERROR: "error",
};

export const AI_PRIORITY = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export const AI_CATEGORY = {
  TIME_MANAGEMENT: "time_management",
  SUBJECT_FOCUS: "subject_focus",
  EXAM_STRATEGY: "exam_strategy",
  MOTIVATION: "motivation",
  RESOURCES: "resources",
};

export const AI_ERROR_MESSAGES = {
  RATE_LIMIT: "Too many AI requests. Please wait a moment before trying again.",
  NETWORK: "Network error. Please check your connection.",
  SERVER: "AI service is temporarily unavailable. Please try again later.",
  QUOTA: "Monthly AI generation limit reached. Resets next month.",
  INVALID: "Invalid request. Please check your input and try again.",
  TIMEOUT: "AI request timed out. Please try again.",
};

export const AI_SUCCESS_MESSAGES = {
  GENERATED: "Questions generated successfully!",
  VALIDATED: "Question validated successfully!",
  TIPS_LOADED: "Study tips generated successfully!",
  PLAN_CREATED: "Personalized plan created!",
  FEEDBACK_READY: "Quiz feedback ready!",
};

export const ETHIOPIAN_EXAM_SUBJECTS = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
];
export const ETHIOPIAN_GRADES = ["Grade 11", "Grade 12"];
export const PASSING_SCORE = 50;
export const EXCELLENT_SCORE = 90;
