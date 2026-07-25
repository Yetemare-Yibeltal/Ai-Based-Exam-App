const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../../server');
const User = require('../../models/User');
const Session = require('../../models/Session');
const { validStudent, loginCredentials } = require('../fixtures/users.fixture');

beforeAll(async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/heroyDB_test');
});

afterAll(async () => {
  await User.deleteMany({ email: { $regex: /test\.com$/ } });
  await Session.deleteMany({});
  await mongoose.connection.close();
});

afterEach(async () => {
  await User.deleteMany({ email: { $regex: /test\.com$/ } });
  await Session.deleteMany({});
});

describe('Auth Integration Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new student successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send(validStudent);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user.email).toBe(validStudent.email);
      expect(res.body.data.user.role).toBe('student');
    });

    it('should not register with duplicate email', async () => {
      await request(app).post('/api/auth/register').send(validStudent);
      const res = await request(app).post('/api/auth/register').send(validStudent);

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should not register with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validStudent, email: 'notanemail' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should not register with weak password', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...validStudent, email: 'new@test.com', password: 'weak' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });

    it('should not register without required fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'test@test.com' });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validStudent);
    });

    it('should login with valid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: validStudent.email,
          password: validStudent.password,
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
      expect(res.body.data.refreshToken).toBeDefined();
      expect(res.body.data.user).toBeDefined();
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: validStudent.email, password: 'WrongPass@123' });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should not login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'notfound@test.com', password: validStudent.password });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should not login without email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ password: validStudent.password });

      expect(res.status).toBe(422);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/auth/me', () => {
    let accessToken;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validStudent);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: validStudent.email, password: validStudent.password });
      accessToken = loginRes.body.data.accessToken;
    });

    it('should get current user with valid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${accessToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toBeDefined();
      expect(res.body.data.user.email).toBe(validStudent.email);
    });

    it('should not get user without token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should not get user with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalid_token');

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    let accessToken;
    let refreshToken;

    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validStudent);
      const loginRes = await request(app)
        .post('/api/auth/login')
        .send({ email: validStudent.email, password: validStudent.password });
      accessToken = loginRes.body.data.accessToken;
      refreshToken = loginRes.body.data.refreshToken;
    });

    it('should logout successfully', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${accessToken}`)
        .send({ refreshToken });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send(validStudent);
    });

    it('should send reset OTP for existing email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: validStudent.email });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return success even for non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'nonexistent@test.com' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await request(app).get('/health');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('HEROY');
    });
  });

  describe('API Info', () => {
    it('should return API information', async () => {
      const res = await request(app).get('/api');

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain('HEROY');
    });
  });

  describe('Rate Limiting', () => {
    it('should return 429 after too many failed login attempts', async () => {
      const attempts = [];
      for (let i = 0; i < 12; i++) {
        attempts.push(
          request(app)
            .post('/api/auth/login')
            .send({ email: 'test@test.com', password: 'Wrong@1234' })
        );
      }

      const results = await Promise.all(attempts);
      const tooManyRequests = results.some((r) => r.status === 429);
      expect(tooManyRequests).toBe(true);
    });
  });
});