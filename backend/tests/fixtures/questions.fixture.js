const validQuestion = {
  questionText: "What is the value of x if 2x + 6 = 14?",
  options: ["3", "4", "6", "8"],
  correctAnswer: 1,
  subject: "math",
  difficulty: "easy",
  grade: "Grade 12",
  topic: "Linear Equations",
  explanation: "2x = 14 - 6 = 8, therefore x = 4",
  year: 2020,
};

const validBiologyQuestion = {
  questionText: "Which organelle is known as the powerhouse of the cell?",
  options: ["Nucleus", "Ribosome", "Mitochondria", "Golgi Apparatus"],
  correctAnswer: 2,
  subject: "biology",
  difficulty: "easy",
  grade: "Grade 12",
  topic: "Cell Biology",
  explanation: "Mitochondria produce ATP energy through cellular respiration",
  year: 2021,
};

const validEnglishQuestion = {
  questionText: "Choose the word that is closest in meaning to DILIGENT:",
  options: ["Lazy", "Hardworking", "Clever", "Honest"],
  correctAnswer: 1,
  subject: "english",
  difficulty: "easy",
  grade: "Grade 12",
  topic: "Vocabulary",
  explanation: "Diligent means showing care and effort in work",
  year: 2020,
};

const invalidQuestion = {
  questionText: "Short",
  options: ["A", "B"],
  correctAnswer: 5,
  subject: "invalid_subject",
};

const questionMissingFields = {
  questionText: "What is 2 + 2?",
  options: ["3", "4", "5", "6"],
};

const multipleQuestions = [
  {
    questionText: "What is the chemical symbol for Gold?",
    options: ["Go", "Gd", "Au", "Ag"],
    correctAnswer: 2,
    subject: "chemistry",
    difficulty: "easy",
    grade: "Grade 12",
    topic: "Periodic Table",
    explanation: "Au comes from the Latin word Aurum meaning gold",
    year: 2020,
  },
  {
    questionText: "What is the unit of electric current?",
    options: ["Volt", "Watt", "Ohm", "Ampere"],
    correctAnswer: 3,
    subject: "physics",
    difficulty: "easy",
    grade: "Grade 12",
    topic: "Electricity",
    explanation: "Electric current is measured in Amperes",
    year: 2020,
  },
  {
    questionText: "In what year did Ethiopia adopt its current constitution?",
    options: ["1991", "1994", "1995", "2000"],
    correctAnswer: 2,
    subject: "civics",
    difficulty: "medium",
    grade: "Grade 12",
    topic: "Ethiopian Constitution",
    explanation: "The FDRE Constitution was ratified in 1995",
    year: 2020,
  },
];

const aiGeneratedQuestion = {
  questionText: "What is the derivative of f(x) = x³ + 2x² - 5x + 1?",
  options: ["3x² + 4x - 5", "3x² + 4x + 5", "x² + 4x - 5", "3x + 4"],
  correctAnswer: 0,
  subject: "math",
  difficulty: "hard",
  grade: "Grade 12",
  topic: "Calculus",
  explanation: "Using power rule: f'(x) = 3x² + 4x - 5",
  isAIGenerated: true,
};

const subjectCounts = {
  math: 20,
  english: 20,
  biology: 20,
  chemistry: 20,
  physics: 20,
  civics: 20,
};

module.exports = {
  validQuestion,
  validBiologyQuestion,
  validEnglishQuestion,
  invalidQuestion,
  questionMissingFields,
  multipleQuestions,
  aiGeneratedQuestion,
  subjectCounts,
};
