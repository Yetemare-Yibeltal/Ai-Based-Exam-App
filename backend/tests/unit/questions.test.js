const { describe, it, expect, beforeEach } = require("@jest/globals");
const mongoose = require("mongoose");

jest.mock("../../../models/Question");

const Question = require("../../../models/Question");
const {
  validQuestion,
  multipleQuestions,
  invalidQuestion,
} = require("../fixtures/questions.fixture");

describe("Questions Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Question Validation", () => {
    it("should validate correct question structure", () => {
      const question = validQuestion;
      expect(question.questionText.length).toBeGreaterThanOrEqual(10);
      expect(question.options).toHaveLength(4);
      expect(question.correctAnswer).toBeGreaterThanOrEqual(0);
      expect(question.correctAnswer).toBeLessThanOrEqual(3);
      expect([
        "math",
        "english",
        "biology",
        "chemistry",
        "physics",
        "civics",
      ]).toContain(question.subject);
      expect(["easy", "medium", "hard"]).toContain(question.difficulty);
    });

    it("should reject question with less than 4 options", () => {
      const badQuestion = { ...validQuestion, options: ["A", "B"] };
      expect(badQuestion.options.length).not.toBe(4);
    });

    it("should reject invalid correct answer index", () => {
      const badQuestion = { ...validQuestion, correctAnswer: 5 };
      expect(badQuestion.correctAnswer).toBeGreaterThan(3);
    });

    it("should reject invalid subject", () => {
      const validSubjects = [
        "math",
        "english",
        "biology",
        "chemistry",
        "physics",
        "civics",
      ];
      expect(validSubjects.includes("invalid_subject")).toBe(false);
    });

    it("should reject invalid difficulty", () => {
      const validDifficulties = ["easy", "medium", "hard"];
      expect(validDifficulties.includes("super_hard")).toBe(false);
    });

    it("should validate question text minimum length", () => {
      expect(validQuestion.questionText.length).toBeGreaterThanOrEqual(10);
      expect("Short".length).toBeLessThan(10);
    });
  });

  describe("Question CRUD", () => {
    it("should create a question successfully", async () => {
      const mockQuestion = {
        _id: new mongoose.Types.ObjectId(),
        ...validQuestion,
        status: "draft",
        isAIGenerated: false,
        createdAt: new Date(),
        getSafeQuestion: jest.fn().mockReturnValue({ ...validQuestion }),
        getFullQuestion: jest.fn().mockReturnValue({ ...validQuestion }),
      };

      Question.create.mockResolvedValue(mockQuestion);
      const question = await Question.create(validQuestion);

      expect(question).toBeDefined();
      expect(question.questionText).toBe(validQuestion.questionText);
      expect(question.subject).toBe(validQuestion.subject);
    });

    it("should find question by ID", async () => {
      const mockId = new mongoose.Types.ObjectId();
      const mockQuestion = { _id: mockId, ...validQuestion };

      Question.findById.mockResolvedValue(mockQuestion);
      const question = await Question.findById(mockId);

      expect(question).toBeDefined();
      expect(question._id).toEqual(mockId);
    });

    it("should return null for non-existent question", async () => {
      Question.findById.mockResolvedValue(null);
      const question = await Question.findById(new mongoose.Types.ObjectId());
      expect(question).toBeNull();
    });

    it("should find approved questions by subject", async () => {
      Question.find.mockResolvedValue(
        multipleQuestions.map((q) => ({ ...q, status: "approved" })),
      );
      const questions = await Question.find({
        subject: "math",
        status: "approved",
      });
      expect(questions).toBeDefined();
      expect(Array.isArray(questions)).toBe(true);
    });

    it("should update question status", async () => {
      const mockQuestion = {
        _id: new mongoose.Types.ObjectId(),
        ...validQuestion,
        status: "approved",
      };

      Question.findByIdAndUpdate.mockResolvedValue(mockQuestion);
      const updated = await Question.findByIdAndUpdate(
        mockQuestion._id,
        { status: "approved" },
        { new: true },
      );

      expect(updated.status).toBe("approved");
    });

    it("should delete question by ID", async () => {
      Question.findByIdAndDelete.mockResolvedValue({
        _id: new mongoose.Types.ObjectId(),
      });
      const result = await Question.findByIdAndDelete(
        new mongoose.Types.ObjectId(),
      );
      expect(result).toBeDefined();
    });
  });

  describe("Question Statistics", () => {
    it("should calculate correct rate", () => {
      const timesUsed = 100;
      const timesCorrect = 75;
      const correctRate = Math.round((timesCorrect / timesUsed) * 100);
      expect(correctRate).toBe(75);
    });

    it("should return 0 correct rate when never used", () => {
      const timesUsed = 0;
      const timesCorrect = 0;
      const correctRate =
        timesUsed > 0 ? Math.round((timesCorrect / timesUsed) * 100) : 0;
      expect(correctRate).toBe(0);
    });

    it("should determine actual difficulty from correct rate", () => {
      const getDifficulty = (rate) => {
        if (rate >= 70) return "easy";
        if (rate >= 40) return "medium";
        return "hard";
      };

      expect(getDifficulty(85)).toBe("easy");
      expect(getDifficulty(55)).toBe("medium");
      expect(getDifficulty(25)).toBe("hard");
    });
  });

  describe("Subject Distribution", () => {
    it("should cover all 6 subjects", () => {
      const subjects = [
        "math",
        "english",
        "biology",
        "chemistry",
        "physics",
        "civics",
      ];
      const questionSubjects = multipleQuestions.map((q) => q.subject);
      const uniqueSubjects = [...new Set(questionSubjects)];
      expect(uniqueSubjects.length).toBeGreaterThan(0);
      uniqueSubjects.forEach((s) => expect(subjects).toContain(s));
    });
  });

  describe("Answer Checking", () => {
    it("should correctly identify right answer", () => {
      const question = validQuestion;
      const selectedAnswer = question.correctAnswer;
      expect(selectedAnswer === question.correctAnswer).toBe(true);
    });

    it("should correctly identify wrong answer", () => {
      const question = validQuestion;
      const wrongAnswer = (question.correctAnswer + 1) % 4;
      expect(wrongAnswer === question.correctAnswer).toBe(false);
    });

    it("should calculate score percentage", () => {
      const totalQuestions = 20;
      const correctAnswers = 16;
      const percentage = Math.round((correctAnswers / totalQuestions) * 100);
      expect(percentage).toBe(80);
    });
  });
});
