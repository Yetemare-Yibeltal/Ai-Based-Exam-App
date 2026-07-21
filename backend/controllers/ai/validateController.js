const { catchAsync } = require('../../middleware/errorHandler');
const { successResponse, errorResponse } = require('../../utils/apiResponse');
const { validateQuestion, batchValidateQuestions } = require('../../services/ai/validateQuestion.service');
const Question = require('../../models/Question');
const AIGenerationLog = require('../../models/AIGenerationLog');
const logger = require('../../utils/logger');

exports.validateQuestion = catchAsync(async (req, res) => {
  const { questionText, options, correctAnswer, subject, explanation } = req.body;
  if (!questionText || !options || correctAnswer === undefined || !subject) {
    return errorResponse(res, 'questionText, options, correctAnswer and subject are required', 400);
  }
  if (!Array.isArray(options) || options.length !== 4) {
    return errorResponse(res, 'Options must be an array of exactly 4 items', 400);
  }
  const result = await validateQuestion({ questionText, options, correctAnswer, subject, explanation });
  logger.logAI('ValidateQuestion', { userId: req.userId, subject, isValid: result.isValid });
  return successResponse(res, 'Question validation completed', result);
});

exports.validateQuestionById = catchAsync(async (req, res) => {
  const question = await Question.findOne({ _id: req.params.id, createdBy: req.userId });
  if (!question) return errorResponse(res, 'Question not found or you do not have permission', 404);
  const result = await validateQuestion({
    questionText: question.questionText,
    options: question.options,
    correctAnswer: question.correctAnswer,
    subject: question.subject,
    explanation: question.explanation,
  });
  if (result.isValid && result.qualityScore >= 70) {
    question.tags = question.tags || [];
    if (!question.tags.includes('ai_validated')) {
      question.tags.push('ai_validated');
      await question.save({ validateBeforeSave: false });
    }
  }
  return successResponse(res, 'Question validation completed', { questionId: question._id, subject: question.subject, ...result });
});

exports.batchValidateQuestions = catchAsync(async (req, res) => {
  const { questions } = req.body;
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return errorResponse(res, 'Questions array is required', 400);
  }
  if (questions.length > 10) {
    return errorResponse(res, 'Cannot validate more than 10 questions at once', 400);
  }
  const result = await batchValidateQuestions(questions);
  logger.logAI('BatchValidateQuestions', { userId: req.userId, total: result.summary.total });
  return successResponse(res, 'Batch validation completed', result);
});

exports.validateTeacherQuestions = catchAsync(async (req, res) => {
  const { status = 'draft' } = req.query;
  const limit = Math.min(parseInt(req.query.limit) || 5, 10);
  const questions = await Question.find({ createdBy: req.userId, status })
    .limit(limit)
    .select('questionText options correctAnswer subject explanation');
  if (questions.length === 0) {
    return successResponse(res, 'No questions found to validate', { results: [], summary: { total: 0, valid: 0, invalid: 0 } });
  }
  const result = await batchValidateQuestions(questions.map((q) => ({
    id: q._id, questionText: q.questionText, options: q.options,
    correctAnswer: q.correctAnswer, subject: q.subject, explanation: q.explanation,
  })));
  return successResponse(res, 'Teacher questions validated successfully', result);
});

exports.getValidationHistory = catchAsync(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 50);
  const logs = await AIGenerationLog.find({ requestedBy: req.userId, type: 'validate_question' })
    .sort({ createdAt: -1 })
    .limit(limit)
    .select('subject status responseTimeMs createdAt');
  return successResponse(res, 'Validation history retrieved successfully', { logs });
});
