const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

const createTransporter = () => {
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const baseEmailTemplate = (content, title = "HEROY") => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #f5f5f5; color: #333; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 2px; }
    .header p { color: rgba(255,255,255,0.85); margin-top: 8px; font-size: 14px; }
    .body { padding: 40px 30px; }
    .body h2 { color: #1B3A6B; font-size: 22px; margin-bottom: 16px; }
    .body p { color: #555; line-height: 1.7; margin-bottom: 16px; font-size: 15px; }
    .otp-box { background: linear-gradient(135deg, #f0f4ff 0%, #e8efff 100%); border: 2px solid #1B3A6B; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0; }
    .otp-code { font-size: 42px; font-weight: 900; color: #1B3A6B; letter-spacing: 8px; }
    .otp-expiry { color: #888; font-size: 13px; margin-top: 8px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #1B3A6B 0%, #2563EB 100%); color: #ffffff !important; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 16px 0; }
    .info-box { background: #f8faff; border-left: 4px solid #1B3A6B; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .info-box p { margin: 0; color: #444; }
    .divider { height: 1px; background: #eee; margin: 24px 0; }
    .footer { background: #f8f8f8; padding: 24px 30px; text-align: center; border-top: 1px solid #eee; }
    .footer p { color: #999; font-size: 12px; line-height: 1.6; }
    .footer a { color: #1B3A6B; text-decoration: none; }
    .subject-badge { display: inline-block; background: #1B3A6B; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; margin: 4px; }
    .score-display { font-size: 48px; font-weight: 900; color: #1B3A6B; text-align: center; }
    .score-grade { font-size: 24px; color: #2563EB; text-align: center; font-weight: 700; }
    ul { padding-left: 20px; }
    ul li { color: #555; line-height: 2; font-size: 15px; }
    .warning-box { background: #fff8f0; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .success-box { background: #f0fdf4; border-left: 4px solid #22c55e; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
    .danger-box { background: #fff0f0; border-left: 4px solid #ef4444; padding: 16px; border-radius: 0 8px 8px 0; margin: 16px 0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎓 HEROY</h1>
      <p>Ethiopian University Entrance Exam Practice</p>
    </div>
    <div class="body">
      ${content}
    </div>
    <div class="footer">
      <p>This email was sent from HEROY Exam Practice Platform</p>
      <p>© ${new Date().getFullYear()} HEROY. All rights reserved.</p>
      <p>If you didn't create an account, please ignore this email.</p>
      <p><a href="mailto:support@heroy.com">support@heroy.com</a></p>
    </div>
  </div>
</body>
</html>
`;

const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"HEROY Exam Practice" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    };

    const result = await transporter.sendMail(mailOptions);
    logger.info(
      `Email sent — To: ${to} — Subject: ${subject} — MessageId: ${result.messageId}`,
    );

    return { success: true, messageId: result.messageId };
  } catch (error) {
    logger.error(`Failed to send email — To: ${to} — Error: ${error.message}`);
    return { success: false, error: error.message };
  }
};

const sendWelcomeEmail = async (user) => {
  const content = `
    <h2>Welcome to HEROY, ${user.name}! 🎉</h2>
    <p>We are thrilled to have you join HEROY — Ethiopia's premier AI-powered university entrance exam practice platform.</p>
    <div class="success-box">
      <p><strong>Your account has been created successfully!</strong></p>
    </div>
    <p>With HEROY, you can:</p>
    <ul>
      <li>Practice with 1000+ real Ethiopian entrance exam questions</li>
      <li>Get AI-powered personalized study tips</li>
      <li>Track your progress across all 6 subjects</li>
      <li>Compete on the national leaderboard</li>
      <li>Get instant AI feedback after each quiz</li>
    </ul>
    <div class="divider"></div>
    <p><strong>Subjects covered:</strong></p>
    <p>
      <span class="subject-badge">📐 Mathematics</span>
      <span class="subject-badge">📚 English</span>
      <span class="subject-badge">🔬 Biology</span>
      <span class="subject-badge">⚗️ Chemistry</span>
      <span class="subject-badge">⚡ Physics</span>
      <span class="subject-badge">🏛️ Civics</span>
    </p>
    <div class="divider"></div>
    <p>Please verify your email address to access all features.</p>
    <p style="text-align:center">
      <a href="${process.env.FRONTEND_URL}/verify-email" class="btn">Verify Email Now</a>
    </p>
    <p>Good luck with your studies! We believe in you. 🌟</p>
  `;

  return sendEmail({
    to: user.email,
    subject: "🎉 Welcome to HEROY — Start Your Exam Preparation!",
    html: baseEmailTemplate(content, "Welcome to HEROY"),
  });
};

const sendEmailVerificationOTP = async (user, otp) => {
  const content = `
    <h2>Verify Your Email Address</h2>
    <p>Hello ${user.name},</p>
    <p>Please use the verification code below to confirm your email address and activate your HEROY account.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p class="otp-expiry">⏰ This code expires in 15 minutes</p>
    </div>
    <div class="warning-box">
      <p><strong>Security Notice:</strong> Never share this code with anyone. HEROY staff will never ask for your OTP.</p>
    </div>
    <p>If you did not create a HEROY account, please ignore this email.</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `${otp} — Your HEROY Email Verification Code`,
    html: baseEmailTemplate(content, "Email Verification"),
  });
};

const sendPasswordResetOTP = async (user, otp) => {
  const content = `
    <h2>Reset Your Password</h2>
    <p>Hello ${user.name},</p>
    <p>We received a request to reset your HEROY password. Use the code below to proceed.</p>
    <div class="otp-box">
      <div class="otp-code">${otp}</div>
      <p class="otp-expiry">⏰ This code expires in 10 minutes</p>
    </div>
    <div class="danger-box">
      <p><strong>Warning:</strong> If you did not request a password reset, please secure your account immediately by changing your password.</p>
    </div>
    <p>For security, this code can only be used once and expires in 10 minutes.</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `${otp} — Your HEROY Password Reset Code`,
    html: baseEmailTemplate(content, "Password Reset"),
  });
};

const sendPasswordChangedEmail = async (user) => {
  const content = `
    <h2>Password Changed Successfully</h2>
    <p>Hello ${user.name},</p>
    <div class="success-box">
      <p>Your HEROY password has been changed successfully on <strong>${new Date().toLocaleString()}</strong>.</p>
    </div>
    <div class="danger-box">
      <p><strong>Not you?</strong> If you did not change your password, your account may be compromised. Please contact support immediately at <a href="mailto:support@heroy.com">support@heroy.com</a></p>
    </div>
    <p>For your security, all active sessions have been logged out. Please log in again with your new password.</p>
    <p style="text-align:center">
      <a href="${process.env.FRONTEND_URL}/login" class="btn">Log In Now</a>
    </p>
  `;

  return sendEmail({
    to: user.email,
    subject: "🔐 HEROY — Your Password Has Been Changed",
    html: baseEmailTemplate(content, "Password Changed"),
  });
};

const sendTeacherWelcomeEmail = async (teacher, temporaryPassword) => {
  const content = `
    <h2>Welcome to HEROY Teacher Portal! 🎓</h2>
    <p>Hello ${teacher.name},</p>
    <p>Your teacher account has been created on HEROY. You can now log in and start creating questions for Ethiopian students.</p>
    <div class="info-box">
      <p><strong>Your Login Credentials:</strong></p>
      <p>Email: <strong>${teacher.email}</strong></p>
      <p>Temporary Password: <strong>${temporaryPassword}</strong></p>
    </div>
    <div class="warning-box">
      <p><strong>Important:</strong> Please change your temporary password immediately after your first login for security.</p>
    </div>
    <p>As a teacher on HEROY you can:</p>
    <ul>
      <li>Create and submit questions for review</li>
      <li>Use AI to generate high-quality exam questions</li>
      <li>Track your question performance and analytics</li>
      <li>Help thousands of Ethiopian students prepare for their exams</li>
    </ul>
    <div class="divider"></div>
    <p>Your subject specialization: <span class="subject-badge">${teacher.subject?.toUpperCase()}</span></p>
    <p style="text-align:center">
      <a href="${process.env.FRONTEND_URL}/teacher/login" class="btn">Access Teacher Portal</a>
    </p>
  `;

  return sendEmail({
    to: teacher.email,
    subject: "🎓 Welcome to HEROY Teacher Portal — Your Credentials Inside",
    html: baseEmailTemplate(content, "Teacher Welcome"),
  });
};

const sendQuestionApprovedEmail = async (teacher, question) => {
  const content = `
    <h2>Your Question Has Been Approved! ✅</h2>
    <p>Hello ${teacher.name},</p>
    <div class="success-box">
      <p>Great news! Your <strong>${question.subject}</strong> question has been approved and is now live in the HEROY exam bank.</p>
    </div>
    <div class="info-box">
      <p><strong>Question Preview:</strong></p>
      <p>${question.questionText.slice(0, 150)}${question.questionText.length > 150 ? "..." : ""}</p>
      <p>Subject: <span class="subject-badge">${question.subject?.toUpperCase()}</span></p>
      <p>Difficulty: <strong>${question.difficulty}</strong></p>
    </div>
    <p>Ethiopian students are now practicing with your question. Thank you for contributing to HEROY! 🇪🇹</p>
    <p style="text-align:center">
      <a href="${process.env.FRONTEND_URL}/teacher/manage-questions" class="btn">View Your Questions</a>
    </p>
  `;

  return sendEmail({
    to: teacher.email,
    subject: `✅ Question Approved — ${question.subject?.toUpperCase()} | HEROY`,
    html: baseEmailTemplate(content, "Question Approved"),
  });
};

const sendQuestionRejectedEmail = async (teacher, question, reason) => {
  const content = `
    <h2>Question Needs Revision</h2>
    <p>Hello ${teacher.name},</p>
    <div class="warning-box">
      <p>Your <strong>${question.subject}</strong> question requires revision before it can be approved.</p>
    </div>
    <div class="info-box">
      <p><strong>Question Preview:</strong></p>
      <p>${question.questionText.slice(0, 150)}${question.questionText.length > 150 ? "..." : ""}</p>
    </div>
    <div class="danger-box">
      <p><strong>Reason for Rejection:</strong></p>
      <p>${reason}</p>
    </div>
    <p>Please review the feedback, make the necessary corrections, and resubmit your question for approval.</p>
    <p style="text-align:center">
      <a href="${process.env.FRONTEND_URL}/teacher/manage-questions" class="btn">Edit & Resubmit</a>
    </p>
  `;

  return sendEmail({
    to: teacher.email,
    subject: `❌ Question Needs Revision — ${question.subject?.toUpperCase()} | HEROY`,
    html: baseEmailTemplate(content, "Question Revision"),
  });
};

const sendStudyReminderEmail = async (user) => {
  const content = `
    <h2>Don't Forget to Study Today! 📚</h2>
    <p>Hello ${user.name},</p>
    <p>Your study streak is at risk! You haven't practiced today.</p>
    <div class="info-box">
      <p><strong>Your Current Stats:</strong></p>
      <p>Study Streak: <strong>${user.studyStreak} days</strong></p>
      <p>Average Score: <strong>${user.averageScore}%</strong></p>
      <p>Total Quizzes: <strong>${user.totalQuizzesTaken}</strong></p>
    </div>
    <p>Even 15 minutes of practice today can make a big difference in your exam preparation!</p>
    <p style="text-align:center">
      <a href="${process.env.FRONTEND_URL}/student/subjects" class="btn">Start Practicing Now</a>
    </p>
    <p>Remember: Consistent daily practice is the key to success in the Ethiopian university entrance exam! 🌟</p>
  `;

  return sendEmail({
    to: user.email,
    subject: "📚 Time to Practice — Keep Your Study Streak Going!",
    html: baseEmailTemplate(content, "Study Reminder"),
  });
};

const sendScoreReportEmail = async (user, score) => {
  const gradeColors = {
    "A+": "#22c55e",
    A: "#22c55e",
    "B+": "#3b82f6",
    B: "#3b82f6",
    "C+": "#f59e0b",
    C: "#f59e0b",
    D: "#ef4444",
    F: "#ef4444",
  };

  const gradeColor = gradeColors[score.grade] || "#1B3A6B";

  const content = `
    <h2>Quiz Results — ${score.subject?.toUpperCase()}</h2>
    <p>Hello ${user.name},</p>
    <p>Here are your results from your recent ${score.subject} quiz:</p>
    <div class="otp-box">
      <div class="score-display" style="color: ${gradeColor}">${score.percentage}%</div>
      <div class="score-grade" style="color: ${gradeColor}">Grade: ${score.grade}</div>
      <p class="otp-expiry">${score.correctAnswers}/${score.totalQuestions} correct answers</p>
    </div>
    <div class="info-box">
      <p><strong>Performance Summary:</strong></p>
      <p>✅ Correct Answers: <strong>${score.correctAnswers}</strong></p>
      <p>❌ Wrong Answers: <strong>${score.wrongAnswers || score.totalQuestions - score.correctAnswers}</strong></p>
      <p>⏱️ Time Taken: <strong>${score.formattedTime || `${Math.floor((score.timeTaken || 0) / 60)}:${String((score.timeTaken || 0) % 60).padStart(2, "0")}`}</strong></p>
      <p>📊 Performance: <strong>${score.performanceLevel || "N/A"}</strong></p>
    </div>
    ${
      score.aiFeedback
        ? `
    <div class="success-box">
      <p><strong>AI Feedback:</strong></p>
      <p>${score.aiFeedback}</p>
    </div>
    `
        : ""
    }
    <p style="text-align:center">
      <a href="${process.env.FRONTEND_URL}/student/results" class="btn">View Detailed Results</a>
    </p>
    <p>Keep practicing to improve your score! 💪</p>
  `;

  return sendEmail({
    to: user.email,
    subject: `📊 Quiz Results: ${score.percentage}% in ${score.subject?.toUpperCase()} | HEROY`,
    html: baseEmailTemplate(content, "Quiz Results"),
  });
};

const sendAccountDeactivatedEmail = async (user, reason) => {
  const content = `
    <h2>Account Suspended</h2>
    <p>Hello ${user.name},</p>
    <div class="danger-box">
      <p>Your HEROY account has been suspended.</p>
      <p><strong>Reason:</strong> ${reason}</p>
    </div>
    <p>If you believe this is a mistake or would like to appeal this decision, please contact our support team.</p>
    <p style="text-align:center">
      <a href="mailto:support@heroy.com" class="btn">Contact Support</a>
    </p>
  `;

  return sendEmail({
    to: user.email,
    subject: "🚫 HEROY Account Suspended",
    html: baseEmailTemplate(content, "Account Suspended"),
  });
};

const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info("Email configuration verified successfully");
    return { valid: true };
  } catch (error) {
    logger.error(`Email configuration error: ${error.message}`);
    return { valid: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
  sendTeacherWelcomeEmail,
  sendQuestionApprovedEmail,
  sendQuestionRejectedEmail,
  sendStudyReminderEmail,
  sendScoreReportEmail,
  sendAccountDeactivatedEmail,
  verifyEmailConfig,
  baseEmailTemplate,
};
