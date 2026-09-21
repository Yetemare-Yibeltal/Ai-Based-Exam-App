import aiClient from "../client";
import { parseExplanation } from "../utils/parseAIResponse";
import { validateExplanation } from "../utils/validateAIOutput";

export const explainQuestionAnswer = async ({
  questionId,
  selectedAnswer,
  correctAnswer,
  questionText,
  options,
  subject,
}) => {
  if (
    !questionText ||
    !options ||
    selectedAnswer === undefined ||
    correctAnswer === undefined
  ) {
    return { success: false, error: "Missing required fields for explanation" };
  }

  const result = await aiClient.explainAnswer({
    questionId,
    selectedAnswer,
    correctAnswer,
    questionText,
    options,
    subject,
  });

  if (!result.success) return result;

  const parsed = parseExplanation(result.data);
  if (!validateExplanation(parsed)) {
    return { success: false, error: "Invalid explanation response" };
  }

  return { success: true, data: parsed };
};

export const batchExplainAnswers = async (answers) => {
  if (!answers || answers.length === 0)
    return { success: false, error: "No answers provided" };

  const results = await Promise.allSettled(
    answers.map((answer) => aiClient.explainAnswer(answer)),
  );

  return {
    success: true,
    data: results.map((result, i) => ({
      questionIndex: i,
      ...(result.status === "fulfilled" && result.value.success
        ? { success: true, data: parseExplanation(result.value.data) }
        : { success: false, error: result.value?.error || "Failed" }),
    })),
  };
};
