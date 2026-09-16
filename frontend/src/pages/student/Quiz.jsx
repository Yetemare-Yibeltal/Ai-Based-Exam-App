import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import StudentLayout from '../../components/layout/StudentLayout';
import QuestionCard from '../../components/quiz/QuestionCard';
import Timer from '../../components/quiz/Timer';
import QuizProgress from '../../components/quiz/QuizProgress';
import QuizSummary from '../../components/quiz/QuizSummary';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Select from '../../components/ui/Select';
import useQuiz from '../../hooks/useQuiz';
import useAuthStore from '../../store/useAuthStore';
import { DIFFICULTIES } from '../../constants/subjects';
import { getSubjectName } from '../../constants/subjects';

const StudentQuiz = () => {
  const { subject } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [quizStarted, setQuizStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState('mixed');

  const {
    questions,
    currentQuestion,
    currentQuestionIndex,
    selectedAnswers,
    currentSelectedAnswer,
    timeLeft,
    progress,
    isStarting,
    isSubmitting,
    isCurrentAnswered,
    handleStartQuiz,
    handleSelectAnswer,
    handleSubmitQuiz,
    handleTimeUp,
    handleResetQuiz,
    nextQuestion,
    prevQuestion,
    goToQuestion,
    updateTimeLeft,
    isLastQuestion,
    isFirstQuestion,
  } = useQuiz();

  const subjectName = getSubjectName(subject);

  useEffect(() => {
    if (!subject) {
      navigate('/student/subjects');
    }
  }, [subject, navigate]);

  const handleStart = async () => {
    const result = await handleStartQuiz({
      subject,
      questionCount: parseInt(questionCount),
      difficulty: difficulty === 'mixed' ? undefined : difficulty,
      grade: user?.grade || 'Grade 12',
    });
    if (result.success) {
      setQuizStarted(true);
    }
  };

  const handleFinish = () => {
    setShowSummary(true);
  };

  const handleFinalSubmit = async () => {
    setShowSummary(false);
    await handleSubmitQuiz();
  };

  const handleBack = () => {
    setShowSummary(false);
  };

  if (!quizStarted) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 w-full max-w-lg"
          >
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">
                {subject === 'math' ? '📐' : subject === 'english' ? '📚' : subject === 'biology' ? '🔬' : subject === 'chemistry' ? '⚗️' : subject === 'physics' ? '⚡' : '🏛️'}
              </div>
              <h1 className="text-2xl font-black text-gray-900 mb-2">
                {subjectName} Quiz
              </h1>
              <p className="text-gray-500">
                Configure your quiz settings and start practicing
              </p>
            </div>

            <div className="flex flex-col gap-5 mb-8">
              <div>
                <label className="label">Number of Questions</label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 30, 40].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`py-3 rounded-xl font-bold text-sm transition-all ${
                        questionCount === count
                          ? 'bg-primary-900 text-white shadow-sm'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              <Select
                label="Difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                options={[
                  { value: 'mixed', label: '🎲 Mixed (All Levels)' },
                  { value: 'easy', label: '🟢 Easy' },
                  { value: 'medium', label: '🟡 Medium' },
                  { value: 'hard', label: '🔴 Hard' },
                ]}
              />

              <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-2xl">⏱️</span>
                <div>
                  <p className="text-sm font-semibold text-primary-900">Time Limit</p>
                  <p className="text-xs text-gray-500">
                    {questionCount * 30} seconds ({Math.round(questionCount * 30 / 60)} minutes) • 30 sec per question
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                onClick={handleStart}
                isLoading={isStarting}
              >
                🚀 Start Quiz
              </Button>
              <Button
                variant="ghost"
                fullWidth
                onClick={() => navigate('/student/subjects')}
              >
                ← Choose Different Subject
              </Button>
            </div>
          </motion.div>
        </div>
      </StudentLayout>
    );
  }

  if (showSummary) {
    return (
      <StudentLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <QuizSummary
            questions={questions}
            selectedAnswers={selectedAnswers}
            subject={subject}
            onSubmit={handleFinalSubmit}
            onBack={handleBack}
            isLoading={isSubmitting}
          />
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="min-h-screen bg-gray-50 pb-24">
        {/* Header */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to quit? Your progress will be lost.')) {
                      handleResetQuiz();
                      navigate('/student/subjects');
                    }
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  ✕
                </button>
                <div>
                  <p className="text-sm font-bold text-gray-800 capitalize">{subjectName}</p>
                  <p className="text-xs text-gray-400">
                    Question {currentQuestionIndex + 1} of {questions.length}
                  </p>
                </div>
              </div>
              <Timer
                totalSeconds={questions.length * 30}
                onTimeUp={handleTimeUp}
                onTick={updateTimeLeft}
                className="w-48"
              />
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left column - Progress */}
            <div className="lg:col-span-1">
              <QuizProgress
                currentIndex={currentQuestionIndex}
                totalQuestions={questions.length}
                answeredIndices={selectedAnswers}
                onGoToQuestion={goToQuestion}
              />
            </div>

            {/* Right column - Question */}
            <div className="lg:col-span-3">
              <AnimatePresence mode="wait">
                <QuestionCard
                  key={currentQuestionIndex}
                  question={currentQuestion}
                  questionNumber={currentQuestionIndex + 1}
                  totalQuestions={questions.length}
                  selectedAnswer={currentSelectedAnswer}
                  onSelectAnswer={handleSelectAnswer}
                />
              </AnimatePresence>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-6 gap-4">
                <Button
                  variant="outline"
                  onClick={prevQuestion}
                  disabled={isFirstQuestion}
                  leftIcon={<span>←</span>}
                >
                  Previous
                </Button>

                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">
                    {progress.answered}/{progress.total} answered
                  </span>
                </div>

                {isLastQuestion ? (
                  <Button
                    variant="primary"
                    onClick={handleFinish}
                    rightIcon={<span>→</span>}
                  >
                    Finish Quiz
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    onClick={nextQuestion}
                    rightIcon={<span>→</span>}
                  >
                    Next
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
};

export default StudentQuiz;