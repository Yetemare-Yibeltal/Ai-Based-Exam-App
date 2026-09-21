import { AI_SUBJECTS } from "../config";

export const formatSubjectName = (subject) => AI_SUBJECTS[subject] || subject;

export const formatStudentContext = (user, subjectStats = []) => {
  const statsText = subjectStats
    .map(
      (s) =>
        `- ${formatSubjectName(s._id || s.subject)}: ${s.avgScore || 0}% avg`,
    )
    .join("\n");

  return `Student: ${user?.name || "Student"}
Grade: ${user?.grade || "Grade 12"}
Average Score: ${user?.averageScore || 0}%
Study Streak: ${user?.studyStreak || 0} days
${statsText ? `\nSubject Performance:\n${statsText}` : ""}`;
};

export const formatQuestionForPrompt = (question) => {
  const labels = ["A", "B", "C", "D"];
  return `Question: ${question.questionText}
Options:
${(question.options || []).map((opt, i) => `${labels[i]}) ${opt}`).join("\n")}
Correct Answer: ${labels[question.correctAnswer]}) ${question.options?.[question.correctAnswer] || ""}`;
};

export const truncateText = (text, maxLength = 200) => {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength)}...` : text;
};

export const formatPercentage = (value) => `${Math.round(value || 0)}%`;

export const buildQuizContext = (
  subject,
  score,
  totalQuestions,
  correctAnswers,
  timeTaken,
) => {
  const mins = Math.floor((timeTaken || 0) / 60);
  const secs = (timeTaken || 0) % 60;
  return `Subject: ${formatSubjectName(subject)}
Score: ${correctAnswers}/${totalQuestions} (${score}%)
Time: ${mins}m ${secs}s`;
};
