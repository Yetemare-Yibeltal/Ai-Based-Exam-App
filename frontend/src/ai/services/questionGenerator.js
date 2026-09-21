import aiClient from "../client";
import { parseGeneratedQuestions } from "../utils/parseAIResponse";
import { validateGeneratedQuestion } from "../utils/validateAIOutput";

export const generateAIQuestions = async (params) => {
  const {
    subject,
    difficulty = "medium",
    count = 1,
    topic,
    grade = "Grade 12",
  } = params;

  if (!subject) return { success: false, error: "Subject is required" };
  if (count < 1 || count > 5)
    return { success: false, error: "Count must be between 1 and 5" };

  const result = await aiClient.generateQuestions({
    subject,
    difficulty,
    count,
    topic,
    grade,
  });
  if (!result.success) return result;

  const questions = parseGeneratedQuestions(result.data);
  const validQuestions = questions.filter(
    (q) => validateGeneratedQuestion(q).isValid,
  );

  return {
    success: true,
    data: {
      questions: validQuestions,
      generationStats: result.data?.generationStats,
      aiUsage: result.data?.aiUsage,
    },
  };
};

export const validateAIQuestion = async (questionData) => {
  const result = await aiClient.validateQuestion(questionData);
  if (!result.success) return result;
  return { success: true, data: result.data };
};

export const batchValidateQuestions = async (questions) => {
  const results = await Promise.allSettled(
    questions.map((q) => aiClient.validateQuestion(q)),
  );

  return results.map((result, i) => ({
    questionIndex: i,
    ...(result.status === "fulfilled" && result.value.success
      ? { success: true, data: result.value.data }
      : { success: false, error: result.value?.error || "Validation failed" }),
  }));
};
