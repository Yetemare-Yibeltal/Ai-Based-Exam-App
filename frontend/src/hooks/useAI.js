import { useState, useCallback } from "react";
import toast from "react-hot-toast";
import aiAPI from "../api/ai.api";

const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studyTips, setStudyTips] = useState(null);
  const [weakSubjects, setWeakSubjects] = useState(null);
  const [explanation, setExplanation] = useState(null);
  const [quizFeedback, setQuizFeedback] = useState(null);
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [validationResult, setValidationResult] = useState(null);
  const [personalizedPlan, setPersonalizedPlan] = useState(null);

  const getStudyTips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.getStudyTips();
      setStudyTips(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to get study tips";
      setError(message);
      if (err.response?.status !== 429) toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSubjectTips = useCallback(async (subject) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.getSubjectTips(subject);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || `Failed to get ${subject} tips`;
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const analyzeWeakSubjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.analyzeWeakSubjects();
      setWeakSubjects(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to analyze weak subjects";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const explainAnswer = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.explainAnswer(data);
      setExplanation(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to get explanation";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getQuizFeedback = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.generateQuizFeedback(data);
      setQuizFeedback(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to get quiz feedback";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const generateQuestions = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.generateQuestions(data);
      const questions = res.data.data.questions || [];
      setGeneratedQuestions(questions);
      toast.success(`${questions.length} question(s) generated successfully!`);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to generate questions";
      setError(message);
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const validateQuestion = useCallback(async (data) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.validateQuestion(data);
      setValidationResult(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to validate question";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getPersonalizedPlan = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await aiAPI.getPersonalizedPlan(params);
      setPersonalizedPlan(res.data.data);
      return { success: true, data: res.data.data };
    } catch (err) {
      const message =
        err.response?.data?.message || "Failed to get personalized plan";
      setError(message);
      return { success: false, error: message };
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getExamTips = useCallback(async () => {
    try {
      const res = await aiAPI.getExamTips();
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const getTimeManagementTips = useCallback(async () => {
    try {
      const res = await aiAPI.getTimeManagementTips();
      return { success: true, data: res.data.data };
    } catch (err) {
      return { success: false, error: err.response?.data?.message };
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    isLoading,
    error,
    studyTips,
    weakSubjects,
    explanation,
    quizFeedback,
    generatedQuestions,
    validationResult,
    personalizedPlan,
    getStudyTips,
    getSubjectTips,
    analyzeWeakSubjects,
    explainAnswer,
    getQuizFeedback,
    generateQuestions,
    validateQuestion,
    getPersonalizedPlan,
    getExamTips,
    getTimeManagementTips,
    clearError,
  };
};

export default useAI;
