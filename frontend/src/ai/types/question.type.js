export const QuestionType = {
  MULTIPLE_CHOICE: "multiple_choice",
};

export const createQuestion = (data = {}) => ({
  id: data.id || data._id || null,
  questionText: data.questionText || "",
  options: data.options || ["", "", "", ""],
  correctAnswer: data.correctAnswer ?? 0,
  subject: data.subject || "",
  difficulty: data.difficulty || "medium",
  explanation: data.explanation || "",
  grade: data.grade || "Grade 12",
  topic: data.topic || null,
  year: data.year || null,
  isAIGenerated: data.isAIGenerated || false,
  status: data.status || "draft",
  timesUsed: data.timesUsed || 0,
  correctRate: data.correctRate || 0,
  createdAt: data.createdAt || new Date().toISOString(),
  tags: data.tags || [],
});

export const validateQuestionData = (question) => {
  const required = ["questionText", "options", "correctAnswer", "subject"];
  const missing = required.filter(
    (field) => !question[field] && question[field] !== 0,
  );
  return {
    isValid: missing.length === 0,
    missingFields: missing,
  };
};

export const VALID_SUBJECTS = [
  "math",
  "english",
  "biology",
  "chemistry",
  "physics",
  "civics",
];
export const VALID_DIFFICULTIES = ["easy", "medium", "hard"];
export const VALID_GRADES = ["Grade 11", "Grade 12", "Both"];
export const VALID_STATUSES = ["draft", "pending", "approved", "rejected"];
