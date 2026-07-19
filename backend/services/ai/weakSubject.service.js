const { generateWithAI } = require("../../config/anthropic");
const { buildExplainAnswerPrompt } = require("./prompt.builder");
const Question = require("../../models/Question");
const logger = require("../../utils/logger");

const explainAnswer = async ({
  questionId,
  selectedAnswer,
  correctAnswer,
  questionText,
  options,
  subject,
  studentGrade = "Grade 12",
}) => {
  const prompt = buildExplainAnswerPrompt({
    questionText,
    options,
    selectedAnswer: parseInt(selectedAnswer),
    correctAnswer: parseInt(correctAnswer),
    subject,
    studentGrade,
  });

  const startTime = Date.now();

  try {
    const aiResult = await generateWithAI(prompt, { max_tokens: 1000 });
    const responseTime = Date.now() - startTime;

    if (!aiResult.success)
      throw new Error("Failed to generate explanation. Please try again");

    const clean = aiResult.content
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(clean);

    logger.logAI("ExplainAnswer", { questionId, subject, responseTime });

    return {
      questionId,
      isCorrect: parsed.isCorrect,
      selectedAnswer: parseInt(selectedAnswer),
      correctAnswer: parseInt(correctAnswer),
      mainExplanation: parsed.mainExplanation || "",
      whyStudentWasWrong: parsed.whyStudentWasWrong || null,
      whyOthersAreWrong: parsed.whyOthersAreWrong || {},
      keyConceptToRemember: parsed.keyConceptToRemember || "",
      memoryTrick: parsed.memoryTrick || "",
      relatedTopics: parsed.relatedTopics || [],
      encouragement: parsed.encouragement || "",
      responseTimeMs: responseTime,
    };
  } catch (error) {
    logger.error(`Explain answer failed: ${error.message}`);
    throw new Error(`Failed to explain answer: ${error.message}`);
  }
};

const explainAnswerByQuestionId = async (
  questionId,
  selectedAnswer,
  studentGrade = "Grade 12",
) => {
  const question = await Question.findById(questionId).select(
    "questionText options correctAnswer subject explanation",
  );

  if (!question) throw new Error("Question not found");

  if (question.explanation && question.explanation.length > 50) {
    const isCorrect = question.correctAnswer === parseInt(selectedAnswer);

    return {
      questionId,
      isCorrect,
      selectedAnswer: parseInt(selectedAnswer),
      correctAnswer: question.correctAnswer,
      mainExplanation: question.explanation,
      whyStudentWasWrong: !isCorrect
        ? `The correct answer is option ${["A", "B", "C", "D"][question.correctAnswer]}. ${question.explanation}`
        : null,
      whyOthersAreWrong: {},
      keyConceptToRemember: question.explanation.slice(0, 100),
      memoryTrick: null,
      relatedTopics: [],
      encouragement: isCorrect
        ? "Great job! You got it right!"
        : "Don't worry, review this concept and try again!",
      fromDatabase: true,
    };
  }

  return explainAnswer({
    questionId,
    selectedAnswer,
    correctAnswer: question.correctAnswer,
    questionText: question.questionText,
    options: question.options,
    subject: question.subject,
    studentGrade,
  });
};

const batchExplainAnswers = async (answers, studentGrade = "Grade 12") => {
  const results = [];

  for (const answer of answers) {
    try {
      const explanation = await explainAnswerByQuestionId(
        answer.questionId,
        answer.selectedAnswer,
        studentGrade,
      );
      results.push({ ...explanation, error: null });
    } catch (error) {
      results.push({
        questionId: answer.questionId,
        error: error.message,
        isCorrect: null,
      });
    }
  }

  return results;
};

module.exports = {
  explainAnswer,
  explainAnswerByQuestionId,
  batchExplainAnswers,
};
