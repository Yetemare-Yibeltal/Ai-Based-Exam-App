import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useQuizStore from "../store/useQuizStore";
import questionsAPI from "../api/questions.api";
import { getResultsRoute } from "../constants/routes";

const useQuiz = () => {
  const navigate = useNavigate();
  const [isStarting, setIsStarting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const {
    questions,
    currentQuestionIndex,
    selectedAnswers,
    timeLeft,
    isCompleted,
    results,
    sessionId,
    subject,
    difficulty,
    startTime,
    timeTakenPerQuestion,
    startQuiz,
    selectAnswer,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    updateTimeLeft,
    getSubmitPayload,
    setResults,
    setSubmitting,
    resetQuiz,
    getCurrentQuestion,
    getProgress,
    isQuestionAnswered,
    isLastQuestion,
    isFirstQuestion,
  } = useQuizStore();

  const handleStartQuiz = useCallback(
    async (quizParams) => {
      setIsStarting(true);
      setError(null);
      try {
        const res = await questionsAPI.startQuiz(quizParams);
        const quizData = res.data.data;
        startQuiz({
          questions: quizData.questions,
          sessionId: quizData.sessionId,
          subject: quizData.subject,
          difficulty: quizData.difficulty || quizParams.difficulty,
          timePerQuestion: quizData.timePerQuestion || 30,
        });
        return { success: true };
      } catch (err) {
        const message = err.response?.data?.message || "Failed to start quiz";
        setError(message);
        toast.error(message);
        return { success: false, error: message };
      } finally {
        setIsStarting(false);
      }
    },
    [startQuiz],
  );

  const handleSelectAnswer = useCallback(
    (answerIndex) => {
      selectAnswer(currentQuestionIndex, answerIndex);
    },
    [selectAnswer, currentQuestionIndex],
  );

  const handleSubmitQuiz = useCallback(async () => {
    if (isSubmitting) return;

    const unanswered = questions.length - Object.keys(selectedAnswers).length;
    if (unanswered > 0) {
      const confirmed = window.confirm(
        `You have ${unanswered} unanswered question(s). Submit anyway?`,
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    setSubmitting(true);

    try {
      const payload = getSubmitPayload();
      const timeTaken = Math.round((Date.now() - startTime) / 1000);

      const answers = questions
        .map((q, index) => ({
          questionId: q._id || q.id,
          selectedAnswer:
            selectedAnswers[index] !== undefined ? selectedAnswers[index] : 0,
          timeToAnswer: timeTakenPerQuestion[index] || 0,
        }))
        .filter((_, index) => selectedAnswers[index] !== undefined);

      const correctAnswers = 0;

      const submitData = {
        subject: payload.subject,
        difficulty: payload.difficulty || "mixed",
        sessionId: payload.sessionId,
        timeTaken,
        totalQuestions: answers.length,
        correctAnswers,
        answers,
      };

      const res = await questionsAPI.submitQuiz(submitData);
      const scoreData = res.data.data;

      setResults(scoreData);
      toast.success(
        `Quiz submitted! You scored ${scoreData.results?.percentage}%`,
      );

      const scoreId = scoreData.score?.id || scoreData.score?._id;
      if (scoreId) {
        navigate(getResultsRoute(scoreId));
      }

      return { success: true, data: scoreData };
    } catch (err) {
      const message = err.response?.data?.message || "Failed to submit quiz";
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setIsSubmitting(false);
      setSubmitting(false);
    }
  }, [
    isSubmitting,
    questions,
    selectedAnswers,
    getSubmitPayload,
    startTime,
    timeTakenPerQuestion,
    setResults,
    setSubmitting,
    navigate,
  ]);

  const handleTimeUp = useCallback(() => {
    toast.error("Time is up! Submitting your answers...");
    handleSubmitQuiz();
  }, [handleSubmitQuiz]);

  const handleResetQuiz = useCallback(() => {
    resetQuiz();
  }, [resetQuiz]);

  const currentQuestion = getCurrentQuestion();
  const progress = getProgress();
  const isCurrentAnswered = isQuestionAnswered(currentQuestionIndex);
  const currentSelectedAnswer = selectedAnswers[currentQuestionIndex];

  return {
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswers,
    currentSelectedAnswer,
    timeLeft,
    isCompleted,
    results,
    sessionId,
    subject,
    difficulty,
    progress,
    isStarting,
    isSubmitting,
    isCurrentAnswered,
    error,
    handleStartQuiz,
    handleSelectAnswer,
    handleSubmitQuiz,
    handleTimeUp,
    handleResetQuiz,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    updateTimeLeft,
    isLastQuestion: isLastQuestion(),
    isFirstQuestion: isFirstQuestion(),
  };
};

export default useQuiz;
