import { useState, useCallback } from "react";
import {
  generateAIQuestions,
  validateAIQuestion,
} from "../services/questionGenerator";

const useGenerateQuestion = () => {
  const [generatedQuestions, setGeneratedQuestions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState(null);
  const [lastGenStats, setLastGenStats] = useState(null);

  const generate = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);

    const result = await generateAIQuestions(params);
    if (result.success) {
      setGeneratedQuestions((prev) => [
        ...(result.data.questions || []),
        ...prev,
      ]);
      setLastGenStats(result.data.generationStats);
    } else {
      setError(result.error);
    }

    setIsGenerating(false);
    return result;
  }, []);

  const validate = useCallback(async (questionData) => {
    setIsValidating(true);
    const result = await validateAIQuestion(questionData);
    setIsValidating(false);
    return result;
  }, []);

  const removeQuestion = useCallback((id) => {
    setGeneratedQuestions((prev) => prev.filter((q) => (q.id || q._id) !== id));
  }, []);

  const clearAll = useCallback(() => {
    setGeneratedQuestions([]);
    setLastGenStats(null);
    setError(null);
  }, []);

  return {
    generatedQuestions,
    isGenerating,
    isValidating,
    error,
    lastGenStats,
    generate,
    validate,
    removeQuestion,
    clearAll,
  };
};

export default useGenerateQuestion;
