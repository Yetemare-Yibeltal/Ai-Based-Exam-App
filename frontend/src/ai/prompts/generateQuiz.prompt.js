import { AI_SUBJECTS } from "../config";

export const buildGenerateQuizPrompt = ({
  subject,
  questionCount,
  difficulty,
  grade,
}) => {
  const subjectName = AI_SUBJECTS[subject] || subject;
  return `Generate a complete ${subjectName} quiz with ${questionCount} questions for Ethiopian ${grade || "Grade 12"} students.

Difficulty distribution: ${difficulty === "mixed" ? "40% easy, 40% medium, 20% hard" : `All ${difficulty}`}

Return ONLY valid JSON:
{
  "quiz": {
    "subject": "${subject}",
    "title": "${subjectName} Practice Quiz",
    "questions": [
      {
        "questionText": "question?",
        "options": ["A", "B", "C", "D"],
        "correctAnswer": 0,
        "explanation": "explanation",
        "difficulty": "easy",
        "topic": "topic name"
      }
    ]
  }
}`;
};
