import aiClient from "../client";
import { isValidAIResponse } from "../utils/validateAIOutput";

export const analyzeStudentWeakSubjects = async () => {
  const result = await aiClient.analyzeWeakSubjects();
  if (!result.success) return result;

  const data = result.data;
  if (!isValidAIResponse(data)) {
    return { success: false, error: "Invalid weak subject analysis response" };
  }

  return {
    success: true,
    data: {
      hasData: data.hasData || false,
      message: data.message || "",
      weakSubjects: data.weakSubjects || [],
      averageSubjects: data.averageSubjects || [],
      strongSubjects: data.strongSubjects || [],
      aiAnalysis: data.aiAnalysis || null,
      recommendations: data.recommendations || [],
      studyPlan: data.studyPlan || null,
      encouragement: data.encouragement || null,
    },
  };
};

export const getSubjectRecommendations = async (subject) => {
  if (!subject) return { success: false, error: "Subject is required" };

  const result = await aiClient.request(
    `/ai/subject-recommendations/${subject}`,
  );
  if (!result.success) return result;

  return { success: true, data: result.data };
};

export const categorizeSubjectPerformance = (subjectStats) => {
  return {
    weak: subjectStats
      .filter((s) => (s.avgScore || 0) < 60)
      .sort((a, b) => a.avgScore - b.avgScore),
    average: subjectStats.filter(
      (s) => (s.avgScore || 0) >= 60 && (s.avgScore || 0) < 75,
    ),
    strong: subjectStats
      .filter((s) => (s.avgScore || 0) >= 75)
      .sort((a, b) => b.avgScore - a.avgScore),
  };
};

export const calculateOverallReadiness = (subjectStats) => {
  if (!subjectStats || subjectStats.length === 0) return 0;
  const avg =
    subjectStats.reduce((sum, s) => sum + (s.avgScore || 0), 0) /
    subjectStats.length;
  return Math.round(avg);
};

