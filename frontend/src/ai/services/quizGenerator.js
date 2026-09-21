import aiClient from "../client";
import { parseGeneratedQuestions } from "../utils/parseAIResponse";
import { validateGeneratedQuestion } from "../utils/validateAIOutput";

export const generateQuizFeedback = async ({
  subject,
  score,
  totalQuestions,
  correctAnswers,
  timeTaken,
  weakTopics,
  strongTopics,
}) => {
  if (!subject || score === undefined) {
    return { success: false, error: "Subject and score are required" };
  }

  const result = await aiClient.getQuizFeedback({
    subject,
    score,
    totalQuestions,
    correctAnswers,
    timeTaken,
    weakTopics,
    strongTopics,
  });

  if (!result.success) return result;

  return {
    success: true,
    data: {
      feedback: result.data?.feedback || "",
      studyTips: result.data?.studyTips || [],
      nextSteps: result.data?.nextSteps || "",
      encouragement: result.data?.encouragement || "",
    },
  };
};

export const generatePracticeQuiz = async ({
  subject,
  count = 20,
  difficulty = "mixed",
  grade = "Grade 12",
}) => {
  const result = await aiClient.generateQuestions({
    subject,
    count: Math.min(count, 5),
    difficulty,
    grade,
  });
  if (!result.success) return result;

  const questions = parseGeneratedQuestions(result.data);
  const validQuestions = questions.filter(
    (q) => validateGeneratedQuestion(q).isValid,
  );

  return { success: true, data: { questions: validQuestions } };
};

export const calculateQuizDifficulty = (scores) => {
  if (!scores || scores.length === 0) return "medium";
  const avg =
    scores.reduce((sum, s) => sum + (s.percentage || 0), 0) / scores.length;
  if (avg >= 80) return "hard";
  if (avg >= 60) return "medium";
  return "easy";
};
