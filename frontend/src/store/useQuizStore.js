import { create } from "zustand";

const useQuizStore = create((set, get) => ({
  currentQuiz: null,
  questions: [],
  currentQuestionIndex: 0,
  selectedAnswers: {},
  timePerQuestion: 30,
  totalTime: 0,
  timeLeft: 0,
  isSubmitting: false,
  isCompleted: false,
  results: null,
  sessionId: null,
  subject: null,
  difficulty: null,
  startTime: null,
  questionStartTime: null,
  timeTakenPerQuestion: {},

  startQuiz: (quizData) => {
    const {
      questions,
      sessionId,
      subject,
      difficulty,
      timePerQuestion = 30,
    } = quizData;
    const totalTime = questions.length * timePerQuestion;

    set({
      questions,
      sessionId,
      subject,
      difficulty,
      timePerQuestion,
      totalTime,
      timeLeft: totalTime,
      currentQuestionIndex: 0,
      selectedAnswers: {},
      timeTakenPerQuestion: {},
      isCompleted: false,
      isSubmitting: false,
      results: null,
      startTime: Date.now(),
      questionStartTime: Date.now(),
    });
  },

  selectAnswer: (questionIndex, answerIndex) => {
    const { questionStartTime, timeTakenPerQuestion } = get();
    const timeSpent = Math.round((Date.now() - questionStartTime) / 1000);

    set((state) => ({
      selectedAnswers: {
        ...state.selectedAnswers,
        [questionIndex]: answerIndex,
      },
      timeTakenPerQuestion: {
        ...timeTakenPerQuestion,
        [questionIndex]: timeSpent,
      },
    }));
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({
        currentQuestionIndex: currentQuestionIndex + 1,
        questionStartTime: Date.now(),
      });
    }
  },

  prevQuestion: () => {
    const { currentQuestionIndex } = get();
    if (currentQuestionIndex > 0) {
      set({
        currentQuestionIndex: currentQuestionIndex - 1,
        questionStartTime: Date.now(),
      });
    }
  },

  goToQuestion: (index) => {
    const { questions } = get();
    if (index >= 0 && index < questions.length) {
      set({ currentQuestionIndex: index, questionStartTime: Date.now() });
    }
  },

  updateTimeLeft: (time) => set({ timeLeft: time }),

  getSubmitPayload: () => {
    const {
      questions,
      selectedAnswers,
      subject,
      difficulty,
      sessionId,
      startTime,
      timeTakenPerQuestion,
    } = get();

    const timeTaken = Math.round((Date.now() - startTime) / 1000);

    const answers = questions
      .map((q, index) => ({
        questionId: q._id || q.id,
        selectedAnswer:
          selectedAnswers[index] !== undefined ? selectedAnswers[index] : -1,
        timeToAnswer: timeTakenPerQuestion[index] || 0,
      }))
      .filter((a) => a.selectedAnswer !== -1);

    const correctAnswers = 0;
    const totalQuestions = answers.length;

    return {
      subject,
      difficulty,
      sessionId,
      timeTaken,
      totalQuestions,
      correctAnswers,
      answers,
    };
  },

  setResults: (results) => set({ results, isCompleted: true }),
  setSubmitting: (isSubmitting) => set({ isSubmitting }),

  resetQuiz: () =>
    set({
      currentQuiz: null,
      questions: [],
      currentQuestionIndex: 0,
      selectedAnswers: {},
      timePerQuestion: 30,
      totalTime: 0,
      timeLeft: 0,
      isSubmitting: false,
      isCompleted: false,
      results: null,
      sessionId: null,
      subject: null,
      difficulty: null,
      startTime: null,
      questionStartTime: null,
      timeTakenPerQuestion: {},
    }),

  getCurrentQuestion: () => {
    const { questions, currentQuestionIndex } = get();
    return questions[currentQuestionIndex] || null;
  },

  getProgress: () => {
    const { selectedAnswers, questions } = get();
    return {
      answered: Object.keys(selectedAnswers).length,
      total: questions.length,
      percentage:
        questions.length > 0
          ? Math.round(
              (Object.keys(selectedAnswers).length / questions.length) * 100,
            )
          : 0,
    };
  },

  isQuestionAnswered: (index) => {
    const { selectedAnswers } = get();
    return selectedAnswers[index] !== undefined;
  },

  isLastQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    return currentQuestionIndex === questions.length - 1;
  },

  isFirstQuestion: () => {
    const { currentQuestionIndex } = get();
    return currentQuestionIndex === 0;
  },
}));

export default useQuizStore;
