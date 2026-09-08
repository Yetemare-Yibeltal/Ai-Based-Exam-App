export const calculateGrade = (percentage) => {
  if (percentage >= 95) return { grade: "A+", gpa: 4.0, label: "Outstanding" };
  if (percentage >= 85) return { grade: "A", gpa: 4.0, label: "Excellent" };
  if (percentage >= 75) return { grade: "B+", gpa: 3.5, label: "Very Good" };
  if (percentage >= 65) return { grade: "B", gpa: 3.0, label: "Good" };
  if (percentage >= 55)
    return { grade: "C+", gpa: 2.5, label: "Above Average" };
  if (percentage >= 50) return { grade: "C", gpa: 2.0, label: "Average" };
  if (percentage >= 40) return { grade: "D", gpa: 1.0, label: "Below Average" };
  return { grade: "F", gpa: 0.0, label: "Fail" };
};

export const calculateOverallGPA = (scores) => {
  if (!scores || scores.length === 0) return 0;
  const total = scores.reduce((sum, score) => {
    const { gpa } = calculateGrade(score.percentage);
    return sum + gpa;
  }, 0);
  return parseFloat((total / scores.length).toFixed(2));
};

export const getPassFailStatus = (percentage) => ({
  passed: percentage >= 50,
  label: percentage >= 50 ? "Passed" : "Failed",
  color: percentage >= 50 ? "text-green-600" : "text-red-600",
  bg: percentage >= 50 ? "bg-green-100" : "bg-red-100",
});

export const calculateImprovementNeeded = (currentScore, targetScore) => {
  if (currentScore >= targetScore) return 0;
  return targetScore - currentScore;
};

export const getSubjectGrade = (subjectScores) => {
  if (!subjectScores || subjectScores.length === 0) return null;
  const avg =
    subjectScores.reduce((sum, s) => sum + s.percentage, 0) /
    subjectScores.length;
  return calculateGrade(Math.round(avg));
};

export const predictFinalScore = (
  currentAvg,
  remainingQuizzes,
  targetScore,
) => {
  if (!remainingQuizzes || remainingQuizzes === 0) return currentAvg;
  const totalQuizzesNeeded = Math.ceil(
    (targetScore - currentAvg) / (remainingQuizzes > 0 ? remainingQuizzes : 1),
  );
  return Math.min(100, Math.max(0, currentAvg + totalQuizzesNeeded));
};

export const getAchievementLevel = (totalQuizzes, avgScore, streak) => {
  const score = totalQuizzes * 0.3 + avgScore * 0.5 + streak * 0.2;
  if (score >= 90)
    return { level: "Platinum", icon: "💎", color: "text-cyan-600" };
  if (score >= 70)
    return { level: "Gold", icon: "🥇", color: "text-yellow-600" };
  if (score >= 50)
    return { level: "Silver", icon: "🥈", color: "text-gray-500" };
  if (score >= 30)
    return { level: "Bronze", icon: "🥉", color: "text-amber-700" };
  return { level: "Beginner", icon: "🎯", color: "text-blue-600" };
};
