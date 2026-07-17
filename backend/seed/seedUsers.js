const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Teacher = require("../models/Teacher");

dotenv.config({ path: "../.env" });

const testStudents = [
  {
    name: "Abebe Girma",
    email: "abebe@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "Entoto Secondary School",
    isEmailVerified: true,
    totalQuizzesTaken: 15,
    averageScore: 78,
    bestScore: 95,
    totalCorrectAnswers: 234,
    totalQuestionsAnswered: 300,
    studyStreak: 7,
    favoriteSubject: "math",
  },
  {
    name: "Tigist Bekele",
    email: "tigist@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "Addis Ababa Preparatory School",
    isEmailVerified: true,
    totalQuizzesTaken: 22,
    averageScore: 85,
    bestScore: 100,
    totalCorrectAnswers: 374,
    totalQuestionsAnswered: 440,
    studyStreak: 14,
    favoriteSubject: "biology",
  },
  {
    name: "Dawit Tadesse",
    email: "dawit@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "Bole Secondary School",
    isEmailVerified: true,
    totalQuizzesTaken: 10,
    averageScore: 65,
    bestScore: 80,
    totalCorrectAnswers: 130,
    totalQuestionsAnswered: 200,
    studyStreak: 3,
    favoriteSubject: "english",
  },
  {
    name: "Selam Haile",
    email: "selam@test.com",
    password: "Test@1234",
    grade: "Grade 11",
    school: "Kotebe Secondary School",
    isEmailVerified: true,
    totalQuizzesTaken: 8,
    averageScore: 72,
    bestScore: 90,
    totalCorrectAnswers: 115,
    totalQuestionsAnswered: 160,
    studyStreak: 5,
    favoriteSubject: "chemistry",
  },
  {
    name: "Yonas Alemu",
    email: "yonas@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "Lideta Secondary School",
    isEmailVerified: true,
    totalQuizzesTaken: 30,
    averageScore: 92,
    bestScore: 100,
    totalCorrectAnswers: 552,
    totalQuestionsAnswered: 600,
    studyStreak: 21,
    favoriteSubject: "physics",
  },
  {
    name: "Hana Tesfaye",
    email: "hana@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "Haile Selassie Secondary School",
    isEmailVerified: true,
    totalQuizzesTaken: 18,
    averageScore: 81,
    bestScore: 95,
    totalCorrectAnswers: 291,
    totalQuestionsAnswered: 360,
    studyStreak: 10,
    favoriteSubject: "civics",
  },
  {
    name: "Bereket Mulugeta",
    email: "bereket@test.com",
    password: "Test@1234",
    grade: "Grade 11",
    school: "Medhane Alem Secondary School",
    isEmailVerified: false,
    totalQuizzesTaken: 5,
    averageScore: 55,
    bestScore: 70,
    totalCorrectAnswers: 55,
    totalQuestionsAnswered: 100,
    studyStreak: 2,
    favoriteSubject: "math",
  },
  {
    name: "Meron Kebede",
    email: "meron@test.com",
    password: "Test@1234",
    grade: "Grade 12",
    school: "Arat Kilo Secondary School",
    isEmailVerified: true,
    totalQuizzesTaken: 25,
    averageScore: 88,
    bestScore: 100,
    totalCorrectAnswers: 440,
    totalQuestionsAnswered: 500,
    studyStreak: 18,
    favoriteSubject: "biology",
  },
];

const testTeachers = [
  {
    name: "Ato Kebede Worku",
    email: "kebede.teacher@test.com",
    password: "Teacher@1234",
    subject: "math",
    subjects: ["math", "physics"],
    school: "Addis Ababa University",
    experience: 10,
    qualification: "MSc Mathematics",
    isEmailVerified: true,
    isApproved: true,
    totalQuestionsCreated: 25,
    totalQuestionsApproved: 20,
    totalAIGenerations: 15,
  },
  {
    name: "W/ro Almaz Tadesse",
    email: "almaz.teacher@test.com",
    password: "Teacher@1234",
    subject: "english",
    subjects: ["english"],
    school: "Addis Ababa Secondary School",
    experience: 8,
    qualification: "BA English Literature",
    isEmailVerified: true,
    isApproved: true,
    totalQuestionsCreated: 18,
    totalQuestionsApproved: 15,
    totalAIGenerations: 10,
  },
  {
    name: "Dr. Tesfaye Bekele",
    email: "tesfaye.teacher@test.com",
    password: "Teacher@1234",
    subject: "biology",
    subjects: ["biology", "chemistry"],
    school: "Ethiopian Medical College",
    experience: 15,
    qualification: "PhD Biology",
    isEmailVerified: true,
    isApproved: true,
    totalQuestionsCreated: 40,
    totalQuestionsApproved: 35,
    totalAIGenerations: 25,
  },
  {
    name: "Ato Girma Haile",
    email: "girma.teacher@test.com",
    password: "Teacher@1234",
    subject: "physics",
    subjects: ["physics", "math"],
    school: "Jimma University",
    experience: 12,
    qualification: "MSc Physics",
    isEmailVerified: true,
    isApproved: false,
    totalQuestionsCreated: 5,
    totalQuestionsApproved: 0,
    totalAIGenerations: 3,
  },
];

const seedUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB...");

    let studentsCreated = 0;
    let studentsSkipped = 0;

    for (const studentData of testStudents) {
      const existing = await User.findOne({ email: studentData.email });
      if (existing) {
        console.log(`Skipping existing student: ${studentData.email}`);
        studentsSkipped++;
        continue;
      }

      await User.create(studentData);
      console.log(
        `✅ Student created: ${studentData.name} (${studentData.email})`,
      );
      studentsCreated++;
    }

    let teachersCreated = 0;
    let teachersSkipped = 0;

    for (const teacherData of testTeachers) {
      const existing = await Teacher.findOne({ email: teacherData.email });
      if (existing) {
        console.log(`Skipping existing teacher: ${teacherData.email}`);
        teachersSkipped++;
        continue;
      }

      await Teacher.create(teacherData);
      console.log(
        `✅ Teacher created: ${teacherData.name} (${teacherData.email})`,
      );
      teachersCreated++;
    }

    console.log("\n─────────────────────────────────");
    console.log("SEED SUMMARY:");
    console.log(`  Students created: ${studentsCreated}`);
    console.log(`  Students skipped: ${studentsSkipped}`);
    console.log(`  Teachers created: ${teachersCreated}`);
    console.log(`  Teachers skipped: ${teachersSkipped}`);
    console.log("─────────────────────────────────");
    console.log("\nTest Credentials:");
    console.log("  Student:  abebe@test.com / Test@1234");
    console.log("  Teacher:  kebede.teacher@test.com / Teacher@1234");
    console.log("─────────────────────────────────\n");

    mongoose.connection.close();
    console.log("Done!");
  } catch (error) {
    console.error("❌ Seed users error:", error.message);
    process.exit(1);
  }
};

seedUsers();
