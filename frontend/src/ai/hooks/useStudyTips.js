import { useState, useCallback } from "react";
import {
  generatePersonalizedStudyTips,
  generateSubjectStudyTips,
  generateExamTips,
  generateTimeManagementTips,
  generatePersonalizedPlan,
} from "../services/studyTipsGenerator";

const useStudyTips = () => {
  const [studyTips, setStudyTips] = useState(null);
  const [subjectTips, setSubjectTips] = useState({});
  const [examTips, setExamTips] = useState(null);
  const [timeTips, setTimeTips] = useState(null);
  const [personalizedPlan, setPersonalizedPlan] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStudyTips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await generatePersonalizedStudyTips();
    if (result.success) setStudyTips(result.data);
    else setError(result.error);
    setIsLoading(false);
    return result;
  }, []);

  const fetchSubjectTips = useCallback(async (subject) => {
    setIsLoading(true);
    setError(null);
    const result = await generateSubjectStudyTips(subject);
    if (result.success)
      setSubjectTips((prev) => ({ ...prev, [subject]: result.data }));
    else setError(result.error);
    setIsLoading(false);
    return result;
  }, []);

  const fetchExamTips = useCallback(async () => {
    if (examTips) return { success: true, data: examTips };
    setIsLoading(true);
    const result = await generateExamTips();
    if (result.success) setExamTips(result.data);
    setIsLoading(false);
    return result;
  }, [examTips]);

  const fetchTimeTips = useCallback(async () => {
    if (timeTips) return { success: true, data: timeTips };
    setIsLoading(true);
    const result = await generateTimeManagementTips();
    if (result.success) setTimeTips(result.data);
    setIsLoading(false);
    return result;
  }, [timeTips]);

  const fetchPersonalizedPlan = useCallback(async (params) => {
    setIsLoading(true);
    const result = await generatePersonalizedPlan(params);
    if (result.success) setPersonalizedPlan(result.data);
    setIsLoading(false);
    return result;
  }, []);

  return {
    studyTips,
    subjectTips,
    examTips,
    timeTips,
    personalizedPlan,
    isLoading,
    error,
    fetchStudyTips,
    fetchSubjectTips,
    fetchExamTips,
    fetchTimeTips,
    fetchPersonalizedPlan,
  };
};

export default useStudyTips;
