export const parseJSONResponse = (content) => {
  if (!content) return null;
  try {
    const clean = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\s*[\r\n]/gm, "")
      .trim();
    return JSON.parse(clean);
  } catch (error) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
};

export const parseStudyTips = (data) => {
  if (!data) return { tips: [], motivationalMessage: "", weeklyGoal: "" };
  return {
    tips: Array.isArray(data.tips) ? data.tips : [],
    motivationalMessage: data.motivationalMessage || "",
    weeklyGoal: data.weeklyGoal || "",
    prioritySubject: data.prioritySubject || null,
  };
};

export const parseGeneratedQuestions = (data) => {
  if (!data?.questions) return [];
  return data.questions.filter(
    (q) =>
      q.questionText &&
      Array.isArray(q.options) &&
      q.options.length === 4 &&
      typeof q.correctAnswer === "number" &&
      q.correctAnswer >= 0 &&
      q.correctAnswer <= 3,
  );
};

export const parseValidationResult = (data) => {
  if (!data)
    return { isValid: false, qualityScore: 0, issues: [], suggestions: [] };
  return {
    isValid: data.isValid || false,
    isCorrectAnswerRight: data.isCorrectAnswerRight !== false,
    issues: Array.isArray(data.issues) ? data.issues : [],
    suggestions: Array.isArray(data.suggestions) ? data.suggestions : [],
    qualityScore: data.qualityScore || 0,
    curriculumAlignment: data.curriculumAlignment || "unknown",
    feedback: data.feedback || "",
    correctedAnswer: data.correctedAnswer,
    improvedExplanation: data.improvedExplanation || null,
  };
};

export const parseExplanation = (data) => {
  if (!data) return null;
  return {
    isCorrect: data.isCorrect || false,
    mainExplanation: data.mainExplanation || "",
    whyStudentWasWrong: data.whyStudentWasWrong || null,
    whyOthersAreWrong: data.whyOthersAreWrong || {},
    keyConceptToRemember: data.keyConceptToRemember || "",
    memoryTrick: data.memoryTrick || "",
    relatedTopics: Array.isArray(data.relatedTopics) ? data.relatedTopics : [],
    encouragement: data.encouragement || "",
  };
};

export const parseQuizFeedback = (data) => {
  if (!data) return null;
  return {
    feedback: data.feedback || "",
    studyTips: Array.isArray(data.studyTips) ? data.studyTips : [],
    nextSteps: data.nextSteps || "",
    encouragement: data.encouragement || "",
  };
};
