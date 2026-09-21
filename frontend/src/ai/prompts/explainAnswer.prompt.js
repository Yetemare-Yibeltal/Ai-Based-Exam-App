import { AI_SUBJECTS } from "../config";

export const buildExplainAnswerPrompt = ({
  questionText,
  options,
  selectedAnswer,
  correctAnswer,
  subject,
}) => {
  const subjectName = AI_SUBJECTS[subject] || subject;
  const labels = ["A", "B", "C", "D"];
  const isCorrect = selectedAnswer === correctAnswer;

  return `You are an expert ${subjectName} teacher explaining a question to an Ethiopian student.

Question: ${questionText}

Options:
${options.map((opt, i) => `${labels[i]}) ${opt}`).join("\n")}

Student selected: ${labels[selectedAnswer]}) ${options[selectedAnswer]}
Correct answer: ${labels[correctAnswer]}) ${options[correctAnswer]}
Result: ${isCorrect ? "CORRECT" : "INCORRECT"}

Return ONLY valid JSON:
{
  "isCorrect": ${isCorrect},
  "mainExplanation": "clear explanation of why the correct answer is right",
  "whyStudentWasWrong": ${isCorrect ? "null" : '"explanation of student mistake"'},
  "whyOthersAreWrong": {"A": "reason", "B": "reason", "C": "reason", "D": "reason"},
  "keyConceptToRemember": "main concept",
  "memoryTrick": "helpful memory tip",
  "relatedTopics": ["topic1", "topic2"],
  "encouragement": "encouraging message"
}`;
};
