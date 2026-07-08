const Score = require("../../models/Score");
const User = require("../../models/User");
const { catchAsync } = require("../../middleware/errorHandler");
const { successResponse, errorResponse } = require("../../utils/apiResponse");
const { generateWithAI } = require("../../config/anthropic");
const logger = require("../../utils/logger");

exports.getStudyTips = catchAsync(async (req, res) => {
  const user = await User.findById(req.user._id).select(
    "name grade weakSubjects favoriteSubject totalQuizzesTaken averageScore studyStreak",
  );

  const subjectStats = await Score.getUserSubjectStats(req.user._id);

  const prompt = `
You are an expert educational counselor for Ethiopian Grade 12 university entrance exam preparation.

Student Profile:
- Name: ${user.name}
- Grade: ${user.grade}
- Total Quizzes Taken: ${user.totalQuizzesTaken}
- Average Score: ${user.averageScore}%
- Study Streak: ${user.studyStreak} days
- Weak Subjects: ${user.weakSubjects?.join(", ") || "none identified yet"}
- Best Subject: ${user.favoriteSubject || "none identified yet"}

Subject Performance:
${subjectStats.map((s) => `- ${s._id}: avg ${s.avgScore}% (${s.totalAttempts} attempts)`).join("\n")}

Provide 5 personalized, actionable study tips for this student. Focus on Ethiopian curriculum.

Respond ONLY in this JSON format with no extra text:
{
  "tips": [
    {
      "title": "tip title",
      "description": "detailed tip description",
      "category": "time_management/subject_focus/exam_strategy/motivation/resources",
      "priority": "high/medium/low"
    }
  ],
  "motivationalMessage": "short encouraging message for the student"
}
`;

  const aiResult = await generateWithAI(prompt, { max_tokens: 800 });

  if (!aiResult.success) {
    return errorResponse(
      res,
      "Failed to generate study tips. Please try again",
      500,
    );
  }

  try {
    const clean = aiResult.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);

    return successResponse(res, "Study tips generated successfully", {
      tips: parsed.tips,
      motivationalMessage: parsed.motivationalMessage,
      generatedFor: {
        name: user.name,
        grade: user.grade,
        averageScore: user.averageScore,
      },
    });
  } catch (err) {
    logger.error(`Failed to parse AI study tips: ${err.message}`);
    return errorResponse(
      res,
      "Failed to process study tips. Please try again",
      500,
    );
  }
});

exports.getSubjectStudyTips = catchAsync(async (req, res) => {
  const { subject } = req.params;
  const validSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];

  if (!validSubjects.includes(subject.toLowerCase())) {
    return errorResponse(
      res,
      `Invalid subject. Must be one of: ${validSubjects.join(", ")}`,
      400,
    );
  }

  const user = await User.findById(req.user._id).select(
    "name grade averageScore",
  );
  const subjectStats = await Score.getUserSubjectStats(req.user._id);
  const subjectStat = subjectStats.find((s) => s._id === subject.toLowerCase());

  const prompt = `
You are an expert teacher for Ethiopian Grade 12 ${subject} university entrance exam preparation.

Student Performance in ${subject}:
- Average Score: ${subjectStat?.avgScore || 0}%
- Total Attempts: ${subjectStat?.totalAttempts || 0}
- Best Score: ${subjectStat?.bestScore || 0}%
- Pass Rate: ${subjectStat?.passRate || 0}%
- Student Grade: ${user.grade}

Provide 6 specific, actionable study tips for ${subject} based on the Ethiopian curriculum.

Respond ONLY in this JSON format:
{
  "subject": "${subject}",
  "tips": [
    {
      "title": "tip title",
      "description": "detailed actionable description",
      "timeRequired": "15 mins/30 mins/1 hour",
      "difficulty": "easy/medium/hard"
    }
  ],
  "keyTopics": ["topic1", "topic2", "topic3"],
  "recommendedResources": ["resource1", "resource2"],
  "weeklyStudyPlan": "brief weekly plan for this subject"
}
`;

  const aiResult = await generateWithAI(prompt, { max_tokens: 900 });

  if (!aiResult.success) {
    return errorResponse(
      res,
      "Failed to generate subject tips. Please try again",
      500,
    );
  }

  try {
    const clean = aiResult.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);

    return successResponse(
      res,
      `${subject} study tips generated successfully`,
      {
        subject,
        currentPerformance: {
          avgScore: subjectStat?.avgScore || 0,
          totalAttempts: subjectStat?.totalAttempts || 0,
          bestScore: subjectStat?.bestScore || 0,
          passRate: subjectStat?.passRate || 0,
        },
        tips: parsed.tips,
        keyTopics: parsed.keyTopics,
        recommendedResources: parsed.recommendedResources,
        weeklyStudyPlan: parsed.weeklyStudyPlan,
      },
    );
  } catch (err) {
    logger.error(`Failed to parse subject tips: ${err.message}`);
    return errorResponse(
      res,
      "Failed to process subject tips. Please try again",
      500,
    );
  }
});

exports.getPersonalizedPlan = catchAsync(async (req, res) => {
  const { daysUntilExam = 90 } = req.query;

  const user = await User.findById(req.user._id).select(
    "name grade weakSubjects favoriteSubject totalQuizzesTaken averageScore studyStreak",
  );

  const subjectStats = await Score.getUserSubjectStats(req.user._id);

  const prompt = `
You are an expert study planner for Ethiopian Grade 12 university entrance exam preparation.

Student Profile:
- Name: ${user.name}
- Grade: ${user.grade}
- Days Until Exam: ${daysUntilExam}
- Current Average Score: ${user.averageScore}%
- Study Streak: ${user.studyStreak} days
- Weak Subjects: ${user.weakSubjects?.join(", ") || "none"}

Subject Performance:
${subjectStats.map((s) => `- ${s._id}: ${s.avgScore}% average (${s.totalAttempts} attempts)`).join("\n")}

Subjects not yet practiced: ${
    ["math", "english", "biology", "chemistry", "physics", "civics"]
      .filter((s) => !subjectStats.find((stat) => stat._id === s))
      .join(", ") || "none"
  }

Create a personalized ${daysUntilExam}-day study plan. Be specific and realistic.

Respond ONLY in this JSON format:
{
  "planTitle": "study plan title",
  "overview": "2-3 sentence overview",
  "weeklySchedule": [
    {
      "week": 1,
      "focus": "main focus area",
      "dailyHours": 2,
      "subjects": ["subject1", "subject2"],
      "goals": ["goal1", "goal2"]
    }
  ],
  "dailyRoutine": {
    "morning": "morning study routine",
    "afternoon": "afternoon study routine",
    "evening": "evening study routine"
  },
  "milestones": [
    {
      "day": 30,
      "target": "milestone target",
      "checkPoint": "how to measure"
    }
  ],
  "priorityOrder": ["subject1", "subject2", "subject3", "subject4", "subject5", "subject6"],
  "examWeekTips": ["tip1", "tip2", "tip3"]
}
`;

  const aiResult = await generateWithAI(prompt, { max_tokens: 1200 });

  if (!aiResult.success) {
    return errorResponse(
      res,
      "Failed to generate study plan. Please try again",
      500,
    );
  }

  try {
    const clean = aiResult.content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    const parsed = JSON.parse(clean);

    return successResponse(
      res,
      "Personalized study plan generated successfully",
      {
        daysUntilExam: parseInt(daysUntilExam),
        studentProfile: {
          name: user.name,
          grade: user.grade,
          currentAvgScore: user.averageScore,
          studyStreak: user.studyStreak,
        },
        plan: parsed,
      },
    );
  } catch (err) {
    logger.error(`Failed to parse personalized plan: ${err.message}`);
    return errorResponse(
      res,
      "Failed to process study plan. Please try again",
      500,
    );
  }
});

exports.getExamTips = catchAsync(async (req, res) => {
  const examTips = {
    before: [
      {
        title: "Review Past Papers",
        description:
          "Practice with at least 5 years of past Ethiopian entrance exam papers. Focus on understanding question patterns and timing.",
        priority: "high",
      },
      {
        title: "Create Summary Notes",
        description:
          "Condense each subject into key formulas, definitions, and concepts. Review these summaries daily in the final week.",
        priority: "high",
      },
      {
        title: "Sleep Well",
        description:
          "Get at least 8 hours of sleep every night in the week before your exam. Sleep helps consolidate memory.",
        priority: "high",
      },
      {
        title: "Stay Hydrated and Eat Well",
        description:
          "Drink plenty of water and eat nutritious meals. Avoid heavy meals right before studying.",
        priority: "medium",
      },
      {
        title: "Practice Time Management",
        description:
          "Time yourself while practicing. The entrance exam has strict time limits. Aim to finish with 10 minutes to review.",
        priority: "high",
      },
    ],
    during: [
      {
        title: "Read Questions Carefully",
        description:
          "Read each question twice before answering. Many students lose marks by misreading questions.",
        priority: "high",
      },
      {
        title: "Start with Easy Questions",
        description:
          "Quickly go through the paper and answer questions you know well first. Come back to difficult ones later.",
        priority: "high",
      },
      {
        title: "Eliminate Wrong Answers",
        description:
          "For multiple choice, eliminate obviously wrong options first. This increases your chance of getting the right answer.",
        priority: "medium",
      },
      {
        title: "Manage Your Time",
        description:
          "Allocate time per question and stick to it. Do not spend too long on any single question.",
        priority: "high",
      },
      {
        title: "Review Before Submitting",
        description:
          "If time allows, review all your answers before submitting. Check for careless mistakes.",
        priority: "medium",
      },
    ],
    subjectSpecific: {
      math: "Show all working steps. Even if your final answer is wrong, you may get partial marks for correct steps.",
      english:
        "Read comprehension passages carefully before answering. Look for key words in questions.",
      biology:
        "Draw diagrams where possible. Label all parts clearly. Diagrams often earn extra marks.",
      chemistry: "Balance all chemical equations. Check units in calculations.",
      physics:
        "Always write formulas before substituting values. Include correct units in answers.",
      civics:
        "Use specific examples from Ethiopian history and government structure in your answers.",
    },
  };

  return successResponse(res, "Exam tips retrieved successfully", { examTips });
});

exports.getTimeManagementTips = catchAsync(async (req, res) => {
  const tips = {
    dailySchedule: {
      recommendation:
        "4-6 hours of focused study per day is optimal for exam preparation",
      sample: [
        {
          time: "6:00 AM - 7:00 AM",
          activity: "Morning review — go over yesterday's notes",
        },
        {
          time: "7:00 AM - 9:00 AM",
          activity: "Deep study session — hardest subject first",
        },
        {
          time: "9:00 AM - 9:15 AM",
          activity: "Short break — stretch and hydrate",
        },
        {
          time: "9:15 AM - 11:00 AM",
          activity: "Practice questions and past papers",
        },
        {
          time: "11:00 AM - 12:00 PM",
          activity: "Second subject study session",
        },
        { time: "12:00 PM - 1:00 PM", activity: "Lunch and rest" },
        {
          time: "1:00 PM - 3:00 PM",
          activity: "Afternoon study — medium difficulty subject",
        },
        { time: "3:00 PM - 3:15 PM", activity: "Break" },
        {
          time: "3:15 PM - 5:00 PM",
          activity: "HEROY practice quizzes and review",
        },
        { time: "5:00 PM - 6:00 PM", activity: "Evening walk and relaxation" },
        {
          time: "7:00 PM - 8:30 PM",
          activity: "Light review and summary notes",
        },
        {
          time: "8:30 PM",
          activity: "Stop studying — rest your brain for tomorrow",
        },
      ],
    },
    weeklyPlan: {
      monday: "Mathematics — focus on problem solving",
      tuesday: "English — reading comprehension and grammar",
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
          "Study for 25 minutes, take a 5-minute break, repeat 4 times, then take a 30-minute break.",
        benefit: "Maintains focus and prevents mental fatigue",
      },
      {
        name: "Spaced Repetition",
        description:
          "Review material after 1 day, 3 days, 1 week, 2 weeks, and 1 month.",
        benefit: "Significantly improves long-term memory retention",
      },
      {
        name: "Active Recall",
        description:
          "Instead of re-reading notes, close the book and try to recall what you studied.",
        benefit: "Far more effective than passive reading for exam preparation",
      },
      {
        name: "Mind Mapping",
        description:
          "Create visual maps connecting concepts together for each subject.",
        benefit:
          "Helps see connections between topics and improves understanding",
      },
    ],
    productivityTips: [
      "Put your phone on silent or use a study app to block distractions",
      "Study in a quiet, well-lit environment",
      "Keep water and healthy snacks nearby",
      "Set specific goals for each study session before you start",
      "Reward yourself after completing study goals",
      "Study with a friend once a week to test each other",
      "Get enough sleep — memory consolidation happens during sleep",
    ],
  };

  return successResponse(res, "Time management tips retrieved successfully", {
    tips,
  });
});
