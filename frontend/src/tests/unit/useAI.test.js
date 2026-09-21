import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";

vi.mock("../../api/ai.api", () => ({
  default: {
    getStudyTips: vi
      .fn()
      .mockResolvedValue({
        data: {
          data: {
            tips: [
              {
                title: "Test Tip",
                description: "Test description",
                priority: "high",
              },
            ],
            motivationalMessage: "Keep going!",
            weeklyGoal: "Practice daily",
          },
        },
      }),
    analyzeWeakSubjects: vi
      .fn()
      .mockResolvedValue({
        data: {
          data: {
            hasData: true,
            weakSubjects: [],
            strongSubjects: [],
            aiAnalysis: "Good progress",
          },
        },
      }),
    getExamTips: vi
      .fn()
      .mockResolvedValue({
        data: { data: { examTips: { before: [], during: [] } } },
      }),
    generateQuestions: vi
      .fn()
      .mockResolvedValue({
        data: { data: { questions: [], generationStats: { generated: 0 } } },
      }),
    validateQuestion: vi
      .fn()
      .mockResolvedValue({
        data: { data: { isValid: true, qualityScore: 85, issues: [] } },
      }),
    explainAnswer: vi
      .fn()
      .mockResolvedValue({
        data: { data: { isCorrect: true, mainExplanation: "Correct!" } },
      }),
    generateQuizFeedback: vi
      .fn()
      .mockResolvedValue({
        data: { data: { feedback: "Good job!", studyTips: [] } },
      }),
    getTimeManagementTips: vi
      .fn()
      .mockResolvedValue({ data: { data: { tips: {} } } }),
    getPersonalizedPlan: vi
      .fn()
      .mockResolvedValue({ data: { data: { plan: {} } } }),
    getMyHistory: vi.fn().mockResolvedValue({ data: { data: { logs: [] } } }),
  },
}));

import useAI from "../../hooks/useAI";

describe("useAI hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should initialize with default state", () => {
    const { result } = renderHook(() => useAI());
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.studyTips).toBeNull();
    expect(result.current.weakSubjects).toBeNull();
  });

  it("should expose all AI functions", () => {
    const { result } = renderHook(() => useAI());
    expect(typeof result.current.getStudyTips).toBe("function");
    expect(typeof result.current.analyzeWeakSubjects).toBe("function");
    expect(typeof result.current.explainAnswer).toBe("function");
    expect(typeof result.current.getQuizFeedback).toBe("function");
    expect(typeof result.current.generateQuestions).toBe("function");
    expect(typeof result.current.validateQuestion).toBe("function");
    expect(typeof result.current.getPersonalizedPlan).toBe("function");
    expect(typeof result.current.getExamTips).toBe("function");
    expect(typeof result.current.getTimeManagementTips).toBe("function");
    expect(typeof result.current.clearError).toBe("function");
  });

  it("should fetch study tips successfully", async () => {
    const { result } = renderHook(() => useAI());
    await act(async () => {
      const res = await result.current.getStudyTips();
      expect(res.success).toBe(true);
    });
    expect(result.current.studyTips).not.toBeNull();
    expect(result.current.studyTips.tips).toHaveLength(1);
  });

  it("should analyze weak subjects", async () => {
    const { result } = renderHook(() => useAI());
    await act(async () => {
      const res = await result.current.analyzeWeakSubjects();
      expect(res.success).toBe(true);
    });
    expect(result.current.weakSubjects).not.toBeNull();
    expect(result.current.weakSubjects.hasData).toBe(true);
  });
});
