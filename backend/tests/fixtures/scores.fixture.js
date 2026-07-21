const mongoose = require("mongoose");

const validScore = {
  subject: "math",
  totalQuestions: 20,
  correctAnswers: 16,
  percentage: 80,
  timeTaken: 600,
  difficulty: "medium",
  answers: [
    {
      questionId: new mongoose.Types.ObjectId(),
      selectedAnswer: 1,
      correctAnswer: 1,
      isCorrect: true,
      timeToAnswer: 30,
    },
    {
      questionId: new mongoose.Types.ObjectId(),
      selectedAnswer: 2,
      correctAnswer: 1,
      isCorrect: false,
      timeToAnswer: 45,
    },
  ],
};

const perfectScore = {
  subject: "biology",
  totalQuestions: 20,
  correctAnswers: 20,
  percentage: 100,
  timeTaken: 480,
  difficulty: "easy",
  answers: Array.from({ length: 20 }, () => ({
    questionId: new mongoose.Types.ObjectId(),
    selectedAnswer: 0,
    correctAnswer: 0,
    isCorrect: true,
    timeToAnswer: 24,
  })),
};

const failingScore = {
  subject: "chemistry",
  totalQuestions: 20,
  correctAnswers: 6,
  percentage: 30,
  timeTaken: 720,
  difficulty: "hard",
  answers: Array.from({ length: 20 }, (_, i) => ({
    questionId: new mongoose.Types.ObjectId(),
    selectedAnswer: i % 4,
    correctAnswer: (i + 1) % 4,
    isCorrect: i < 6,
    timeToAnswer: 36,
  })),
};

const multipleScores = [
  {
    subject: "math",
    totalQuestions: 20,
    correctAnswers: 18,
    percentage: 90,
    timeTaken: 540,
    difficulty: "medium",
  },
  {
    subject: "english",
    totalQuestions: 20,
    correctAnswers: 14,
    percentage: 70,
    timeTaken: 600,
    difficulty: "easy",
  },
  {
    subject: "biology",
    totalQuestions: 20,
    correctAnswers: 16,
    percentage: 80,
    timeTaken: 480,
    difficulty: "medium",
  },
  {
    subject: "chemistry",
    totalQuestions: 20,
    correctAnswers: 12,
    percentage: 60,
    timeTaken: 660,
    difficulty: "hard",
  },
  {
    subject: "physics",
    totalQuestions: 20,
    correctAnswers: 10,
    percentage: 50,
    timeTaken: 700,
    difficulty: "hard",
  },
  {
    subject: "civics",
    totalQuestions: 20,
    correctAnswers: 17,
    percentage: 85,
    timeTaken: 520,
    difficulty: "easy",
  },
];

const gradeExpectations = {
  95: "A+",
  85: "A",
  75: "B+",
  65: "B",
  55: "C+",
  50: "C",
  40: "D",
  30: "F",
};

const submitScorePayload = {
  subject: "math",
  totalQuestions: 5,
  correctAnswers: 4,
  timeTaken: 150,
  difficulty: "medium",
  answers: Array.from({ length: 5 }, (_, i) => ({
    questionId: new mongoose.Types.ObjectId().toString(),
    selectedAnswer: i < 4 ? 1 : 0,
    timeToAnswer: 30,
  })),
};

module.exports = {
  validScore,
  perfectScore,
  failingScore,
  multipleScores,
  gradeExpectations,
  submitScorePayload,
};
