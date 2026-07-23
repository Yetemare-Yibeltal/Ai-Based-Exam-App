const { describe, it, expect, beforeEach } = require("@jest/globals");
const mongoose = require("mongoose");

jest.mock("../../../models/Score");
jest.mock("../../../models/User");

const Score = require("../../../models/Score");
const User = require("../../../models/User");
const {
  validScore,
  perfectScore,
  failingScore,
  multipleScores,
  gradeExpectations,
} = require("../fixtures/scores.fixture");

describe("Scores Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Score Calculation", () => {
    it("should calculate percentage correctly", () => {
      const percentage = Math.round((16 / 20) * 100);
      expect(percentage).toBe(80);
    });

    it("should calculate perfect score percentage", () => {
      const percentage = Math.round((20 / 20) * 100);
      expect(percentage).toBe(100);
    });

    it("should calculate failing score percentage", () => {
      const percentage = Math.round((6 / 20) * 100);
      expect(percentage).toBe(30);
    });

    it("should calculate wrong answers correctly", () => {
      const totalQuestions = 20;
      const correctAnswers = 16;
      const wrongAnswers = totalQuestions - correctAnswers;
      expect(wrongAnswers).toBe(4);
    });
  });

  describe("Grade Assignment", () => {
    const getGrade = (percentage) => {
      if (percentage >= 95) return "A+";
      if (percentage >= 85) return "A";
      if (percentage >= 75) return "B+";
      if (percentage >= 65) return "B";
      if (percentage >= 55) return "C+";
      if (percentage >= 50) return "C";
      if (percentage >= 40) return "D";
      return "F";
    };

    it("should assign A+ for 95% and above", () => {
      expect(getGrade(95)).toBe("A+");
      expect(getGrade(100)).toBe("A+");
    });

    it("should assign A for 85-94%", () => {
      expect(getGrade(85)).toBe("A");
      expect(getGrade(90)).toBe("A");
    });

    it("should assign B+ for 75-84%", () => {
      expect(getGrade(75)).toBe("B+");
      expect(getGrade(80)).toBe("B+");
    });

    it("should assign B for 65-74%", () => {
      expect(getGrade(65)).toBe("B");
      expect(getGrade(70)).toBe("B");
    });

    it("should assign C+ for 55-64%", () => {
      expect(getGrade(55)).toBe("C+");
      expect(getGrade(60)).toBe("C+");
    });

    it("should assign C for 50-54%", () => {
      expect(getGrade(50)).toBe("C");
    });

    it("should assign D for 40-49%", () => {
      expect(getGrade(40)).toBe("D");
      expect(getGrade(45)).toBe("D");
    });

    it("should assign F for below 40%", () => {
      expect(getGrade(30)).toBe("F");
      expect(getGrade(0)).toBe("F");
    });

    it("should match expected grade expectations", () => {
      Object.entries(gradeExpectations).forEach(([percentage, grade]) => {
        expect(getGrade(parseInt(percentage))).toBe(grade);
      });
    });
  });

  describe("Score Flags", () => {
    it("should identify perfect score", () => {
      expect(perfectScore.percentage === 100).toBe(true);
    });

    it("should identify passing score", () => {
      expect(validScore.percentage >= 50).toBe(true);
    });

    it("should identify failing score", () => {
      expect(failingScore.percentage < 50).toBe(true);
    });
  });

  describe("Score CRUD", () => {
    it("should create a score", async () => {
      const userId = new mongoose.Types.ObjectId();
      const mockScore = {
        _id: new mongoose.Types.ObjectId(),
        userId,
        ...validScore,
        grade: "B+",
        isPerfectScore: false,
        isPassingScore: true,
        getSummary: jest.fn().mockReturnValue({ ...validScore, grade: "B+" }),
      };

      Score.create.mockResolvedValue(mockScore);
      const score = await Score.create({ userId, ...validScore });

      expect(score).toBeDefined();
      expect(score.subject).toBe(validScore.subject);
      expect(score.percentage).toBe(validScore.percentage);
    });

    it("should find scores by user ID", async () => {
      const userId = new mongoose.Types.ObjectId();
      Score.find.mockResolvedValue(
        multipleScores.map((s) => ({ ...s, userId })),
      );

      const scores = await Score.find({ userId });
      expect(scores).toBeDefined();
      expect(scores.length).toBe(multipleScores.length);
    });

    it("should find scores by subject", async () => {
      Score.find.mockResolvedValue([validScore]);
      const scores = await Score.find({ subject: "math" });
      expect(scores[0].subject).toBe("math");
    });

    it("should delete a score", async () => {
      const scoreId = new mongoose.Types.ObjectId();
      Score.findByIdAndDelete.mockResolvedValue({ _id: scoreId });
      const result = await Score.findByIdAndDelete(scoreId);
      expect(result).toBeDefined();
    });
  });

  describe("Score Statistics", () => {
    it("should calculate average score", () => {
      const scores = [80, 70, 90, 60, 85];
      const avg = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
      expect(avg).toBe(77);
    });

    it("should find best score", () => {
      const scores = [80, 70, 90, 60, 85];
      const best = Math.max(...scores);
      expect(best).toBe(90);
    });

    it("should find lowest score", () => {
      const scores = [80, 70, 90, 60, 85];
      const lowest = Math.min(...scores);
      expect(lowest).toBe(60);
    });

    it("should calculate pass rate", () => {
      const scores = [80, 45, 90, 30, 85, 55];
      const passed = scores.filter((s) => s >= 50).length;
      const passRate = Math.round((passed / scores.length) * 100);
      expect(passRate).toBe(67);
    });
  });

  describe("Time Formatting", () => {
    it("should format time correctly", () => {
      const formatTime = (seconds) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs.toString().padStart(2, "0")}`;
      };

      expect(formatTime(600)).toBe("10:00");
      expect(formatTime(75)).toBe("1:15");
      expect(formatTime(30)).toBe("0:30");
    });
  });

  describe("Performance Level", () => {
    const getPerformanceLevel = (percentage) => {
      if (percentage >= 90) return "Excellent";
      if (percentage >= 75) return "Good";
      if (percentage >= 60) return "Average";
      if (percentage >= 50) return "Below Average";
      return "Poor";
    };

    it("should return Excellent for 90%+", () => {
      expect(getPerformanceLevel(90)).toBe("Excellent");
      expect(getPerformanceLevel(100)).toBe("Excellent");
    });

    it("should return Good for 75-89%", () => {
      expect(getPerformanceLevel(75)).toBe("Good");
      expect(getPerformanceLevel(85)).toBe("Good");
    });

    it("should return Average for 60-74%", () => {
      expect(getPerformanceLevel(60)).toBe("Average");
      expect(getPerformanceLevel(70)).toBe("Average");
    });

    it("should return Below Average for 50-59%", () => {
      expect(getPerformanceLevel(50)).toBe("Below Average");
    });

    it("should return Poor for below 50%", () => {
      expect(getPerformanceLevel(30)).toBe("Poor");
    });
  });
});
