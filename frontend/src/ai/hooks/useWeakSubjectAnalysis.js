import { useState, useCallback } from "react";
import {
  analyzeStudentWeakSubjects,
  getSubjectRecommendations,
  categorizeSubjectPerformance,
  calculateOverallReadiness,
} from "../services/weakSubjectAnalyzer";

const useWeakSubjectAnalysis = () => {
  const [analysis, setAnalysis] = useState(null);
  const [subjectRecs, setSubjectRecs] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const analyze = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await analyzeStudentWeakSubjects();
    if (result.success) setAnalysis(result.data);
    else setError(result.error);
    setIsLoading(false);
    return result;
  }, []);

  const getSubjectRecs = useCallback(
    async (subject) => {
      if (subjectRecs[subject])
        return { success: true, data: subjectRecs[subject] };
      setIsLoading(true);
      const result = await getSubjectRecommendations(subject);
      if (result.success)
        setSubjectRecs((prev) => ({ ...prev, [subject]: result.data }));
      setIsLoading(false);
      return result;
    },
    [subjectRecs],
  );

  const categorize = useCallback((subjectStats) => {
    return categorizeSubjectPerformance(subjectStats);
  }, []);

  const getReadiness = useCallback((subjectStats) => {
    return calculateOverallReadiness(subjectStats);
  }, []);

  return {
    analysis,
    subjectRecs,
    isLoading,
    error,
    analyze,
    getSubjectRecs,
    categorize,
    getReadiness,
  };
};

export default useWeakSubjectAnalysis;
