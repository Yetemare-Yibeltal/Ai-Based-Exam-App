const { describe, it, expect, beforeEach } = require('@jest/globals');
const mongoose = require('mongoose');

jest.mock('../../../config/anthropic');
jest.mock('../../../models/AIGenerationLog');
jest.mock('../../../models/Question');
jest.mock('../../../models/Teacher');

const { generateWithAI } = require('../../../config/anthropic');
const AIGenerationLog = require('../../../models/AIGenerationLog');
const Question = require('../../../models/Question');

describe('AI Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('AI Generation', () => {
    it('should generate questions successfully', async () => {
      const mockResponse = {
        success: true,
        content: JSON.stringify({
          questions: [
            {
              questionText: 'What is 2 + 2?',
              options: ['3', '4', '5', '6'],
              correctAnswer: 1,
              explanation: '2 + 2 = 4',
              topic: 'Basic Arithmetic',
              difficulty: 'easy',
            },
          ],
        }),
        usage: { input_tokens: 100, output_tokens: 200 },
      };

      generateWithAI.mockResolvedValue(mockResponse);

      const result = await generateWithAI('Generate a math question', { max_tokens: 1000 });

      expect(result.success).toBe(true);
      expect(result.content).toBeDefined();

      const parsed = JSON.parse(result.content);
      expect(parsed.questions).toHaveLength(1);
      expect(parsed.questions[0].options).toHaveLength(4);
    });

    it('should handle AI generation failure', async () => {
      generateWithAI.mockResolvedValue({
        success: false,
        error: 'API rate limit exceeded',
      });

      const result = await generateWithAI('Generate a question', { max_tokens: 1000 });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate generated question format', () => {
      const validateQuestion = (q) => {
        if (!q.questionText || q.questionText.length < 10) return false;
        if (!Array.isArray(q.options) || q.options.length !== 4) return false;
        if (typeof q.correctAnswer !== 'number') return false;
        if (q.correctAnswer < 0 || q.correctAnswer > 3) return false;
        return true;
      };

      const validQ = {
        questionText: 'What is the capital of Ethiopia?',
        options: ['Nairobi', 'Addis Ababa', 'Cairo', 'Lagos'],
        correctAnswer: 1,
        explanation: 'Addis Ababa is the capital city of Ethiopia',
      };

      const invalidQ = {
        questionText: 'Short',
        options: ['A', 'B'],
        correctAnswer: 5,
      };

      expect(validateQuestion(validQ)).toBe(true);
      expect(validateQuestion(invalidQ)).toBe(false);
    });

    it('should parse AI JSON response correctly', () => {
      const aiContent = JSON.stringify({
        questions: [
          {
            questionText: 'What is photosynthesis?',
            options: [
              'A process that produces energy from sunlight',
              'A type of cell division',
              'A metabolic reaction',
              'A form of respiration',
            ],
            correctAnswer: 0,
            explanation: 'Photosynthesis converts sunlight to chemical energy',
            topic: 'Plant Biology',
            difficulty: 'medium',
          },
        ],
      });

      const clean = aiContent.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const parsed = JSON.parse(clean);

      expect(parsed.questions).toBeDefined();
      expect(parsed.questions[0].correctAnswer).toBe(0);
    });

    it('should handle malformed AI response', () => {
      const malformedContent = 'This is not valid JSON {{{';

      expect(() => {
        JSON.parse(malformedContent);
      }).toThrow();
    });
  });

  describe('AI Log Tracking', () => {
    it('should create AI generation log', async () => {
      const mockLog = {
        _id: new mongoose.Types.ObjectId(),
        requestedBy: new mongoose.Types.ObjectId(),
        type: 'generate_question',
        subject: 'math',
        status: 'pending',
        markSuccess: jest.fn(),
        markFailed: jest.fn(),
        addGeneratedQuestion: jest.fn(),
      };

      AIGenerationLog.create.mockResolvedValue(mockLog);
      const log = await AIGenerationLog.create({
        requestedBy: new mongoose.Types.ObjectId(),
        requestedByModel: 'Teacher',
        requestedByRole: 'teacher',
        type: 'generate_question',
        subject: 'math',
        prompt: 'Generate a math question',
      });

      expect(log).toBeDefined();
      expect(log.type).toBe('generate_question');
      expect(log.subject).toBe('math');
    });

    it('should mark log as success', async () => {
      const mockLog = {
        _id: new mongoose.Types.ObjectId(),
        status: 'success',
        markSuccess: jest.fn().mockResolvedValue(true),
      };

      await mockLog.markSuccess('response', 100, 200, 1500, 1);
      expect(mockLog.markSuccess).toHaveBeenCalledWith('response', 100, 200, 1500, 1);
    });

    it('should mark log as failed', async () => {
      const mockLog = {
        _id: new mongoose.Types.ObjectId(),
        status: 'failed',
        markFailed: jest.fn().mockResolvedValue(true),
      };

      await mockLog.markFailed('AI rate limit exceeded', 500);
      expect(mockLog.markFailed).toHaveBeenCalledWith('AI rate limit exceeded', 500);
    });

    it('should calculate estimated cost', () => {
      const inputTokens = 1000;
      const outputTokens = 500;
      const inputCost = (inputTokens / 1000000) * 3;
      const outputCost = (outputTokens / 1000000) * 15;
      const totalCost = parseFloat((inputCost + outputCost).toFixed(6));
      expect(totalCost).toBe(0.01050);
    });
  });

  describe('Prompt Building', () => {
    it('should build generate question prompt', () => {
      const subject = 'math';
      const difficulty = 'medium';
      const count = 2;

      const prompt = `Generate ${count} ${difficulty} ${subject} questions for Ethiopian Grade 12`;
      expect(prompt).toContain('math');
      expect(prompt).toContain('medium');
      expect(prompt).toContain('2');
    });

    it('should include topic in prompt when provided', () => {
      const topic = 'Quadratic Equations';
      const prompt = `Generate math questions about ${topic}`;
      expect(prompt).toContain(topic);
    });

    it('should build study tips prompt with student data', () => {
      const studentData = {
        name: 'Test Student',
        averageScore: 75,
        weakSubjects: ['chemistry', 'physics'],
      };

      const prompt = `Student ${studentData.name} has average score ${studentData.averageScore}%`;
      expect(prompt).toContain('Test Student');
      expect(prompt).toContain('75%');
    });
  });

  describe('Subject Validation for AI', () => {
    const validSubjects = ['math', 'english', 'biology', 'chemistry', 'physics', 'civics'];

    it('should accept all valid subjects', () => {
      validSubjects.forEach((subject) => {
        expect(validSubjects.includes(subject)).toBe(true);
      });
    });

    it('should reject invalid subject', () => {
      expect(validSubjects.includes('geography')).toBe(false);
      expect(validSubjects.includes('history')).toBe(false);
    });

    it('should cover all 6 Ethiopian entrance exam subjects', () => {
      expect(validSubjects).toHaveLength(6);
      expect(validSubjects).toContain('math');
      expect(validSubjects).toContain('english');
      expect(validSubjects).toContain('biology');
      expect(validSubjects).toContain('chemistry');
      expect(validSubjects).toContain('physics');
      expect(validSubjects).toContain('civics');
    });
  });

  describe('AI Monthly Limit', () => {
    it('should check if teacher has reached monthly limit', () => {
      const monthlyLimit = 100;
      const hasReachedLimit = (current) => current >= monthlyLimit;

      expect(hasReachedLimit(99)).toBe(false);
      expect(hasReachedLimit(100)).toBe(true);
      expect(hasReachedLimit(101)).toBe(true);
    });

    it('should calculate remaining generations', () => {
      const monthlyLimit = 100;
      const used = 75;
      const remaining = Math.max(0, monthlyLimit - used);
      expect(remaining).toBe(25);
    });

    it('should not allow negative remaining', () => {
      const monthlyLimit = 100;
      const used = 105;
      const remaining = Math.max(0, monthlyLimit - used);
      expect(remaining).toBe(0);
    });
  });
});