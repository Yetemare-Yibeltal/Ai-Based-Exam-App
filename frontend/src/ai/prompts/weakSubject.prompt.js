import { AI_SUBJECTS } from "../config";

export const buildWeakSubjectPrompt = ({
  studentName,
  grade,
  subjectStats,
}) => {
  const statsText = (subjectStats || [])
    .map(
      (s) =>
        `- ${AI_SUBJECTS[s.subject] || s.subject}: ${Math.round(s.avgScore || 0)}% avg, ${s.totalAttempts || 0} attempts, ${Math.round(s.passRate || 0)}% pass rate`,
    )
    .join("\n");

  const weakSubjects = (subjectStats || []).filter(
    (s) => (s.avgScore || 0) < 60,
  );
  const strongSubjects = (subjectStats || []).filter(
    (s) => (s.avgScore || 0) >= 75,
  );

  return `Analyze ${grade} student ${studentName}'s performance and give recommendations.

Performance Data:
${statsText || "No data available"}

Weak Subjects (below 60%): ${weakSubjects.map((s) => AI_SUBJECTS[s.subject] || s.subject).join(", ") || "None"}
Strong Subjects (above 75%): ${strongSubjects.map((s) => AI_SUBJECTS[s.subject] || s.subject).join(", ") || "None"}

Return ONLY valid JSON:
{
  "assessment": "2-3 sentence assessment",
  "recommendations": [
    {
      "subject": "subject_name",
      "currentLevel": "weak",
      "tip": "specific strategy",
      "resources": ["resource1"],
      "weeklyHours": 3,
      "priority": "high"
    }
  ],
  "studyPlan": {
    "monday": "activity",
    "tuesday": "activity",
    "wednesday": "activity",
    "thursday": "activity",
    "friday": "activity",
    "saturday": "activity",
    "sunday": "rest and review"
  },
  "encouragement": "motivational message",
  "predictedImprovement": "expected improvement"
}`;
};
