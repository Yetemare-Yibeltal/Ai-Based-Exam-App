const mongoose = require("mongoose");

const validStudent = {
  name: "Test Student",
  email: "student@test.com",
  password: "Test@1234",
  grade: "Grade 12",
  school: "Test School",
  isEmailVerified: true,
  isActive: true,
};

const validTeacher = {
  name: "Test Teacher",
  email: "teacher@test.com",
  password: "Test@1234",
  subject: "math",
  school: "Test School",
  isEmailVerified: true,
  isApproved: true,
  isActive: true,
};

const validAdmin = {
  name: "Test Admin",
  email: "admin@test.com",
  password: "Admin@1234",
  isSuperAdmin: true,
  isActive: true,
  isEmailVerified: true,
};

const invalidStudent = {
  name: "A",
  email: "not-an-email",
  password: "123",
};

const studentWithWeakPassword = {
  name: "Test Student",
  email: "student2@test.com",
  password: "password",
};

const multipleStudents = [
  {
    name: "Student One",
    email: "student1@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "School A",
    isEmailVerified: true,
    averageScore: 85,
    totalQuizzesTaken: 10,
  },
  {
    name: "Student Two",
    email: "student2@test.com",
    password: "Test@1234",
    grade: "Grade 11",
    school: "School B",
    isEmailVerified: true,
    averageScore: 72,
    totalQuizzesTaken: 7,
  },
  {
    name: "Student Three",
    email: "student3@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "School A",
    isEmailVerified: false,
    averageScore: 91,
    totalQuizzesTaken: 15,
  },
];

const loginCredentials = {
  student: { email: "student@test.com", password: "Test@1234" },
  teacher: { email: "teacher@test.com", password: "Test@1234" },
  admin: { email: "admin@test.com", password: "Admin@1234" },
};

module.exports = {
  validStudent,
  validTeacher,
  validAdmin,
  invalidStudent,
  studentWithWeakPassword,
  multipleStudents,
  loginCredentials,
};
