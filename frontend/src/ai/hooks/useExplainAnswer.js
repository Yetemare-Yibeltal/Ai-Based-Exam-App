import { useState, useCallback } from "react";
import {
  explainQuestionAnswer,
  batchExplainAnswers,
} from "../services/answerExplainer";

const useExplainAnswer = () => {
  const [explanations, setExplanations] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const explainAnswer = useCallback(
    async (answerData) => {
      const key = answerData.questionId || `q_${Date.now()}`;
      if (explanations[key]) return { success: true, data: explanations[key] };

      setLoadingId(key);
      setError(null);

      const result = await explainQuestionAnswer(answerData);
      if (result.success) {
        setExplanations((prev) => ({ ...prev, [key]: result.data }));
      } else {
        setError(result.error);
      }

      setLoadingId(null);
      return result;
    },
    [explanations],
  );

  const explainBatch = useCallback(async (answers) => {
    setIsLoading(true);
    setError(null);
    const result = await batchExplainAnswers(answers);
    setIsLoading(false);
    return result;
  }, []);

  const getExplanation = useCallback(
    (questionId) => {
      return explanations[questionId] || null;
    },
    [explanations],
  );

  const isExplaining = useCallback(
    (questionId) => {
      return loadingId === questionId;
    },
    [loadingId],
  );

  const clearExplanations = useCallback(() => setExplanations({}), []);

  return {
    explanations,
    isLoading,
    loadingId,
    error,
    explainAnswer,
    explainBatch,
    getExplanation,
    isExplaining,
    clearExplanations,
  };
};

export default useExplainAnswer;
