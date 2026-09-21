import { AI_SUBJECTS } from "../config";

export const buildGenerateQuestionPrompt = ({
  subject,
  difficulty,
  count,
  topic,
  grade,
}) => {
  const subjectName = AI_SUBJECTS[subject] || subject;
  return `You are an expert ${subjectName} teacher creating Ethiopian university entrance exam questions.

Generate ${count} question(s):
- Subject: ${subjectName}
- Difficulty: ${difficulty}
- Grade: ${grade || "Grade 12"}
${topic ? `- Topic: ${topic}` : ""}

Return ONLY valid JSON:
{
  "questions": [
    {
      "questionText": "Full question text?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation",
      "topic": "Specific topic",
      "difficulty": "${difficulty}",
      "hints": ["hint1", "hint2"]
    }
  ]
}`;
};
