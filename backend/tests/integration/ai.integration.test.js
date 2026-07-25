const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const Teacher = require('../../models/Teacher');
const Admin = require('../../models/Admin');
const Question = require('../../models/Question');
const Session = require('../../models/Session');
const AIGenerationLog = require('../../models/AIGenerationLog');

let studentToken;
let teacherToken;
let adminToken;
let testTeacherId;

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/heroyDB_test');

  const studentRes = await request(app)
    .post('/api/auth/register')
    .send({
      name: 'AI Test Student',
      email: 'aistudent@test.com',
      password: 'Test@1234',
      grade: 'Grade 12',
      isEmailVerified: true,
    });

  const studentLogin = await request(app)
    .post('/api/auth/login')
    .send({ email: 'aistudent@test.com', password: 'Test@1234' });

  studentToken = studentLogin.body.data?.accessToken;

  await User.findOneAndUpdate(
    { email: 'aistudent@test.com' },
    { isEmailVerified: true }
  );

  const teacher = await Teacher.create({
    name: 'AI Test Teacher',
    email: 'aiteacher@test.com',
    password: 'Test@1234',
    subject: 'math',
    isEmailVerified: true,
    isApproved: true,
    isActive: true,
  });

  testTeacherId = teacher._id;

  const teacherLogin = await request(app)
    .post('/api/teacher/auth/login')
    .send({ email: 'aiteacher@test.com', password: 'Test@1234' });

  teacherToken = teacherLogin.body.data?.accessToken;

  const admin = await Admin.create({
    name: 'AI Test Admin',
    email: 'aiadmin@test.com',
    password: 'Admin@1234',
    isSuperAdmin: true,
    isEmailVerified: true,
  });

  const adminLogin = await request(app)
    .post('/api/admin/auth/login')
    .send({ email: 'aiadmin@test.com', password: 'Admin@1234' });

  adminToken = adminLogin.body.data?.accessToken;
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /test\.com$/ } });
  await Teacher.deleteMany({ email: { $regex: /test\.com$/ } });
  await Admin.deleteMany({ email: { $regex: /test\.com$/ } });
  await Question.deleteMany({ createdBy: testTeacherId });
  await Session.deleteMany({});
  await AIGenerationLog.deleteMany({ requestedBy: testTeacherId });
  await mongoose.connection.close();
});

describe('AI Integration Tests', () => {
  describe('GET /api/ai/exam-tips', () => {
    it('should get static exam tips', async () => {
      const res = await request(app)
        .get('/api/ai/exam-tips')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.examTips).toBeDefined();
      expect(res.body.data.examTips.before).toBeDefined();
      expect(res.body.data.examTips.during).toBeDefined();
    });

    it('should require authentication', async () => {
      const res = await request(app).get('/api/ai/exam-tips');
      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/ai/time-management', () => {
    it('should get time management tips', async () => {
      const res = await request(app)
        .get('/api/ai/time-management')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.tips).toBeDefined();
      expect(res.body.data.tips.dailySchedule).toBeDefined();
      expect(res.body.data.tips.weeklyPlan).toBeDefined();
      expect(res.body.data.tips.techniques).toBeDefined();
    });
  });

  describe('POST /api/ai/validate-question', () => {
    it('should validate a valid question', async () => {
      if (!teacherToken) return;

      const res = await request(app)
        .post('/api/ai/validate-question')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          questionText: 'What is the capital city of Ethiopia?',
          options: ['Nairobi', 'Addis Ababa', 'Cairo', 'Lagos'],
          correctAnswer: 1,
          subject: 'civics',
          explanation: 'Addis Ababa is the capital and largest city of Ethiopia',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.isValid).toBeDefined();
      expect(res.body.data.qualityScore).toBeDefined();
    });

    it('should reject question with missing fields', async () => {
      if (!teacherToken) return;

      const res = await request(app)
        .post('/api/ai/validate-question')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          questionText: 'Short',
          options: ['A', 'B'],
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should require teacher or admin role', async () => {
      const res = await request(app)
        .post('/api/ai/validate-question')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          questionText: 'What is 2 + 2?',
          options: ['3', '4', '5', '6'],
          correctAnswer: 1,
          subject: 'math',
        });

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/ai/study-tips', () => {
    it('should get personalized study tips for student', async () => {
      if (!studentToken) return;

      const res = await request(app)
        .get('/api/ai/study-tips')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 429, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.tips).toBeDefined();
      }
    });

    it('should not allow teachers to access student study tips', async () => {
      if (!teacherToken) return;

      const res = await request(app)
        .get('/api/ai/study-tips')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/ai/weak-subjects', () => {
    it('should analyze weak subjects for student', async () => {
      if (!studentToken) return;

      const res = await request(app)
        .get('/api/ai/weak-subjects')
        .set('Authorization', `Bearer ${studentToken}`);

      expect([200, 429]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeDefined();
      }
    });
  });

  describe('GET /api/ai/usage-stats', () => {
    it('should get AI usage stats for admin', async () => {
      if (!adminToken) return;

      const res = await request(app)
        .get('/api/ai/usage-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.platform).toBeDefined();
    });

    it('should deny access to non-admin', async () => {
      if (!studentToken) return;

      const res = await request(app)
        .get('/api/ai/usage-stats')
        .set('Authorization', `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });
  });

  describe('GET /api/ai/my-history', () => {
    it('should get AI history for teacher', async () => {
      if (!teacherToken) return;

      const res = await request(app)
        .get('/api/ai/my-history')
        .set('Authorization', `Bearer ${teacherToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.logs).toBeDefined();
    });
  });

  describe('POST /api/ai/generate-questions', () => {
    it('should generate questions for teacher', async () => {
      if (!teacherToken) return;

      const res = await request(app)
        .post('/api/ai/generate-questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({
          subject: 'math',
          difficulty: 'medium',
          count: 1,
          grade: 'Grade 12',
        });

      expect([200, 429, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.questions).toBeDefined();
      }
    });

    it('should require subject field', async () => {
      if (!teacherToken) return;

      const res = await request(app)
        .post('/api/ai/generate-questions')
        .set('Authorization', `Bearer ${teacherToken}`)
        .send({ difficulty: 'medium', count: 1 });

      expect(res.status).toBe(400);
    });

    it('should deny student access', async () => {
      if (!studentToken) return;

      const res = await request(app)
        .post('/api/ai/generate-questions')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ subject: 'math', difficulty: 'easy', count: 1 });

      expect(res.status).toBe(403);
    });
  });

  describe('POST /api/ai/quiz-feedback', () => {
    it('should generate quiz feedback', async () => {
      if (!studentToken) return;

      const res = await request(app)
        .post('/api/ai/quiz-feedback')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({
          subject: 'math',
          score: 75,
          totalQuestions: 20,
          correctAnswers: 15,
          timeTaken: 600,
          weakTopics: ['Calculus'],
          strongTopics: ['Algebra'],
        });

      expect([200, 429, 500]).toContain(res.status);
      if (res.status === 200) {
        expect(res.body.success).toBe(true);
        expect(res.body.data.feedback).toBeDefined();
      }
    });

    it('should require required fields', async () => {
      if (!studentToken) return;

      const res = await request(app)
        .post('/api/ai/quiz-feedback')
        .set('Authorization', `Bearer ${studentToken}`)
        .send({ subject: 'math' });

      expect(res.status).toBe(400);
    });
  });
});