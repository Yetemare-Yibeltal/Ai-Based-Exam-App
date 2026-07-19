const { generateWithAI } = require("../../config/anthropic");
const { buildGenerateQuestionsPrompt } = require("./prompt.builder");
const Question = require("../../models/Question");
const AIGenerationLog = require("../../models/AIGenerationLog");
const Teacher = require("../../models/Teacher");
const { sanitizeQuestionText } = require("../../utils/sanitize");
const logger = require("../../utils/logger");

const validateGeneratedQuestion = (q) => {
  if (!q.questionText || typeof q.questionText !== "string") return false;
  if (q.questionText.trim().length < 10) return false;
  if (!Array.isArray(q.options) || q.options.length !== 4) return false;
  if (
    q.options.some((o) => !o || typeof o !== "string" || o.trim().length === 0)
  )
    return false;
  if (typeof q.correctAnswer !== "number") return false;
  if (q.correctAnswer < 0 || q.correctAnswer > 3) return false;
  return true;
};

const parseAIResponse = (content) => {
  try {
    const clean = content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .replace(/^\s*[\r\n]/gm, "")
      .trim();

    const parsed = JSON.parse(clean);

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      throw new Error("Invalid response format: missing questions array");
    }

    return parsed.questions;
  } catch (error) {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.questions && Array.isArray(parsed.questions)) {
          return parsed.questions;
        }
      } catch (e) {
        throw new Error(`Failed to parse AI response: ${error.message}`);
      }
    }
    throw new Error(`Failed to parse AI response: ${error.message}`);
  }
};

const generateQuestions = async ({
  subject,
  difficulty = "medium",
  count = 1,
  topic = null,
  grade = "Grade 12",
  additionalInstructions = null,
  requestedById,
  requestedByModel = "Teacher",
  requestedByRole = "teacher",
  ipAddress = null,
  userAgent = null,
}) => {
  const questionCount = Math.min(Math.max(parseInt(count) || 1, 1), 5);

  if (requestedByModel === "Teacher") {
    const teacher = await Teacher.findById(requestedById);
    if (!teacher) throw new Error("Teacher not found");
    if (teacher.hasReachedAILimit(100)) {
      throw new Error(
        "Monthly AI generation limit reached. Limit resets next month.",
      );
    }
  }

  const prompt = buildGenerateQuestionsPrompt({
    subject,
    difficulty,
    count: questionCount,
    topic,
    grade,
    additionalInstructions,
  });

  const aiLog = await AIGenerationLog.create({
    requestedBy: requestedById,
    requestedByModel,
    requestedByRole,
    type: "generate_question",
    subject,
    difficulty,
    grade,
    topic,
    questionsRequested: questionCount,
    prompt,
    ipAddress,
    userAgent,
  });

  const startTime = Date.now();

  try {
    const aiResult = await generateWithAI(prompt, { max_tokens: 2000 });
    const responseTime = Date.now() - startTime;

    if (!aiResult.success) {
      await aiLog.markFailed(
        aiResult.error || "AI generation failed",
        responseTime,
      );
      throw new Error("AI generation failed. Please try again");
    }

    const rawQuestions = parseAIResponse(aiResult.content);
    const savedQuestions = [];
    const skippedQuestions = [];

    for (const q of rawQuestions) {
      if (!validateGeneratedQuestion(q)) {
        skippedQuestions.push({ reason: "Invalid format", question: q });
        continue;
      }

      try {
        const question = await Question.create({
          questionText: sanitizeQuestionText(q.questionText.trim()),
          options: q.options.map((o) => o.trim()),
          correctAnswer: parseInt(q.correctAnswer),
          subject: subject.toLowerCase(),
          difficulty: q.difficulty || difficulty,
          explanation: q.explanation?.trim() || "",
          grade: grade || "Grade 12",
          topic: q.topic || topic || null,
          createdBy: requestedById,
          createdByModel: requestedByModel,
          status: "draft",
          isAIGenerated: true,
          aiModel: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-6",
        });

        savedQuestions.push(question);
        await aiLog.addGeneratedQuestion(question._id);
      } catch (saveError) {
        logger.error(`Failed to save AI question: ${saveError.message}`);
        skippedQuestions.push({ reason: saveError.message, question: q });
      }
    }

    await aiLog.markSuccess(
      aiResult.content,
      aiResult.usage?.input_tokens || 0,
      aiResult.usage?.output_tokens || 0,
      responseTime,
      savedQuestions.length,
    );

    if (requestedByModel === "Teacher") {
      await Teacher.findByIdAndUpdate(requestedById, {
        $inc: {
          totalAIGenerations: 1,
          aiGenerationsThisMonth: 1,
          totalQuestionsCreated: savedQuestions.length,
        },
      });
    }

    logger.logAI("GenerateQuestions", {
      requestedById,
      subject,
      requested: questionCount,
      generated: savedQuestions.length,
      skipped: skippedQuestions.length,
      responseTime,
    });

    const teacher =
      requestedByModel === "Teacher"
        ? await Teacher.findById(requestedById).select("aiGenerationsThisMonth")
        : null;

    return {
      questions: savedQuestions.map((q) => q.getFullQuestion()),
      generationStats: {
        requested: questionCount,
        generated: savedQuestions.length,
        skipped: skippedQuestions.length,
        responseTimeMs: responseTime,
      },
      aiUsage: {
        inputTokens: aiResult.usage?.input_tokens || 0,
        outputTokens: aiResult.usage?.output_tokens || 0,
        totalTokens:
          (aiResult.usage?.input_tokens || 0) +
          (aiResult.usage?.output_tokens || 0),
        estimatedCost: aiLog.estimatedCost,
        generationsThisMonth: teacher?.aiGenerationsThisMonth || 0,
        monthlyLimit: 100,
        remaining: teacher
          ? Math.max(0, 100 - teacher.aiGenerationsThisMonth)
          : null,
      },
      logId: aiLog._id,
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;
    await aiLog.markFailed(error.message, responseTime);
    throw error;
  }
};

const bulkGenerateQuestions = async ({
  subjects,
  difficulty = "medium",
  countPerSubject = 2,
  grade = "Grade 12",
  requestedById,
  requestedByModel = "Admin",
  requestedByRole = "admin",
}) => {
  const results = [];
  const errors = [];

  for (const subject of subjects) {
    try {
      const result = await generateQuestions({
        subject,
        difficulty,
        count: countPerSubject,
        grade,
        requestedById,
        requestedByModel,
        requestedByRole,
      });
      results.push({ subject, ...result });
    } catch (error) {
      logger.error(`Bulk generation failed for ${subject}: ${error.message}`);
      errors.push({ subject, error: error.message });
    }
  }

  return {
    results,
    errors,
    totalGenerated: results.reduce(
      (sum, r) => sum + r.generationStats.generated,
      0,
    ),
  };
};

module.exports = {
  generateQuestions,
  bulkGenerateQuestions,
  validateGeneratedQuestion,
  parseAIResponse,
};

