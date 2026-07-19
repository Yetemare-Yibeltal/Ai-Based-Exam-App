const { generateWithAI } = require("../../config/anthropic");
const {
  buildStudyTipsPrompt,
  buildPersonalizedPlanPrompt,
} = require("./prompt.builder");
const Score = require("../../models/Score");
const User = require("../../models/User");
const logger = require("../../utils/logger");

const parseAIResponse = (content) => {
  const clean = content
    .replace(/```json\n?/g, "")
    .replace(/```\n?/g, "")
    .trim();
  return JSON.parse(clean);
};

const generateStudyTips = async (userId) => {
  const user = await User.findById(userId).select(
    "name grade weakSubjects favoriteSubject totalQuizzesTaken averageScore studyStreak",
  );

  if (!user) throw new Error("User not found");

  const subjectStats = await Score.getUserSubjectStats(userId);

  const prompt = buildStudyTipsPrompt({
    studentName: user.name,
    grade: user.grade,
    averageScore: user.averageScore,
    studyStreak: user.studyStreak,
    weakSubjects: user.weakSubjects,
    favoriteSubject: user.favoriteSubject,
    subjectStats,
  });

  const startTime = Date.now();
  const aiResult = await generateWithAI(prompt, { max_tokens: 1000 });
  const responseTime = Date.now() - startTime;

  if (!aiResult.success)
    throw new Error("Failed to generate study tips. Please try again");

  try {
    const parsed = parseAIResponse(aiResult.content);

    logger.logAI("GenerateStudyTips", { userId, responseTime });

    return {
      tips: parsed.tips || [],
      motivationalMessage: parsed.motivationalMessage || "",
      weeklyGoal: parsed.weeklyGoal || "",
      prioritySubject: parsed.prioritySubject || null,
      generatedFor: {
        name: user.name,
        grade: user.grade,
        averageScore: user.averageScore,
      },
    };
  } catch (parseError) {
    logger.error(`Failed to parse study tips: ${parseError.message}`);
    throw new Error("Failed to process study tips. Please try again");
  }
};

const generateSubjectStudyTips = async (userId, subject) => {
  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];
  if (!validSubjects.includes(subject.toLowerCase())) {
    throw new Error(
      `Invalid subject. Must be one of: ${validSubjects.join(", ")}`,
    );
  }

  const user = await User.findById(userId).select("name grade averageScore");
  const subjectStats = await Score.getUserSubjectStats(userId);
  const subjectStat = subjectStats.find((s) => s._id === subject.toLowerCase());

  const prompt = `You are an expert teacher for Ethiopian Grade 12 ${subject} university entrance exam preparation.

Student: ${user?.name || "Student"}
Grade: ${user?.grade || "Grade 12"}

${subject.toUpperCase()} Performance:
- Average Score: ${subjectStat?.avgScore || 0}%
- Total Attempts: ${subjectStat?.totalAttempts || 0}
- Best Score: ${subjectStat?.bestScore || 0}%
- Pass Rate: ${subjectStat?.passRate || 0}%

Provide 6 specific study tips for ${subject} based on Ethiopian curriculum.

Respond ONLY with this exact JSON:
{
  "tips": [
    {
      "title": "tip title",
      "description": "detailed actionable description",
      "timeRequired": "30 mins",
      "difficulty": "easy/medium/hard"
    }
  ],
  "keyTopics": ["topic1", "topic2", "topic3", "topic4", "topic5"],
  "recommendedResources": ["resource1", "resource2", "resource3"],
  "weeklyStudyPlan": "Brief specific weekly plan for this subject"
}`;

  const aiResult = await generateWithAI(prompt, { max_tokens: 1000 });
  if (!aiResult.success)
    throw new Error("Failed to generate subject tips. Please try again");

  try {
    const parsed = parseAIResponse(aiResult.content);

    return {
      subject,
      currentPerformance: {
        avgScore: subjectStat?.avgScore || 0,
        totalAttempts: subjectStat?.totalAttempts || 0,
        bestScore: subjectStat?.bestScore || 0,
        passRate: subjectStat?.passRate || 0,
      },
      tips: parsed.tips || [],
      keyTopics: parsed.keyTopics || [],
      recommendedResources: parsed.recommendedResources || [],
      weeklyStudyPlan: parsed.weeklyStudyPlan || "",
    };
  } catch (parseError) {
    throw new Error("Failed to process subject tips. Please try again");
  }
};

const generatePersonalizedPlan = async (userId, options = {}) => {
  const {
    daysUntilExam = 90,
    targetScore = 80,
    availableHoursPerDay = 4,
  } = options;

  const user = await User.findById(userId).select(
    "name grade weakSubjects favoriteSubject totalQuizzesTaken averageScore studyStreak",
  );

  if (!user) throw new Error("User not found");

  const subjectStats = await Score.getUserSubjectStats(userId);

  const prompt = buildPersonalizedPlanPrompt({
    studentName: user.name,
    grade: user.grade,
    currentAvgScore: user.averageScore,
    studyStreak: user.studyStreak,
    daysUntilExam,
    subjectStats,
    weakSubjects: user.weakSubjects,
    targetScore,
    availableHoursPerDay,
  });

  const aiResult = await generateWithAI(prompt, { max_tokens: 1500 });
  if (!aiResult.success)
    throw new Error("Failed to generate study plan. Please try again");

  try {
    const parsed = parseAIResponse(aiResult.content);

    logger.logAI("GeneratePersonalizedPlan", { userId, daysUntilExam });

    return {
      daysUntilExam,
      studentProfile: {
        name: user.name,
        grade: user.grade,
        currentAvgScore: user.averageScore,
        studyStreak: user.studyStreak,
        targetScore,
      },
      plan: parsed,
    };
  } catch (parseError) {
    throw new Error("Failed to process study plan. Please try again");
  }
};

const getStaticExamTips = () => ({
  before: [
    {
      title: "Review Past Papers",
      description:
        "Practice with at least 5 years of past Ethiopian entrance exam papers.",
      priority: "high",
    },
    {
      title: "Create Summary Notes",
      description:
        "Condense each subject into key formulas, definitions, and concepts.",
      priority: "high",
    },
    {
      title: "Sleep Well",
      description:
        "Get at least 8 hours of sleep every night in the week before your exam.",
      priority: "high",
    },
    {
      title: "Practice Time Management",
      description:
        "Time yourself while practicing. Aim to finish with 10 minutes to review.",
      priority: "high",
    },
    {
      title: "Stay Hydrated",
      description: "Drink plenty of water and eat nutritious meals.",
      priority: "medium",
    },
  ],
  during: [
    {
      title: "Read Questions Carefully",
      description: "Read each question twice before answering.",
      priority: "high",
    },
    {
      title: "Start with Easy Questions",
      description:
        "Answer questions you know first, return to difficult ones later.",
      priority: "high",
    },
    {
      title: "Eliminate Wrong Answers",
      description:
        "For multiple choice, eliminate obviously wrong options first.",
      priority: "medium",
    },
    {
      title: "Manage Your Time",
      description: "Allocate time per question and stick to it.",
      priority: "high",
    },
    {
      title: "Review Before Submitting",
      description: "If time allows, review all answers before submitting.",
      priority: "medium",
    },
  ],
  subjectSpecific: {
    math: "Show all working steps. Even if wrong, you may get partial marks.",
    english: "Read comprehension passages carefully. Look for key words.",
    biology: "Draw diagrams where possible and label all parts clearly.",
    chemistry: "Balance all chemical equations. Check units in calculations.",
    physics: "Always write formulas before substituting values.",
    civics: "Use specific examples from Ethiopian history and government.",
  },
});

const getTimeManagementTips = () => ({
  dailySchedule: {
    recommendation: "4-6 hours of focused study per day is optimal",
    sample: [
      {
        time: "6:00 AM - 7:00 AM",
        activity: "Morning review — go over yesterday notes",
      },
      {
        time: "7:00 AM - 9:00 AM",
        activity: "Deep study — hardest subject first",
      },
      {
        time: "9:15 AM - 11:00 AM",
        activity: "Practice questions and past papers",
      },
      { time: "11:00 AM - 12:00 PM", activity: "Second subject study session" },
      {
        time: "1:00 PM - 3:00 PM",
        activity: "Afternoon study — medium difficulty subject",
      },
      {
        time: "3:15 PM - 5:00 PM",
        activity: "HEROY practice quizzes and review",
      },
      { time: "7:00 PM - 8:30 PM", activity: "Light review and summary notes" },
    ],
  },
  weeklyPlan: {
    monday: "Mathematics — problem solving",
    tuesday: "English — reading and grammar",
    wednesday: "Biology — concepts and diagrams",
    thursday: "Chemistry — equations and calculations",
    friday: "Physics — formulas and problems",
    saturday: "Civics — history and government",
    sunday: "Full mixed practice test — all subjects",
  },
  techniques: [
    {
      name: "Pomodoro Technique",
      description:
        "Study 25 minutes, break 5 minutes, repeat 4 times, then 30-minute break.",
      benefit: "Maintains focus and prevents mental fatigue",
    },
    {
      name: "Spaced Repetition",
      description: "Review after 1 day, 3 days, 1 week, 2 weeks, 1 month.",
      benefit: "Significantly improves long-term memory retention",
    },
    {
      name: "Active Recall",
      description: "Close the book and try to recall what you studied.",
      benefit: "Far more effective than passive reading",
    },
    {
      name: "Mind Mapping",
      description: "Create visual maps connecting concepts together.",
      benefit: "Helps see connections between topics",
    },
  ],
  productivityTips: [
    "Put your phone on silent during study sessions",
    "Study in a quiet well-lit environment",
    "Set specific goals for each study session",
    "Reward yourself after completing study goals",
    "Get enough sleep — memory consolidates during sleep",
  ],
});

module.exports = {
  generateStudyTips,
  generateSubjectStudyTips,
  generatePersonalizedPlan,
  getStaticExamTips,
  getTimeManagementTips,
};
