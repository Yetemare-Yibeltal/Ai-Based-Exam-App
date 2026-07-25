const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../../server");
const User = require("../../models/User");
const Question = require("../../models/Question");
const Score = require("../../models/Score");
const Session = require("../../models/Session");
const { validStudent } = require("../fixtures/users.fixture");
const { multipleQuestions } = require("../fixtures/questions.fixture");

let accessToken;
let testUserId;
let testQuestions = [];

beforeAll(async () => {
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://localhost:27017/heroyDB_test",
  );

  const registerRes = await request(app)
    .post("/api/auth/register")
    .send({ ...validStudent, isEmailVerified: true });

  const loginRes = await request(app)
    .post("/api/auth/login")
    .send({ email: validStudent.email, password: validStudent.password });

  accessToken = loginRes.body.data?.accessToken;
  testUserId = loginRes.body.data?.user?.id;

  const admin = await require("../../models/Admin").create({
    name: "Test Admin",
    email: "quizadmin@test.com",
    password: "Admin@1234",
    isSuperAdmin: true,
    isEmailVerified: true,
  });

  for (const q of multipleQuestions) {
    const question = await Question.create({
      ...q,
      status: "approved",
      createdBy: admin._id,
      createdByModel: "Admin",
      approvedBy: admin._id,
      approvedAt: new Date(),
    });
    testQuestions.push(question);
  }
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /test\.com$/ } });
  await Question.deleteMany({ createdByModel: "Admin" });
  await Score.deleteMany({ userId: testUserId });
  await Session.deleteMany({});
  await require("../../models/Admin").deleteMany({
    email: "quizadmin@test.com",
  });
  await mongoose.connection.close();
});

describe("Quiz Integration Tests", () => {
  describe("GET /api/student/quiz/subjects", () => {
    it("should get all subjects with question counts", async () => {
      const res = await request(app)
        .get("/api/student/quiz/subjects")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subjects).toBeDefined();
      expect(Array.isArray(res.body.data.subjects)).toBe(true);
      expect(res.body.data.subjects.length).toBe(6);
    });

    it("should require authentication", async () => {
      const res = await request(app).get("/api/student/quiz/subjects");
      expect(res.status).toBe(401);
    });
  });

  describe("GET /api/student/quiz/questions/:subject", () => {
    it("should get questions for valid subject", async () => {
      const res = await request(app)
        .get("/api/student/quiz/questions/chemistry")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.questions).toBeDefined();
      expect(Array.isArray(res.body.data.questions)).toBe(true);
    });

    it("should not include correct answers in response", async () => {
      const res = await request(app)
        .get("/api/student/quiz/questions/chemistry")
        .set("Authorization", `Bearer ${accessToken}`);

      if (res.body.data.questions.length > 0) {
        const question = res.body.data.questions[0];
        expect(question.correctAnswer).toBeUndefined();
      }
    });

    it("should return 400 for invalid subject", async () => {
      const res = await request(app)
        .get("/api/student/quiz/questions/invalidsubject")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(400);
    });

    it("should respect limit query parameter", async () => {
      const res = await request(app)
        .get("/api/student/quiz/questions/chemistry?limit=2")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.questions.length > 0) {
        expect(res.body.data.questions.length).toBeLessThanOrEqual(2);
      }
    });
  });

  describe("POST /api/student/quiz/start", () => {
    it("should start a quiz session", async () => {
      await User.findByIdAndUpdate(testUserId, { isEmailVerified: true });

      const res = await request(app)
        .post("/api/student/quiz/start")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ subject: "chemistry", questionCount: 3 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.sessionId).toBeDefined();
      expect(res.body.data.questions).toBeDefined();
    });

    it("should return 400 for invalid subject", async () => {
      const res = await request(app)
        .post("/api/student/quiz/start")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ subject: "invalid" });

      expect(res.status).toBe(400);
    });
  });

  describe("POST /api/student/quiz/submit", () => {
    it("should submit quiz and get results", async () => {
      await User.findByIdAndUpdate(testUserId, { isEmailVerified: true });

      const chemQuestions = testQuestions.filter(
        (q) => q.subject === "chemistry",
      );

      if (chemQuestions.length === 0) {
        return;
      }

      const answers = chemQuestions.slice(0, 3).map((q) => ({
        questionId: q._id.toString(),
        selectedAnswer: q.correctAnswer,
        timeToAnswer: 30,
      }));

      const res = await request(app)
        .post("/api/student/quiz/submit")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({
          subject: "chemistry",
          totalQuestions: answers.length,
          correctAnswers: answers.length,
          answers,
          timeTaken: 90,
          sessionId: `test_${Date.now()}`,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.results).toBeDefined();
      expect(res.body.data.results.subject).toBe("chemistry");
      expect(res.body.data.results.percentage).toBeDefined();
    });

    it("should require answers array", async () => {
      const res = await request(app)
        .post("/api/student/quiz/submit")
        .set("Authorization", `Bearer ${accessToken}`)
        .send({ subject: "chemistry" });

      expect(res.status).toBe(400);
    });
  });

  describe("GET /api/student/quiz/history", () => {
    it("should get quiz history", async () => {
      const res = await request(app)
        .get("/api/student/quiz/history")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("GET /api/student/quiz/stats/overview", () => {
    it("should get quiz statistics", async () => {
      const res = await request(app)
        .get("/api/student/quiz/stats/overview")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.overview).toBeDefined();
    });
  });

  describe("Questions API", () => {
    it("should get approved questions", async () => {
      const res = await request(app)
        .get("/api/questions")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should filter questions by subject", async () => {
      const res = await request(app)
        .get("/api/questions?subject=chemistry")
        .set("Authorization", `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      if (res.body.data.length > 0) {
        res.body.data.forEach((q) => {
          expect(q.subject).toBe("chemistry");
        });
      }
    });

    it("should get subject statistics", async () => {
      const res = await request(app).get("/api/questions/stats/subjects");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subjects).toBeDefined();
    });
  });

  describe("Leaderboard API", () => {
    it("should get global leaderboard", async () => {
      const res = await request(app).get("/api/leaderboard");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.leaderboard).toBeDefined();
    });

    it("should get weekly leaderboard", async () => {
      const res = await request(app).get("/api/leaderboard/weekly");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("should get subject leaderboard", async () => {
      const res = await request(app).get("/api/leaderboard/subject/math");

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
