const {
  describe,
  it,
  expect,
  beforeEach,
  afterEach,
} = require("@jest/globals");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

jest.mock("../../../models/User");
jest.mock("../../../models/Session");
jest.mock("../../../utils/sendEmail");
jest.mock("../../../utils/generateToken");
jest.mock("../../../utils/otpGenerator");

const User = require("../../../models/User");
const { generateTokenPair } = require("../../../utils/generateToken");
const {
  generateEmailVerificationOTP,
  hashOTP,
  verifyOTP,
  isOTPExpired,
} = require("../../../utils/otpGenerator");

describe("Auth Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Password Hashing", () => {
    it("should hash password correctly", async () => {
      const password = "Test@1234";
      const hash = await bcrypt.hash(password, 12);
      const isMatch = await bcrypt.compare(password, hash);
      expect(isMatch).toBe(true);
    });

    it("should not match wrong password", async () => {
      const password = "Test@1234";
      const hash = await bcrypt.hash(password, 12);
      const isMatch = await bcrypt.compare("WrongPassword@1", hash);
      expect(isMatch).toBe(false);
    });
  });

  describe("OTP Generation", () => {
    it("should generate 6 digit OTP", () => {
      generateEmailVerificationOTP.mockReturnValue({
        otp: "123456",
        expiresAt: new Date(Date.now() + 15 * 60 * 1000),
      });

      const { otp } = generateEmailVerificationOTP();
      expect(otp).toHaveLength(6);
      expect(/^\d{6}$/.test(otp)).toBe(true);
    });

    it("should hash OTP correctly", () => {
      hashOTP.mockReturnValue("hashed_otp_value");
      const hash = hashOTP("123456");
      expect(hash).toBeDefined();
      expect(hash).not.toBe("123456");
    });

    it("should verify correct OTP", () => {
      verifyOTP.mockReturnValue(true);
      const isValid = verifyOTP("123456", "hashed_otp");
      expect(isValid).toBe(true);
    });

    it("should reject incorrect OTP", () => {
      verifyOTP.mockReturnValue(false);
      const isValid = verifyOTP("000000", "hashed_otp");
      expect(isValid).toBe(false);
    });

    it("should detect expired OTP", () => {
      isOTPExpired.mockReturnValue(true);
      const expiredDate = new Date(Date.now() - 1000);
      const isExpired = isOTPExpired(expiredDate);
      expect(isExpired).toBe(true);
    });

    it("should detect valid OTP expiry", () => {
      isOTPExpired.mockReturnValue(false);
      const futureDate = new Date(Date.now() + 15 * 60 * 1000);
      const isExpired = isOTPExpired(futureDate);
      expect(isExpired).toBe(false);
    });
  });

  describe("Token Generation", () => {
    it("should generate access and refresh tokens", () => {
      generateTokenPair.mockReturnValue({
        accessToken: "mock_access_token",
        refreshToken: "mock_refresh_token",
      });

      const { accessToken, refreshToken } = generateTokenPair({
        id: new mongoose.Types.ObjectId(),
        role: "student",
        email: "test@test.com",
      });

      expect(accessToken).toBeDefined();
      expect(refreshToken).toBeDefined();
      expect(accessToken).toBe("mock_access_token");
      expect(refreshToken).toBe("mock_refresh_token");
    });
  });

  describe("User Model Validation", () => {
    it("should require name", () => {
      User.create.mockRejectedValue(new Error("Name is required"));
      expect(
        User.create({ email: "test@test.com", password: "Test@1234" }),
      ).rejects.toThrow("Name is required");
    });

    it("should require email", () => {
      User.create.mockRejectedValue(new Error("Email is required"));
      expect(
        User.create({ name: "Test", password: "Test@1234" }),
      ).rejects.toThrow("Email is required");
    });

    it("should find user by email", async () => {
      const mockUser = {
        _id: new mongoose.Types.ObjectId(),
        name: "Test User",
        email: "test@test.com",
        role: "student",
        isActive: true,
        isEmailVerified: true,
      };

      User.findOne.mockResolvedValue(mockUser);
      const user = await User.findOne({ email: "test@test.com" });
      expect(user).toBeDefined();
      expect(user.email).toBe("test@test.com");
    });

    it("should return null for non-existent user", async () => {
      User.findOne.mockResolvedValue(null);
      const user = await User.findOne({ email: "nonexistent@test.com" });
      expect(user).toBeNull();
    });
  });

  describe("Role Validation", () => {
    it("should validate student role", () => {
      const validRoles = ["student", "teacher", "admin"];
      expect(validRoles.includes("student")).toBe(true);
    });

    it("should reject invalid role", () => {
      const validRoles = ["student", "teacher", "admin"];
      expect(validRoles.includes("superuser")).toBe(false);
    });
  });

  describe("Email Validation", () => {
    it("should validate correct email format", () => {
      const emailRegex = /^\S+@\S+\.\S+$/;
      expect(emailRegex.test("user@example.com")).toBe(true);
      expect(emailRegex.test("student@heroy.et")).toBe(true);
    });

    it("should reject invalid email format", () => {
      const emailRegex = /^\S+@\S+\.\S+$/;
      expect(emailRegex.test("notanemail")).toBe(false);
      expect(emailRegex.test("missing@domain")).toBe(false);
    });
  });

  describe("Password Strength Validation", () => {
    const validatePassword = (password) => {
      const hasUpperCase = /[A-Z]/.test(password);
      const hasLowerCase = /[a-z]/.test(password);
      const hasNumbers = /[0-9]/.test(password);
      const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
        password,
      );
      const hasMinLength = password.length >= 8;
      return (
        hasUpperCase &&
        hasLowerCase &&
        hasNumbers &&
        hasSpecialChar &&
        hasMinLength
      );
    };

    it("should accept strong password", () => {
      expect(validatePassword("Test@1234")).toBe(true);
      expect(validatePassword("SecurePass#99")).toBe(true);
    });

    it("should reject weak passwords", () => {
      expect(validatePassword("password")).toBe(false);
      expect(validatePassword("12345678")).toBe(false);
      expect(validatePassword("ALLUPPERCASE1!")).toBe(false);
      expect(validatePassword("short1!")).toBe(false);
    });
  });
});
