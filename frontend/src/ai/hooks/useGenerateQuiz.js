import { useState, useCallback } from "react";
import {
  generateQuizFeedback,
  generatePracticeQuiz,
  calculateQuizDifficulty,
} from "../services/quizGenerator";

const useGenerateQuiz = () => {
  const [feedback, setFeedback] = useState(null);
  const [practiceQuiz, setPracticeQuiz] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const getFeedback = useCallback(async (quizData) => {
    setIsLoading(true);
    setError(null);
    const result = await generateQuizFeedback(quizData);
    if (result.success) setFeedback(result.data);
    else setError(result.error);
    setIsLoading(false);
    return result;
  }, []);

  const generatePractice = useCallback(async (params) => {
    setIsLoading(true);
    setError(null);
    const result = await generatePracticeQuiz(params);
    if (result.success) setPracticeQuiz(result.data);
    else setError(result.error);
    setIsLoading(false);
    return result;
  }, []);

  const getRecommendedDifficulty = useCallback((scores) => {
    return calculateQuizDifficulty(scores);
  }, []);

  const clearFeedback = useCallback(() => {
    setFeedback(null);
    setError(null);
  }, []);

  return {
    feedback,
    practiceQuiz,
    isLoading,
    error,
    getFeedback,
    generatePractice,
    getRecommendedDifficulty,
    clearFeedback,
  };
};

export default useGenerateQuiz;
