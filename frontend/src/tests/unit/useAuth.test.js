import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import React from "react";

vi.mock("../../store/useAuthStore", () => ({
  default: vi.fn(() => ({
    user: null,
    role: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
    login: vi
      .fn()
      .mockResolvedValue({
        success: true,
        user: { name: "Test", role: "student" },
      }),
    register: vi
      .fn()
      .mockResolvedValue({
        success: true,
        user: { name: "Test", role: "student" },
      }),
    logout: vi.fn().mockResolvedValue(undefined),
    updateUser: vi.fn(),
    clearError: vi.fn(),
  })),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return { ...actual, useNavigate: () => vi.fn() };
});

import useAuth from "../../hooks/useAuth";

const wrapper = ({ children }) =>
  React.createElement(MemoryRouter, null, children);

describe("useAuth hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return auth state", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(result.current.role).toBeNull();
  });

  it("should have role helper flags", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(result.current.isStudent).toBe(false);
    expect(result.current.isTeacher).toBe(false);
    expect(result.current.isAdmin).toBe(false);
  });

  it("should expose handleLogin function", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(typeof result.current.handleLogin).toBe("function");
  });

  it("should expose handleRegister function", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(typeof result.current.handleRegister).toBe("function");
  });

  it("should expose handleLogout function", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });
    expect(typeof result.current.handleLogout).toBe("function");
  });
});
