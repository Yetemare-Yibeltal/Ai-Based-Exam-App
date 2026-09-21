export const validateGeneratedQuestion = (question) => {
  const errors = [];
  if (!question.questionText || question.questionText.trim().length < 10) {
    errors.push("Question text must be at least 10 characters");
  }
  if (!Array.isArray(question.options) || question.options.length !== 4) {
    errors.push("Question must have exactly 4 options");
  }
  if (question.options?.some((opt) => !opt || opt.trim().length === 0)) {
    errors.push("All options must have text");
  }
  if (
    typeof question.correctAnswer !== "number" ||
    question.correctAnswer < 0 ||
    question.correctAnswer > 3
  ) {
    errors.push("Correct answer must be between 0 and 3");
  }
  return { isValid: errors.length === 0, errors };
};

export const validateStudyTips = (tips) => {
  if (!tips || !Array.isArray(tips.tips)) return false;
  return tips.tips.every((tip) => tip.title && tip.description);
};

export const validateExplanation = (explanation) => {
  if (!explanation) return false;
  return !!(
    explanation.mainExplanation && explanation.mainExplanation.length > 20
  );
};

export const validateQuizFeedback = (feedback) => {
  if (!feedback) return false;
  return !!(feedback.feedback && feedback.studyTips);
};

export const validatePersonalizedPlan = (plan) => {
  if (!plan) return false;
  return !!(plan.planTitle && plan.overview);
};

export const sanitizeQuestionText = (text) => {
  if (!text) return "";
  return text
    .replace(/\s+/g, " ")
    .replace(/[^\w\s\-+*/=().,?!%:'"]/g, "")
    .trim();
};
