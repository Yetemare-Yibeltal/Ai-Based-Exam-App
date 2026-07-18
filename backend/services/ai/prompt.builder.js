const SUBJECTS = {
  math: "Mathematics",
  english: "English",
  biology: "Biology",
  chemistry: "Chemistry",
  physics: "Physics",
  civics: "Civics and Ethics",
};

const DIFFICULTY_DESCRIPTIONS = {
  easy: "straightforward and tests basic knowledge and recall",
  medium: "requires understanding and application of concepts",
  hard: "requires analysis, synthesis and critical thinking",
};

const GRADE_CONTEXT = {
  "Grade 11": "Grade 11 Ethiopian secondary school curriculum",
  "Grade 12":
    "Grade 12 Ethiopian secondary school university entrance exam level",
  Both: "Ethiopian Grade 11 and 12 curriculum",
};

const buildGenerateQuestionsPrompt = ({
  subject,
  difficulty = "medium",
  count = 1,
  topic = null,
  grade = "Grade 12",
  additionalInstructions = null,
}) => {
  const subjectName = SUBJECTS[subject] || subject;
  const difficultyDesc = DIFFICULTY_DESCRIPTIONS[difficulty] || difficulty;
  const gradeContext = GRADE_CONTEXT[grade] || grade;
  const questionCount = Math.min(Math.max(parseInt(count) || 1, 1), 5);

  return `You are an expert ${subjectName} teacher creating questions for the Ethiopian university entrance exam.

Generate ${questionCount} high-quality multiple choice question(s) with these exact specifications:
- Subject: ${subjectName}
- Difficulty: ${difficulty} (${difficultyDesc})
- Level: ${gradeContext}
${topic ? `- Topic/Chapter: ${topic}` : ""}
${additionalInstructions ? `- Additional Instructions: ${additionalInstructions}` : ""}

STRICT REQUIREMENTS:
1. Questions must align exactly with the Ethiopian national curriculum
2. Each question must have EXACTLY 4 answer options
3. Only ONE option must be correct
4. Include a clear, educational explanation for the correct answer
5. Questions must be at the appropriate difficulty level
6. Use proper scientific notation, units, and terminology
7. Avoid culturally biased or inappropriate content
8. Questions should be similar in style to actual Ethiopian university entrance exams

Respond ONLY with this exact JSON format — no markdown, no extra text:
{
  "questions": [
    {
      "questionText": "Full question text here?",
      "options": ["Option A text", "Option B text", "Option C text", "Option D text"],
      "correctAnswer": 0,
      "explanation": "Detailed explanation of why this answer is correct and others are wrong",
      "topic": "Specific topic within ${subjectName}",
      "difficulty": "${difficulty}",
      "hints": ["hint1", "hint2"]
    }
  ]
}

NOTE: correctAnswer is the INDEX (0=A, 1=B, 2=C, 3=D) of the correct option.`;
};

const buildValidateQuestionPrompt = ({
  questionText,
  options,
  correctAnswer,
  subject,
  explanation = null,
}) => {
  const subjectName = SUBJECTS[subject] || subject;
  const correctOption = options[correctAnswer];

  return `You are an expert ${subjectName} teacher and exam quality controller for the Ethiopian university entrance exam.

Validate this multiple choice question for quality, accuracy and curriculum alignment:

QUESTION: ${questionText}

OPTIONS:
A) ${options[0]}
B) ${options[1]}
C) ${options[2]}
D) ${options[3]}

MARKED CORRECT ANSWER: ${["A", "B", "C", "D"][correctAnswer]}) ${correctOption}
${explanation ? `EXPLANATION PROVIDED: ${explanation}` : "NO EXPLANATION PROVIDED"}

Please evaluate:
1. Is the correct answer actually correct?
2. Are the other options clearly wrong but plausible distractors?
3. Is the question clear and unambiguous?
4. Is it aligned with Ethiopian curriculum?
5. Is the difficulty appropriate?
6. Is the explanation accurate and helpful?

Respond ONLY with this exact JSON format:
{
  "isValid": true or false,
  "isCorrectAnswerRight": true or false,
  "issues": ["issue 1 if any", "issue 2 if any"],
  "suggestions": ["suggestion 1", "suggestion 2"],
  "qualityScore": 85,
  "curriculumAlignment": "high/medium/low",
  "feedback": "Overall feedback on the question quality",
  "correctedAnswer": null or 0/1/2/3 if the answer is wrong,
  "improvedExplanation": "Better explanation if the provided one needs improvement"
}`;
};

const buildStudyTipsPrompt = ({
  studentName,
  grade,
  averageScore,
  studyStreak,
  weakSubjects,
  favoriteSubject,
  subjectStats,
  daysUntilExam = null,
}) => {
  const statsText = subjectStats
    .map(
      (s) =>
        `- ${SUBJECTS[s._id] || s._id}: ${s.avgScore}% avg (${s.totalAttempts} attempts)`,
    )
    .join("\n");

  return `You are an expert educational counselor specializing in Ethiopian Grade 12 university entrance exam preparation.

Student Profile:
- Name: ${studentName}
- Grade: ${grade}
- Current Average Score: ${averageScore}%
- Study Streak: ${studyStreak} consecutive days
- Weak Subjects: ${weakSubjects?.length > 0 ? weakSubjects.map((s) => SUBJECTS[s] || s).join(", ") : "None identified yet"}
- Best Subject: ${favoriteSubject ? SUBJECTS[favoriteSubject] || favoriteSubject : "Not determined yet"}
${daysUntilExam ? `- Days Until Exam: ${daysUntilExam}` : ""}

Subject Performance:
${statsText || "No quiz data yet"}

Generate 5 personalized, actionable study tips based on this student profile. Focus on Ethiopian curriculum.

Respond ONLY with this exact JSON format:
{
  "tips": [
    {
      "title": "Short tip title",
      "description": "Detailed, actionable description (2-3 sentences)",
      "category": "time_management/subject_focus/exam_strategy/motivation/resources",
      "priority": "high/medium/low",
      "estimatedTimePerDay": "30 minutes"
    }
  ],
  "motivationalMessage": "Short encouraging message personalized for this student",
  "weeklyGoal": "Specific weekly practice goal",
  "prioritySubject": "Subject to focus on most this week"
}`;
};

const buildExplainAnswerPrompt = ({
  questionText,
  options,
  selectedAnswer,
  correctAnswer,
  subject,
  studentGrade = "Grade 12",
}) => {
  const subjectName = SUBJECTS[subject] || subject;
  const selectedOption = options[selectedAnswer];
  const correctOption = options[correctAnswer];
  const isCorrect = selectedAnswer === correctAnswer;

  return `You are an expert ${subjectName} teacher explaining a ${studentGrade} exam question to an Ethiopian student.

QUESTION: ${questionText}

ALL OPTIONS:
A) ${options[0]}
B) ${options[1]}
C) ${options[2]}
D) ${options[3]}

STUDENT SELECTED: ${["A", "B", "C", "D"][selectedAnswer]}) ${selectedOption}
CORRECT ANSWER: ${["A", "B", "C", "D"][correctAnswer]}) ${correctOption}
RESULT: ${isCorrect ? "✅ CORRECT" : "❌ INCORRECT"}

Provide a clear, educational explanation that:
1. Explains WHY the correct answer is right with the underlying concept
2. ${!isCorrect ? "Explains why the student's choice was incorrect" : "Reinforces why their choice was correct"}
3. Explains why the other options are wrong
4. Connects to the broader Ethiopian curriculum concept
5. Provides a memory tip or trick for remembering this concept

Respond ONLY with this exact JSON format:
{
  "isCorrect": ${isCorrect},
  "mainExplanation": "Clear explanation of the correct answer with the underlying concept",
  "whyStudentWasWrong": "${!isCorrect ? "Explanation of the student mistake" : null}",
  "whyOthersAreWrong": {
    "A": "Why option A is wrong (or right if A is correct)",
    "B": "Why option B is wrong",
    "C": "Why option C is wrong",
    "D": "Why option D is wrong"
  },
  "keyConceptToRemember": "The main concept this question tests",
  "memoryTrick": "A helpful tip to remember this concept",
  "relatedTopics": ["topic1", "topic2"],
  "encouragement": "Personalized encouraging message"
}`;
};

const buildWeakSubjectAnalysisPrompt = ({
  studentName,
  subjectStats,
  grade,
}) => {
  const statsText = subjectStats
    .map(
      (s) =>
        `- ${SUBJECTS[s.subject] || s.subject}: ${s.avgScore}% average, ${s.totalAttempts} attempts, ${s.passRate}% pass rate`,
    )
    .join("\n");

  const weakSubjects = subjectStats.filter((s) => s.avgScore < 60);
  const strongSubjects = subjectStats.filter((s) => s.avgScore >= 75);

  return `You are an expert educational analyst for Ethiopian university entrance exam preparation.

Analyze this ${grade} student's performance and provide detailed recommendations:

Student: ${studentName}
Grade: ${grade}

Performance Data:
${statsText}

Weak Subjects (below 60%): ${weakSubjects.map((s) => SUBJECTS[s.subject] || s.subject).join(", ") || "None"}
Strong Subjects (above 75%): ${strongSubjects.map((s) => SUBJECTS[s.subject] || s.subject).join(", ") || "None"}

Respond ONLY with this exact JSON format:
{
  "assessment": "2-3 sentence overall performance assessment",
  "recommendations": [
    {
      "subject": "subject_name",
      "currentLevel": "weak/average/strong",
      "tip": "Specific actionable study strategy for this subject",
      "resources": ["resource1", "resource2"],
      "weeklyHours": 3,
      "priority": "high/medium/low"
    }
  ],
  "studyPlan": {
    "monday": "Focus subject and activity",
    "tuesday": "Focus subject and activity",
    "wednesday": "Focus subject and activity",
    "thursday": "Focus subject and activity",
    "friday": "Focus subject and activity",
    "saturday": "Mixed practice plan",
    "sunday": "Review and rest"
  },
  "encouragement": "Personalized motivational message",
  "predictedImprovement": "Expected improvement if plan is followed"
}`;
};

const buildPersonalizedPlanPrompt = ({
  studentName,
  grade,
  currentAvgScore,
  studyStreak,
  daysUntilExam,
  subjectStats,
  weakSubjects,
  targetScore = 80,
  availableHoursPerDay = 4,
}) => {
  const allSubjects = [
    "math",
    "english",
    "biology",
    "chemistry",
    "physics",
    "civics",
  ];
  const practicedSubjects = subjectStats.map((s) => s._id);
  const notPracticed = allSubjects.filter(
    (s) => !practicedSubjects.includes(s),
  );

  const statsText = subjectStats
    .map(
      (s) =>
        `- ${SUBJECTS[s._id] || s._id}: ${s.avgScore}% (${s.totalAttempts} quizzes)`,
    )
    .join("\n");

  return `You are an expert study planner for the Ethiopian Grade 12 university entrance exam.

Create a personalized ${daysUntilExam}-day study plan for:

Student: ${studentName}
Grade: ${grade}
Current Average: ${currentAvgScore}%
Target Score: ${targetScore}%
Study Streak: ${studyStreak} days
Available Hours/Day: ${availableHoursPerDay} hours
Days Until Exam: ${daysUntilExam}

Current Performance:
${statsText}
Subjects Not Yet Practiced: ${notPracticed.map((s) => SUBJECTS[s] || s).join(", ") || "None"}
Weak Areas: ${weakSubjects?.map((s) => SUBJECTS[s] || s).join(", ") || "None identified"}

Create a realistic, achievable study plan. Be specific about daily activities.

Respond ONLY with this exact JSON format:
{
  "planTitle": "Your Personalized ${daysUntilExam}-Day Study Plan",
  "overview": "2-3 sentence overview of the plan strategy",
  "weeklySchedule": [
    {
      "week": 1,
      "focus": "Main focus area this week",
      "dailyHours": ${availableHoursPerDay},
      "subjects": ["subject1", "subject2"],
      "goals": ["Complete 50 math questions", "Review biology chapter 3"],
      "quizzesTarget": 10
    }
  ],
  "dailyRoutine": {
    "morning": "Specific morning study activity (1-2 hours)",
    "afternoon": "Specific afternoon study activity (1-2 hours)",
    "evening": "Specific evening review activity (30-60 min)"
  },
  "milestones": [
    {
      "day": 30,
      "target": "Achieve 70% average in weak subjects",
      "checkPoint": "Take a full mock exam"
    }
  ],
  "priorityOrder": ["subject1", "subject2", "subject3", "subject4", "subject5", "subject6"],
  "examWeekTips": ["tip1", "tip2", "tip3", "tip4", "tip5"],
  "estimatedFinalScore": "Expected score range if plan is followed"
}`;
};

const buildQuizFeedbackPrompt = ({
  subject,
  score,
  totalQuestions,
  correctAnswers,
  timeTaken,
  weakTopics,
  strongTopics,
  grade = "Grade 12",
}) => {
  const percentage = score;
  const timeMinutes = Math.floor((timeTaken || 0) / 60);
  const timeSeconds = (timeTaken || 0) % 60;

  return `You are an educational AI assistant for Ethiopian ${grade} university entrance exam preparation.

A student just completed a ${SUBJECTS[subject] || subject} quiz:
- Score: ${correctAnswers}/${totalQuestions} (${percentage}%)
- Time: ${timeMinutes}m ${timeSeconds}s
- Weak Topics: ${weakTopics?.join(", ") || "none identified"}
- Strong Topics: ${strongTopics?.join(", ") || "none identified"}

Provide encouraging, specific feedback and 3 actionable study tips.

Respond ONLY with this exact JSON format:
{
  "feedback": "2-3 sentence encouraging feedback appropriate for their score level",
  "studyTips": [
    "Specific actionable tip 1 for ${SUBJECTS[subject] || subject}",
    "Specific actionable tip 2",
    "Specific actionable tip 3"
  ],
  "nextSteps": "What they should do in their next study session",
  "encouragement": "Short motivational message"
}`;
};

module.exports = {
  buildGenerateQuestionsPrompt,
  buildValidateQuestionPrompt,
  buildStudyTipsPrompt,
  buildExplainAnswerPrompt,
  buildWeakSubjectAnalysisPrompt,
  buildPersonalizedPlanPrompt,
  buildQuizFeedbackPrompt,
  SUBJECTS,
  DIFFICULTY_DESCRIPTIONS,
  GRADE_CONTEXT,
};
