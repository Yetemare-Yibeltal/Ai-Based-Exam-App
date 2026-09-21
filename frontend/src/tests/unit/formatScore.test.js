import { describe, it, expect } from "vitest";
import {
  formatPercentage,
  getGradeFromPercentage,
  getPerformanceLevel,
  formatTime,
  formatTimeDetailed,
  formatScore,
  calculateAccuracy,
  getRankEmoji,
  isPassingScore,
  isPerfectScore,
  getScoreTrend,
  formatNumber,
} from "../../utils/formatScore";

describe("formatScore utils", () => {
  describe("formatPercentage", () => {
    it("should format percentage correctly", () => {
      expect(formatPercentage(85)).toBe("85.0%");
      expect(formatPercentage(85, 0)).toBe("85%");
      expect(formatPercentage(0)).toBe("0.0%");
      expect(formatPercentage(100)).toBe("100.0%");
    });

    it("should handle null/undefined", () => {
      expect(formatPercentage(null)).toBe("0%");
      expect(formatPercentage(undefined)).toBe("0%");
    });
  });

  describe("getGradeFromPercentage", () => {
    it("should return A+ for 95+", () =>
      expect(getGradeFromPercentage(95)).toBe("A+"));
    it("should return A for 85-94", () =>
      expect(getGradeFromPercentage(85)).toBe("A"));
    it("should return B+ for 75-84", () =>
      expect(getGradeFromPercentage(75)).toBe("B+"));
    it("should return B for 65-74", () =>
      expect(getGradeFromPercentage(65)).toBe("B"));
    it("should return C+ for 55-64", () =>
      expect(getGradeFromPercentage(55)).toBe("C+"));
    it("should return C for 50-54", () =>
      expect(getGradeFromPercentage(50)).toBe("C"));
    it("should return D for 40-49", () =>
      expect(getGradeFromPercentage(40)).toBe("D"));
    it("should return F for below 40", () =>
      expect(getGradeFromPercentage(30)).toBe("F"));
  });

  describe("getPerformanceLevel", () => {
    it("should return Excellent for 90+", () =>
      expect(getPerformanceLevel(95).label).toBe("Excellent"));
    it("should return Good for 75-89", () =>
      expect(getPerformanceLevel(80).label).toBe("Good"));
    it("should return Average for 60-74", () =>
      expect(getPerformanceLevel(65).label).toBe("Average"));
    it("should return Below Average for 50-59", () =>
      expect(getPerformanceLevel(55).label).toBe("Below Average"));
    it("should return Poor for below 50", () =>
      expect(getPerformanceLevel(40).label).toBe("Poor"));
  });

  describe("formatTime", () => {
    it("should format seconds to mm:ss", () => {
      expect(formatTime(90)).toBe("1:30");
      expect(formatTime(600)).toBe("10:00");
      expect(formatTime(0)).toBe("0:00");
      expect(formatTime(65)).toBe("1:05");
    });
  });

  describe("formatTimeDetailed", () => {
    it("should format with hours when applicable", () => {
      expect(formatTimeDetailed(3661)).toBe("1h 1m 1s");
      expect(formatTimeDetailed(90)).toBe("1m 30s");
      expect(formatTimeDetailed(30)).toBe("30s");
    });
  });

  describe("formatScore", () => {
    it("should format as correct/total", () => {
      expect(formatScore(16, 20)).toBe("16/20");
      expect(formatScore(0, 20)).toBe("0/20");
    });
  });

  describe("calculateAccuracy", () => {
    it("should calculate accuracy percentage", () => {
      expect(calculateAccuracy(15, 20)).toBe(75);
      expect(calculateAccuracy(20, 20)).toBe(100);
      expect(calculateAccuracy(0, 20)).toBe(0);
      expect(calculateAccuracy(0, 0)).toBe(0);
    });
  });

  describe("getRankEmoji", () => {
    it("should return medals for top 3", () => {
      expect(getRankEmoji(1)).toBe("🥇");
      expect(getRankEmoji(2)).toBe("🥈");
      expect(getRankEmoji(3)).toBe("🥉");
      expect(getRankEmoji(4)).toBe("#4");
    });
  });

  describe("isPassingScore and isPerfectScore", () => {
    it("should identify passing scores", () => {
      expect(isPassingScore(50)).toBe(true);
      expect(isPassingScore(49)).toBe(false);
      expect(isPerfectScore(100)).toBe(true);
      expect(isPerfectScore(99)).toBe(false);
    });
  });

  describe("getScoreTrend", () => {
    it("should detect improving trend", () => {
      expect(getScoreTrend([50, 55, 60, 70, 75, 80])).toBe("improving");
    });

    it("should detect declining trend", () => {
      expect(getScoreTrend([80, 75, 70, 60, 55, 50])).toBe("declining");
    });

    it("should return stable for small changes", () => {
      expect(getScoreTrend([70, 72, 71, 73, 72, 74])).toBe("stable");
    });
  });

  describe("formatNumber", () => {
    it("should format large numbers", () => {
      expect(formatNumber(1500000)).toBe("1.5M");
      expect(formatNumber(1500)).toBe("1.5K");
      expect(formatNumber(999)).toBe("999");
    });
  });
});
