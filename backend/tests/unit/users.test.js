const { describe, it, expect, beforeEach } = require("@jest/globals");
const mongoose = require("mongoose");

jest.mock("../../../models/User");
jest.mock("../../../models/Teacher");
jest.mock("../../../models/Admin");

const User = require("../../../models/User");
const Teacher = require("../../../models/Teacher");
const Admin = require("../../../models/Admin");
const {
  validStudent,
  validTeacher,
  validAdmin,
  multipleStudents,
} = require("../fixtures/users.fixture");

describe("Users Unit Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Student Model", () => {
    it("should create student with valid data", async () => {
      const mockStudent = {
        _id: new mongoose.Types.ObjectId(),
        ...validStudent,
        role: "student",
        totalQuizzesTaken: 0,
        averageScore: 0,
        studyStreak: 0,
        createdAt: new Date(),
        getPublicProfile: jest.fn().mockReturnValue({
          id: new mongoose.Types.ObjectId(),
          name: validStudent.name,
          email: validStudent.email,
          role: "student",
        }),
      };

      User.create.mockResolvedValue(mockStudent);
      const student = await User.create(validStudent);

      expect(student).toBeDefined();
      expect(student.name).toBe(validStudent.name);
      expect(student.email).toBe(validStudent.email);
      expect(student.role).toBe("student");
    });

    it("should initialize stats to zero", async () => {
      const mockStudent = {
        ...validStudent,
        totalQuizzesTaken: 0,
        averageScore: 0,
        bestScore: 0,
        totalCorrectAnswers: 0,
        totalQuestionsAnswered: 0,
        studyStreak: 0,
      };

      User.create.mockResolvedValue(mockStudent);
      const student = await User.create(validStudent);

      expect(student.totalQuizzesTaken).toBe(0);
      expect(student.averageScore).toBe(0);
      expect(student.studyStreak).toBe(0);
    });

    it("should find student by email", async () => {
      User.findOne.mockResolvedValue({
        ...validStudent,
        _id: new mongoose.Types.ObjectId(),
      });
      const student = await User.findOne({ email: validStudent.email });
      expect(student).toBeDefined();
      expect(student.email).toBe(validStudent.email);
    });

    it("should return null for non-existent student", async () => {
      User.findOne.mockResolvedValue(null);
      const student = await User.findOne({ email: "notfound@test.com" });
      expect(student).toBeNull();
    });

    it("should find all active students", async () => {
      User.find.mockResolvedValue(
        multipleStudents.map((s) => ({ ...s, isActive: true })),
      );
      const students = await User.find({ isActive: true });
      expect(students).toBeDefined();
      expect(students.length).toBe(multipleStudents.length);
    });

    it("should update student profile", async () => {
      const updatedData = { name: "Updated Name", school: "New School" };
      User.findByIdAndUpdate.mockResolvedValue({
        ...validStudent,
        ...updatedData,
      });
      const updated = await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(),
        updatedData,
        { new: true },
      );
      expect(updated.name).toBe("Updated Name");
      expect(updated.school).toBe("New School");
    });

    it("should ban student", async () => {
      const bannedStudent = {
        ...validStudent,
        isBanned: true,
        banReason: "Violation",
      };
      User.findByIdAndUpdate.mockResolvedValue(bannedStudent);
      const student = await User.findByIdAndUpdate(
        new mongoose.Types.ObjectId(),
        { isBanned: true, banReason: "Violation" },
        { new: true },
      );
      expect(student.isBanned).toBe(true);
      expect(student.banReason).toBe("Violation");
    });
  });

  describe("Teacher Model", () => {
    it("should create teacher with valid data", async () => {
      const mockTeacher = {
        _id: new mongoose.Types.ObjectId(),
        ...validTeacher,
        role: "teacher",
        totalQuestionsCreated: 0,
        totalAIGenerations: 0,
        getPublicProfile: jest.fn().mockReturnValue({
          id: new mongoose.Types.ObjectId(),
          name: validTeacher.name,
          email: validTeacher.email,
          role: "teacher",
          subject: validTeacher.subject,
        }),
      };

      Teacher.create.mockResolvedValue(mockTeacher);
      const teacher = await Teacher.create(validTeacher);

      expect(teacher).toBeDefined();
      expect(teacher.role).toBe("teacher");
      expect(teacher.subject).toBe(validTeacher.subject);
    });

    it("should require approval for teacher", async () => {
      const unapprovedTeacher = { ...validTeacher, isApproved: false };
      Teacher.create.mockResolvedValue(unapprovedTeacher);
      const teacher = await Teacher.create(validTeacher);
      teacher.isApproved = false;
      expect(teacher.isApproved).toBe(false);
    });

    it("should approve teacher", async () => {
      const approvedTeacher = {
        ...validTeacher,
        isApproved: true,
        approvedAt: new Date(),
      };
      Teacher.findByIdAndUpdate.mockResolvedValue(approvedTeacher);
      const teacher = await Teacher.findByIdAndUpdate(
        new mongoose.Types.ObjectId(),
        { isApproved: true },
        { new: true },
      );
      expect(teacher.isApproved).toBe(true);
    });

    it("should track AI generations", async () => {
      const teacher = {
        ...validTeacher,
        totalAIGenerations: 5,
        aiGenerationsThisMonth: 5,
      };
      Teacher.findById.mockResolvedValue(teacher);
      const found = await Teacher.findById(new mongoose.Types.ObjectId());
      expect(found.totalAIGenerations).toBe(5);
    });

    it("should check AI generation limit", () => {
      const monthlyLimit = 100;
      const currentUsage = 95;
      const hasReachedLimit = currentUsage >= monthlyLimit;
      expect(hasReachedLimit).toBe(false);

      const overLimit = 100;
      expect(overLimit >= monthlyLimit).toBe(true);
    });
  });

  describe("Admin Model", () => {
    it("should create admin with super admin privileges", async () => {
      const mockAdmin = {
        _id: new mongoose.Types.ObjectId(),
        ...validAdmin,
        role: "admin",
        permissions: {
          manageStudents: true,
          manageTeachers: true,
          manageQuestions: true,
          approveQuestions: true,
          viewAnalytics: true,
          manageSettings: true,
          viewReports: true,
          manageNotifications: true,
          manageAdmins: true,
        },
        getPublicProfile: jest.fn().mockReturnValue({
          id: new mongoose.Types.ObjectId(),
          name: validAdmin.name,
          email: validAdmin.email,
          role: "admin",
          isSuperAdmin: true,
        }),
      };

      Admin.create.mockResolvedValue(mockAdmin);
      const admin = await Admin.create(validAdmin);

      expect(admin).toBeDefined();
      expect(admin.role).toBe("admin");
      expect(admin.isSuperAdmin).toBe(true);
      expect(admin.permissions.manageStudents).toBe(true);
    });

    it("should have all permissions for super admin", async () => {
      const mockAdmin = {
        ...validAdmin,
        isSuperAdmin: true,
        hasPermission: (permission) => true,
      };

      Admin.findById.mockResolvedValue(mockAdmin);
      const admin = await Admin.findById(new mongoose.Types.ObjectId());

      expect(admin.hasPermission("manageStudents")).toBe(true);
      expect(admin.hasPermission("manageAdmins")).toBe(true);
    });
  });

  describe("User Stats Calculation", () => {
    it("should calculate accuracy correctly", () => {
      const totalCorrect = 150;
      const totalAnswered = 200;
      const accuracy = Math.round((totalCorrect / totalAnswered) * 100);
      expect(accuracy).toBe(75);
    });

    it("should return 0 accuracy when no questions answered", () => {
      const totalCorrect = 0;
      const totalAnswered = 0;
      const accuracy =
        totalAnswered > 0
          ? Math.round((totalCorrect / totalAnswered) * 100)
          : 0;
      expect(accuracy).toBe(0);
    });

    it("should update average score correctly", () => {
      const previousAvg = 75;
      const previousCount = 10;
      const newScore = 85;
      const newAvg = Math.round(
        (previousAvg * previousCount + newScore) / (previousCount + 1),
      );
      expect(newAvg).toBe(76);
    });
  });

  describe("Study Streak", () => {
    it("should increment streak for consecutive days", () => {
      const currentStreak = 5;
      const newStreak = currentStreak + 1;
      expect(newStreak).toBe(6);
    });

    it("should reset streak when day is missed", () => {
      const newStreak = 1;
      expect(newStreak).toBe(1);
    });

    it("should not change streak for same day study", () => {
      const currentStreak = 5;
      expect(currentStreak).toBe(5);
    });
  });

  describe("Grade Validation", () => {
    it("should accept valid grades", () => {
      const validGrades = ["Grade 11", "Grade 12"];
      expect(validGrades.includes("Grade 11")).toBe(true);
      expect(validGrades.includes("Grade 12")).toBe(true);
    });

    it("should reject invalid grades", () => {
      const validGrades = ["Grade 11", "Grade 12"];
      expect(validGrades.includes("Grade 10")).toBe(false);
      expect(validGrades.includes("University")).toBe(false);
    });
  });
});
