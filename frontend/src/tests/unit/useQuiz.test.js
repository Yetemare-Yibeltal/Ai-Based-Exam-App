import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

vi.mock("../../store/useQuizStore", () => ({
  default: vi.fn(() => ({
    questions: [
      {
        _id: "1",
        questionText: "Q1?",
        options: ["A", "B", "C", "D"],
        subject: "math",
      },
      {
        _id: "2",
        questionText: "Q2?",
        options: ["A", "B", "C", "D"],
        subject: "math",
      },
    ],
    currentQuestionIndex: 0,
    selectedAnswers: {},
    timeLeft: 600,
    isCompleted: false,
    results: null,
    sessionId: "test123",
    subject: "math",
    startTime: Date.now(),
    timeTakenPerQuestion: {},
    startQuiz: vi.fn(),
    selectAnswer: vi.fn(),
    nextQuestion: vi.fn(),
    prevQuestion: vi.fn(),
    goToQuestion: vi.fn(),
    updateTimeLeft: vi.fn(),
    getSubmitPayload: vi.fn().mockReturnValue({ subject: "math", answers: [] }),
    setResults: vi.fn(),
    setSubmitting: vi.fn(),
    resetQuiz: vi.fn(),
    getCurrentQuestion: vi
      .fn()
      .mockReturnValue({ _id: "1", questionText: "Q1?" }),
    getProgress: vi
      .fn()
      .mockReturnValue({ answered: 0, total: 2, percentage: 0 }),
    isQuestionAnswered: vi.fn().mockReturnValue(false),
    isLastQuestion: vi.fn().mockReturnValue(false),
    isFirstQuestion: vi.fn().mockReturnValue(true),
  })),
}));

vi.mock("../../api/questions.api", () => ({
  default: { startQuiz: vi.fn(), submitQuiz: vi.fn() },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

import useQuiz from "../../hooks/useQuiz";

const wrapper = ({ children }) =>
  React.createElement(MemoryRouter, null, children);

describe("useQuiz hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return quiz state", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(result.current.questions).toHaveLength(2);
    expect(result.current.isCompleted).toBe(false);
    expect(result.current.subject).toBe("math");
  });

  it("should return progress", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(result.current.progress).toEqual({
      answered: 0,
      total: 2,
      percentage: 0,
    });
  });

  it("should expose handleStartQuiz", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(typeof result.current.handleStartQuiz).toBe("function");
  });

  it("should expose handleSelectAnswer", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(typeof result.current.handleSelectAnswer).toBe("function");
  });

  it("should expose handleSubmitQuiz", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(typeof result.current.handleSubmitQuiz).toBe("function");
  });

  it("should identify first question", () => {
    const { result } = renderHook(() => useQuiz(), { wrapper });
    expect(result.current.isFirstQuestion).toBe(true);
  });
});
