import { AI_SUBJECTS } from "../config";

export const buildValidateQuestionPrompt = ({
  questionText,
  options,
  correctAnswer,
  subject,
  explanation,
}) => {
  const subjectName = AI_SUBJECTS[subject] || subject;
  const labels = ["A", "B", "C", "D"];

  return `You are a ${subjectName} exam quality controller for Ethiopian university entrance exam.

Question: ${questionText}
Options:
${options.map((opt, i) => `${labels[i]}) ${opt}`).join("\n")}
Marked Correct: ${labels[correctAnswer]}) ${options[correctAnswer]}
${explanation ? `Explanation: ${explanation}` : ""}

Evaluate and return ONLY valid JSON:
{
  "isValid": true,
  "isCorrectAnswerRight": true,
  "issues": [],
  "suggestions": [],
  "qualityScore": 85,
  "curriculumAlignment": "high",
  "feedback": "overall feedback",
  "correctedAnswer": null,
  "improvedExplanation": null
}`;
};
