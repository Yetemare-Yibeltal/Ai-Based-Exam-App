const { generateWithAI } = require("../../config/anthropic");
const { buildValidateQuestionPrompt } = require("./prompt.builder");
const logger = require("../../utils/logger");

const validateQuestion = async ({
  questionText,
  options,
  correctAnswer,
  subject,
  explanation = null,
}) => {
  const prompt = buildValidateQuestionPrompt({
    questionText,
    options,
    correctAnswer,
    subject,
    explanation,
  });

  const startTime = Date.now();

  try {
    const aiResult = await generateWithAI(prompt, { max_tokens: 1000 });
    const responseTime = Date.now() - startTime;

    if (!aiResult.success) {
      throw new Error("AI validation failed. Please try again");
    }

    const clean = aiResult.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    logger.logAI("ValidateQuestion", {
      subject,
      isValid: parsed.isValid,
      qualityScore: parsed.qualityScore,
      responseTime,
    });

    return {
      isValid: parsed.isValid,
      isCorrectAnswerRight: parsed.isCorrectAnswerRight,
      issues: parsed.issues || [],
      suggestions: parsed.suggestions || [],
      qualityScore: parsed.qualityScore || 0,
      curriculumAlignment: parsed.curriculumAlignment || "unknown",
      feedback: parsed.feedback || "",
      correctedAnswer: parsed.correctedAnswer,
      improvedExplanation: parsed.improvedExplanation || null,
      responseTimeMs: responseTime,
    };
  } catch (error) {
    logger.error(`Question validation failed: ${error.message}`);
    throw new Error(`Validation failed: ${error.message}`);
  }
};

const batchValidateQuestions = async (questions) => {
  const results = [];

  for (const question of questions) {
    try {
      const result = await validateQuestion(question);
      results.push({
        questionId: question.id || null,
        questionText: question.questionText?.slice(0, 50) + "...",
        ...result,
      });
    } catch (error) {
      results.push({
        questionId: question.id || null,
        questionText: question.questionText?.slice(0, 50) + "...",
        isValid: false,
        error: error.message,
      });
    }
  }

  const validCount = results.filter((r) => r.isValid).length;
  const avgQualityScore =
    results.reduce((sum, r) => sum + (r.qualityScore || 0), 0) / results.length;

  return {
    results,
    summary: {
      total: results.length,
      valid: validCount,
      invalid: results.length - validCount,
      avgQualityScore: Math.round(avgQualityScore),
      validationRate: Math.round((validCount / results.length) * 100),
    },
  };
};

module.exports = { validateQuestion, batchValidateQuestions };
