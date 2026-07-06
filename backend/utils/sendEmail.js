const nodemailer = require("nodemailer");
const logger = require("./logger");

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT),
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

// Base email sender
const sendEmail = async ({ to, subject, html, text }) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ""),
    };

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent to ${to}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error) {
    logger.error(`Email send failed to ${to}: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Send welcome email to new student
const sendWelcomeEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to HEROY</title>
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1B3A6B, #2E5FA3); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
        .header p { color: #CCDDFF; margin: 10px 0 0; font-size: 14px; }
        .body { padding: 40px 30px; }
        .body h2 { color: #1B3A6B; font-size: 22px; }
        .body p { color: #555555; line-height: 1.7; font-size: 15px; }
        .button { display: inline-block; background: linear-gradient(135deg, #1B3A6B, #2E5FA3); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 20px 0; }
        .features { background: #F0F8FF; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .features h3 { color: #1B3A6B; margin-top: 0; }
        .feature-item { display: flex; align-items: center; margin: 10px 0; color: #333333; font-size: 14px; }
        .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #999999; font-size: 12px; margin: 0; }
        .flag { font-size: 24px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <span class="flag">🇪🇹</span>
          <h1>Welcome to HEROY!</h1>
          <p>AI-Based Ethiopian University Entrance Exam Practice</p>
        </div>
        <div class="body">
          <h2>Hello, ${user.name}! 👋</h2>
          <p>Welcome to HEROY — the smartest way to prepare for your Ethiopian University Entrance Exam. We are excited to have you on board!</p>
          <div class="features">
            <h3>What you can do with HEROY:</h3>
            <div class="feature-item">✅ Practice real past exam questions by subject</div>
            <div class="feature-item">🤖 Get AI-powered study tips personalized for you</div>
            <div class="feature-item">📊 Track your progress and see improvement over time</div>
            <div class="feature-item">🏆 Compete on the leaderboard with other students</div>
            <div class="feature-item">💡 Get AI explanations for every answer</div>
          </div>
          <p>Start practicing today and give yourself the best chance of getting into your dream university!</p>
          <a href="${process.env.FRONTEND_URL}/student/home" class="button">Start Practicing Now →</a>
          <p>If you have any questions, reply to this email and we will help you.</p>
          <p>Best of luck on your exam! 💪<br><strong>The HEROY Team</strong></p>
        </div>
        <div class="footer">
          <p>© 2024 HEROY App. Made with ❤️ for Ethiopian students.</p>
          <p>You received this email because you registered at heroy.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: "🎉 Welcome to HEROY — Start Your Exam Preparation!",
    html,
  });
};

// Send email verification OTP
const sendEmailVerificationOTP = async (user, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1B3A6B, #2E5FA3); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .body { padding: 40px 30px; text-align: center; }
        .body p { color: #555555; line-height: 1.7; font-size: 15px; }
        .otp-box { background: #F0F8FF; border: 2px dashed #2E5FA3; border-radius: 12px; padding: 30px; margin: 30px 0; }
        .otp-code { font-size: 48px; font-weight: bold; color: #1B3A6B; letter-spacing: 12px; margin: 0; }
        .otp-label { color: #888888; font-size: 13px; margin-top: 10px; }
        .warning { background: #FFF3E0; border-left: 4px solid #F5A623; padding: 15px; border-radius: 4px; text-align: left; margin: 20px 0; }
        .warning p { color: #666666; font-size: 13px; margin: 0; }
        .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #999999; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🇪🇹 Verify Your Email</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>Please use the OTP code below to verify your email address:</p>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
            <p class="otp-label">Enter this code in the app to verify your email</p>
          </div>
          <div class="warning">
            <p>⏰ This code expires in <strong>24 hours</strong>.</p>
            <p>🔒 Never share this code with anyone.</p>
            <p>❌ If you did not register on HEROY, please ignore this email.</p>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 HEROY App. Made with ❤️ for Ethiopian students.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `${otp} — Your HEROY Email Verification Code`,
    html,
  });
};

// Send password reset OTP
const sendPasswordResetOTP = async (user, otp) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #B71C1C, #E53935); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .body { padding: 40px 30px; text-align: center; }
        .body p { color: #555555; line-height: 1.7; font-size: 15px; }
        .otp-box { background: #FFF3F3; border: 2px dashed #E53935; border-radius: 12px; padding: 30px; margin: 30px 0; }
        .otp-code { font-size: 48px; font-weight: bold; color: #B71C1C; letter-spacing: 12px; margin: 0; }
        .otp-label { color: #888888; font-size: 13px; margin-top: 10px; }
        .warning { background: #FFF3E0; border-left: 4px solid #F5A623; padding: 15px; border-radius: 4px; text-align: left; margin: 20px 0; }
        .warning p { color: #666666; font-size: 13px; margin: 0; line-height: 1.8; }
        .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #999999; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${user.name}</strong>,</p>
          <p>We received a request to reset your HEROY account password. Use the code below:</p>
          <div class="otp-box">
            <p class="otp-code">${otp}</p>
            <p class="otp-label">Enter this code in the app to reset your password</p>
          </div>
          <div class="warning">
            <p>⏰ This code expires in <strong>15 minutes</strong>.</p>
            <p>🔒 Never share this code with anyone including HEROY staff.</p>
            <p>❌ If you did not request a password reset, please secure your account immediately.</p>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 HEROY App. Made with ❤️ for Ethiopian students.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: `${otp} — Your HEROY Password Reset Code`,
    html,
  });
};

// Send password changed confirmation
const sendPasswordChangedEmail = async (user) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2E7D32, #43A047); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .body { padding: 40px 30px; }
        .body p { color: #555555; line-height: 1.7; font-size: 15px; }
        .success-box { background: #E8F5E9; border-left: 4px solid #43A047; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .warning { background: #FFF3E0; border-left: 4px solid #F5A623; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .warning p { color: #666666; font-size: 13px; margin: 0; }
        .button { display: inline-block; background: linear-gradient(135deg, #1B3A6B, #2E5FA3); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 10px 0; }
        .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #999999; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Password Changed Successfully</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${user.name}</strong>,</p>
          <div class="success-box">
            <p>Your HEROY account password was successfully changed on <strong>${new Date().toLocaleString("en-US", { timeZone: "Africa/Addis_Ababa" })}</strong> (Addis Ababa time).</p>
          </div>
          <div class="warning">
            <p>🚨 If you did NOT make this change, please reset your password immediately and contact us.</p>
          </div>
          <a href="${process.env.FRONTEND_URL}/login" class="button">Login to Your Account →</a>
        </div>
        <div class="footer">
          <p>© 2024 HEROY App. Made with ❤️ for Ethiopian students.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: user.email,
    subject: "✅ Your HEROY Password Was Changed",
    html,
  });
};

// Send question approved notification to teacher
const sendQuestionApprovedEmail = async (teacher, question) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1B3A6B, #2E5FA3); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .body { padding: 40px 30px; }
        .body p { color: #555555; line-height: 1.7; font-size: 15px; }
        .question-box { background: #F0F8FF; border-left: 4px solid #2E5FA3; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .question-box p { margin: 5px 0; font-size: 14px; color: #333333; }
        .badge { display: inline-block; background: #E8F5E9; color: #2E7D32; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #999999; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>✅ Your Question Was Approved!</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${teacher.name}</strong>,</p>
          <p>Great news! Your question has been reviewed and approved by the admin. It is now live in the HEROY exam bank.</p>
          <div class="question-box">
            <p><strong>Subject:</strong> ${question.subject.toUpperCase()}</p>
            <p><strong>Difficulty:</strong> ${question.difficulty}</p>
            <p><strong>Question:</strong> ${question.questionText.slice(0, 100)}...</p>
            <p><strong>Status:</strong> <span class="badge">✅ APPROVED</span></p>
          </div>
          <p>Thank you for contributing to HEROY and helping Ethiopian students prepare for their exams!</p>
        </div>
        <div class="footer">
          <p>© 2024 HEROY App. Made with ❤️ for Ethiopian students.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: teacher.email,
    subject: "✅ Your Question Was Approved on HEROY",
    html,
  });
};

// Send question rejected notification to teacher
const sendQuestionRejectedEmail = async (teacher, question, reason) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #B71C1C, #E53935); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .body { padding: 40px 30px; }
        .body p { color: #555555; line-height: 1.7; font-size: 15px; }
        .question-box { background: #FFF3F3; border-left: 4px solid #E53935; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .question-box p { margin: 5px 0; font-size: 14px; color: #333333; }
        .reason-box { background: #FFF3E0; border-left: 4px solid #F5A623; padding: 20px; border-radius: 4px; margin: 20px 0; }
        .badge { display: inline-block; background: #FFEBEE; color: #B71C1C; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #999999; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>❌ Question Needs Revision</h1>
        </div>
        <div class="body">
          <p>Hello <strong>${teacher.name}</strong>,</p>
          <p>Your question was reviewed by the admin and needs some revision before it can be approved.</p>
          <div class="question-box">
            <p><strong>Subject:</strong> ${question.subject.toUpperCase()}</p>
            <p><strong>Question:</strong> ${question.questionText.slice(0, 100)}...</p>
            <p><strong>Status:</strong> <span class="badge">❌ NEEDS REVISION</span></p>
          </div>
          <div class="reason-box">
            <p><strong>Reason from admin:</strong></p>
            <p>${reason || "Please review and improve the question quality."}</p>
          </div>
          <p>Please log in to your teacher dashboard, edit the question based on the feedback, and resubmit it for review.</p>
        </div>
        <div class="footer">
          <p>© 2024 HEROY App. Made with ❤️ for Ethiopian students.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: teacher.email,
    subject: "❌ Your HEROY Question Needs Revision",
    html,
  });
};

// Send new teacher welcome email
const sendTeacherWelcomeEmail = async (teacher, temporaryPassword) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #1B3A6B, #2E5FA3); padding: 40px 30px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .header p { color: #CCDDFF; margin: 10px 0 0; }
        .body { padding: 40px 30px; }
        .body p { color: #555555; line-height: 1.7; font-size: 15px; }
        .credentials-box { background: #F0F8FF; border: 2px solid #2E5FA3; border-radius: 8px; padding: 25px; margin: 20px 0; }
        .credentials-box p { margin: 8px 0; font-size: 15px; }
        .credentials-box code { background: #1B3A6B; color: #ffffff; padding: 3px 8px; border-radius: 4px; font-size: 14px; }
        .warning { background: #FFF3E0; border-left: 4px solid #F5A623; padding: 15px; border-radius: 4px; margin: 20px 0; }
        .warning p { color: #666666; font-size: 13px; margin: 0; line-height: 1.8; }
        .button { display: inline-block; background: linear-gradient(135deg, #1B3A6B, #2E5FA3); color: #ffffff; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 15px; margin: 10px 0; }
        .footer { background: #f8f8f8; padding: 20px 30px; text-align: center; border-top: 1px solid #eeeeee; }
        .footer p { color: #999999; font-size: 12px; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎓 Welcome to HEROY Teacher Portal!</h1>
          <p>You have been added as a teacher on HEROY</p>
        </div>
        <div class="body">
          <p>Hello <strong>${teacher.name}</strong>,</p>
          <p>You have been registered as a teacher on the HEROY AI-Based Exam Practice Platform. Here are your login credentials:</p>
          <div class="credentials-box">
            <p>📧 <strong>Email:</strong> <code>${teacher.email}</code></p>
            <p>🔑 <strong>Temporary Password:</strong> <code>${temporaryPassword}</code></p>
            <p>🌐 <strong>Login URL:</strong> <code>${process.env.FRONTEND_URL}/teacher/login</code></p>
          </div>
          <div class="warning">
            <p>⚠️ Please change your password immediately after your first login.</p>
            <p>🔒 Never share your credentials with anyone.</p>
          </div>
          <p>As a teacher you can:</p>
          <p>✅ Create and manage exam questions<br>
          🤖 Use AI to generate questions automatically<br>
          📊 View student performance analytics<br>
          👀 Review student results</p>
          <a href="${process.env.FRONTEND_URL}/teacher/login" class="button">Login to Teacher Portal →</a>
        </div>
        <div class="footer">
          <p>© 2024 HEROY App. Made with ❤️ for Ethiopian students.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return await sendEmail({
    to: teacher.email,
    subject: "🎓 Welcome to HEROY Teacher Portal — Your Login Credentials",
    html,
  });
};

// Verify email transporter connection
const verifyEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info("✅ Email service connected successfully");
    return true;
  } catch (error) {
    logger.error(`❌ Email service connection failed: ${error.message}`);
    return false;
  }
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
  sendQuestionApprovedEmail,
  sendQuestionRejectedEmail,
  sendTeacherWelcomeEmail,
  verifyEmailConnection,
};
