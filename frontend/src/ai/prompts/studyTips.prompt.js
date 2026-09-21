import { AI_SUBJECTS } from "../config";

export const buildStudyTipsPrompt = (studentData) => {
  const { name, grade, averageScore, studyStreak, weakSubjects, subjectStats } =
    studentData;

  const statsText = (subjectStats || [])
    .map(
      (s) =>
        `- ${AI_SUBJECTS[s._id] || s._id}: ${Math.round(s.avgScore || 0)}%`,
    )
    .join("\n");

  return `You are an expert educational counselor for Ethiopian Grade 12 university entrance exam preparation.

Student: ${name}
Grade: ${grade}
Average Score: ${averageScore}%
Study Streak: ${studyStreak} days
Weak Subjects: ${weakSubjects?.map((s) => AI_SUBJECTS[s] || s).join(", ") || "None yet"}

${statsText ? `Performance:\n${statsText}` : ""}

Generate 5 personalized study tips. Return ONLY valid JSON:
{
  "tips": [
    {
      "title": "tip title",
      "description": "2-3 sentence actionable description",
      "category": "time_management",
      "priority": "high",
      "estimatedTimePerDay": "30 minutes"
    }
  ],
  "motivationalMessage": "encouraging message",
  "weeklyGoal": "specific weekly goal",
  "prioritySubject": "subject to focus on"
}`;
};
