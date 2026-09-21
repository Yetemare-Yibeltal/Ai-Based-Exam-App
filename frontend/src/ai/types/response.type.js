export const createAIResponse = (data = {}) => ({
  success: data.success || false,
  data: data.data || null,
  error: data.error || null,
  timestamp: new Date().toISOString(),
});

export const createStudyTipResponse = (data = {}) => ({
  tips: data.tips || [],
  motivationalMessage: data.motivationalMessage || "",
  weeklyGoal: data.weeklyGoal || "",
  prioritySubject: data.prioritySubject || null,
});

export const createValidationResponse = (data = {}) => ({
  isValid: data.isValid || false,
  isCorrectAnswerRight: data.isCorrectAnswerRight !== false,
  issues: data.issues || [],
  suggestions: data.suggestions || [],
  qualityScore: data.qualityScore || 0,
  curriculumAlignment: data.curriculumAlignment || "unknown",
  feedback: data.feedback || "",
  correctedAnswer: data.correctedAnswer ?? null,
  improvedExplanation: data.improvedExplanation || null,
});

export const createExplanationResponse = (data = {}) => ({
  isCorrect: data.isCorrect || false,
  mainExplanation: data.mainExplanation || "",
  whyStudentWasWrong: data.whyStudentWasWrong || null,
  whyOthersAreWrong: data.whyOthersAreWrong || {},
  keyConceptToRemember: data.keyConceptToRemember || "",
  memoryTrick: data.memoryTrick || "",
  relatedTopics: data.relatedTopics || [],
  encouragement: data.encouragement || "",
});

export const AI_RESPONSE_STATUS = {
  SUCCESS: "success",
  ERROR: "error",
  RATE_LIMITED: "rate_limited",
  QUOTA_EXCEEDED: "quota_exceeded",
  TIMEOUT: "timeout",
};
