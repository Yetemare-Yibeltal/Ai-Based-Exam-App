export const createQuizSession = (data = {}) => ({
  sessionId: data.sessionId || null,
  subject: data.subject || "",
  difficulty: data.difficulty || "mixed",
  grade: data.grade || "Grade 12",
  questions: data.questions || [],
  answers: data.answers || {},
  timeTaken: data.timeTaken || 0,
  startTime: data.startTime || Date.now(),
  isCompleted: data.isCompleted || false,
});

export const createQuizResult = (data = {}) => ({
  scoreId: data.scoreId || data.id || null,
  subject: data.subject || "",
  totalQuestions: data.totalQuestions || 0,
  correctAnswers: data.correctAnswers || 0,
  wrongAnswers: data.wrongAnswers || 0,
  percentage: data.percentage || 0,
  grade: data.grade || "F",
  timeTaken: data.timeTaken || 0,
  isPerfectScore: data.isPerfectScore || false,
  isPassingScore: data.isPassingScore || false,
  aiFeedback: data.aiFeedback || null,
  createdAt: data.createdAt || new Date().toISOString(),
});

export const QUIZ_STATUS = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed",
  SUBMITTED: "submitted",
};

export const DEFAULT_QUIZ_SETTINGS = {
  timePerQuestion: 30,
  defaultQuestionCount: 20,
  minQuestions: 5,
  maxQuestions: 50,
  passingScore: 50,
  excellentScore: 90,
};
