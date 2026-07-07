const User = require("../../models/User");
const Session = require("../../models/Session");
const Notification = require("../../models/Notification");
const { catchAsync } = require("../../middleware/errorHandler");
const {
  generateTokenPair,
  getTokenExpiry,
  verifyRefreshToken,
} = require("../../utils/generateToken");
const {
  generateEmailVerificationOTP,
  generatePasswordResetOTP,
  hashOTP,
  verifyOTP,
  isOTPExpired,
} = require("../../utils/otpGenerator");
const {
  sendWelcomeEmail,
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
} = require("../../utils/sendEmail");
const {
  successResponse,
  createdResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} = require("../../utils/apiResponse");
const { uploadImage, deleteImage } = require("../../config/cloudinary");
const { getFileInfo } = require("../../middleware/upload");
const logger = require("../../utils/logger");
const crypto = require("crypto");

// ── REGISTER ───────────────────────────────────────────────

// @desc    Register new student
// @route   POST /api/student/auth/register
// @access  Public
exports.register = catchAsync(async (req, res, next) => {
  const { name, email, password, grade, school } = req.body;

  // Check if email already exists
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    return errorResponse(res, "An account with this email already exists", 409);
  }

  // Generate email verification OTP
  const { otp, expiresAt } = generateEmailVerificationOTP();
  const hashedOTP = hashOTP(otp);

  // Create student account
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    grade: grade || "Grade 12",
    school: school || "Not specified",
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpiry: expiresAt,
  });

  // Generate JWT tokens
  const { accessToken, refreshToken } = generateTokenPair({
    id: user._id,
    role: "student",
    email: user.email,
  });

  // Hash refresh token for storage
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Create session
  await Session.create({
    userId: user._id,
    userModel: "User",
    role: "student",
    refreshToken,
    refreshTokenHash,
    ipAddress: req.ip,
    deviceInfo: {
      userAgent: req.headers["user-agent"] || null,
    },
    expiresAt: getTokenExpiry(process.env.JWT_REFRESH_EXPIRE || "30d"),
  });

  // Send welcome email
  await sendWelcomeEmail(user);

  // Send email verification OTP
  await sendEmailVerificationOTP(user, otp);

  // Create welcome notification
  await Notification.createNotification({
    recipientId: user._id,
    recipientModel: "User",
    recipientRole: "student",
    ...Notification.templates.welcome(user.name),
  });

  // Update login info
  await user.updateLoginInfo(req.ip);

  logger.logAuth("StudentRegister", user._id, "student");

  return createdResponse(
    res,
    "Account created successfully. Please check your email to verify your account",
    {
      user: user.getPublicProfile(),
      accessToken,
      refreshToken,
    },
  );
});

// ── LOGIN ──────────────────────────────────────────────────

// @desc    Login student
// @route   POST /api/student/auth/login
// @access  Public
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Find user with password field included
  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  // Check if user exists and password is correct
  if (!user || !(await user.comparePassword(password))) {
    return unauthorizedResponse(res, "Invalid email or password");
  }

  // Check if account is active
  if (!user.isActive) {
    return unauthorizedResponse(
      res,
      "Your account has been deactivated. Please contact support",
    );
  }

  // Check if account is banned
  if (user.isBanned) {
    return unauthorizedResponse(
      res,
      `Your account has been banned. Reason: ${user.banReason || "Violation of terms of service"}`,
    );
  }

  // Generate tokens
  const { accessToken, refreshToken } = generateTokenPair({
    id: user._id,
    role: "student",
    email: user.email,
  });

  // Hash refresh token
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  // Create new session
  await Session.create({
    userId: user._id,
    userModel: "User",
    role: "student",
    refreshToken,
    refreshTokenHash,
    ipAddress: req.ip,
    deviceInfo: {
      userAgent: req.headers["user-agent"] || null,
    },
    expiresAt: getTokenExpiry(process.env.JWT_REFRESH_EXPIRE || "30d"),
  });

  // Update login info
  await user.updateLoginInfo(req.ip);

  logger.logAuth("StudentLogin", user._id, "student");

  return successResponse(res, "Login successful", {
    user: user.getPublicProfile(),
    accessToken,
    refreshToken,
    isEmailVerified: user.isEmailVerified,
  });
});

// ── LOGOUT ─────────────────────────────────────────────────

// @desc    Logout student
// @route   POST /api/student/auth/logout
// @access  Private
exports.logout = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({
      refreshTokenHash,
      isActive: true,
    });

    if (session) {
      await session.invalidate("user_logout");
    }
  }

  logger.logAuth("StudentLogout", req.userId, "student");

  return successResponse(res, "Logged out successfully");
});

// ── REFRESH TOKEN ──────────────────────────────────────────

// @desc    Refresh access token
// @route   POST /api/student/auth/refresh-token
// @access  Public
exports.refreshToken = catchAsync(async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return unauthorizedResponse(res, "Refresh token is required");
  }

  // Verify refresh token
  const { valid, expired, decoded } = verifyRefreshToken(refreshToken);

  if (!valid) {
    if (expired) {
      return unauthorizedResponse(res, "Session expired. Please log in again");
    }
    return unauthorizedResponse(res, "Invalid refresh token");
  }

  // Find active session
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findByRefreshTokenHash(refreshTokenHash);

  if (!session) {
    return unauthorizedResponse(
      res,
      "Session not found or expired. Please log in again",
    );
  }

  // Find user
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive || user.isBanned) {
    await session.invalidate("account_banned");
    return unauthorizedResponse(res, "Account not found or deactivated");
  }

  // Generate new token pair
  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
    id: user._id,
    role: "student",
    email: user.email,
  });

  // Invalidate old session
  await session.invalidate("user_logout");

  // Create new session
  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await Session.create({
    userId: user._id,
    userModel: "User",
    role: "student",
    refreshToken: newRefreshToken,
    refreshTokenHash: newRefreshTokenHash,
    ipAddress: req.ip,
    deviceInfo: session.deviceInfo,
    expiresAt: getTokenExpiry(process.env.JWT_REFRESH_EXPIRE || "30d"),
  });

  return successResponse(res, "Token refreshed successfully", {
    accessToken,
    refreshToken: newRefreshToken,
  });
});

// ── VERIFY EMAIL ───────────────────────────────────────────

// @desc    Verify email with OTP
// @route   POST /api/student/auth/verify-email
// @access  Public
exports.verifyEmail = catchAsync(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+emailVerificationOTP +emailVerificationOTPExpiry");

  if (!user) {
    return notFoundResponse(res, "No account found with this email");
  }

  if (user.isEmailVerified) {
    return successResponse(res, "Email is already verified");
  }

  if (!user.emailVerificationOTP) {
    return errorResponse(
      res,
      "No verification OTP found. Please request a new one",
      400,
    );
  }

  // Check if OTP has expired
  if (isOTPExpired(user.emailVerificationOTPExpiry)) {
    return errorResponse(
      res,
      "Verification OTP has expired. Please request a new one",
      400,
    );
  }

  // Verify OTP
  const isOTPValid = verifyOTP(otp, user.emailVerificationOTP);
  if (!isOTPValid) {
    return errorResponse(res, "Invalid OTP. Please check and try again", 400);
  }

  // Mark email as verified
  user.isEmailVerified = true;
  user.emailVerificationOTP = null;
  user.emailVerificationOTPExpiry = null;
  await user.save({ validateBeforeSave: false });

  // Send notification
  await Notification.createNotification({
    recipientId: user._id,
    recipientModel: "User",
    recipientRole: "student",
    type: "email_verified",
    title: "✅ Email Verified!",
    message: "Your email has been verified. You now have full access to HEROY.",
    actionUrl: "/student/home",
    actionLabel: "Start Practicing",
  });

  logger.logAuth("StudentEmailVerified", user._id, "student");

  return successResponse(
    res,
    "Email verified successfully. You can now access all features",
  );
});

// ── RESEND VERIFICATION ─────────────────────────────────────

// @desc    Resend verification OTP
// @route   POST /api/student/auth/resend-verification
// @access  Public
exports.resendVerificationOTP = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return errorResponse(res, "Email is required", 400);
  }

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+emailVerificationOTP +emailVerificationOTPExpiry");

  if (!user) {
    return notFoundResponse(res, "No account found with this email");
  }

  if (user.isEmailVerified) {
    return successResponse(res, "Email is already verified");
  }

  // Generate new OTP
  const { otp, expiresAt } = generateEmailVerificationOTP();
  const hashedOTP = hashOTP(otp);

  user.emailVerificationOTP = hashedOTP;
  user.emailVerificationOTPExpiry = expiresAt;
  await user.save({ validateBeforeSave: false });

  // Send new OTP
  await sendEmailVerificationOTP(user, otp);

  return successResponse(
    res,
    "New verification OTP sent to your email. Please check your inbox",
  );
});

// ── FORGOT PASSWORD ────────────────────────────────────────

// @desc    Send password reset OTP
// @route   POST /api/student/auth/forgot-password
// @access  Public
exports.forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email.toLowerCase() });

  // Always return success to prevent email enumeration attacks
  if (!user || !user.isActive) {
    return successResponse(
      res,
      "If an account exists with this email, a password reset OTP has been sent",
    );
  }

  // Generate password reset OTP
  const { otp, expiresAt } = generatePasswordResetOTP();
  const hashedOTP = hashOTP(otp);

  user.passwordResetOTP = hashedOTP;
  user.passwordResetOTPExpiry = expiresAt;
  await user.save({ validateBeforeSave: false });

  // Send reset OTP email
  await sendPasswordResetOTP(user, otp);

  logger.logAuth("StudentForgotPassword", user._id, "student");

  return successResponse(
    res,
    "If an account exists with this email, a password reset OTP has been sent",
  );
});

// ── RESET PASSWORD ─────────────────────────────────────────

// @desc    Reset password using OTP
// @route   POST /api/student/auth/reset-password
// @access  Public
exports.resetPassword = catchAsync(async (req, res, next) => {
  const { email, otp, newPassword } = req.body;

  const user = await User.findOne({
    email: email.toLowerCase(),
  }).select("+password +passwordResetOTP +passwordResetOTPExpiry");

  if (!user) {
    return notFoundResponse(res, "No account found with this email");
  }

  if (!user.passwordResetOTP) {
    return errorResponse(
      res,
      "No password reset request found. Please request a new OTP",
      400,
    );
  }

  // Check if OTP has expired
  if (isOTPExpired(user.passwordResetOTPExpiry)) {
    return errorResponse(
      res,
      "Password reset OTP has expired. Please request a new one",
      400,
    );
  }

  // Verify OTP
  const isOTPValid = verifyOTP(otp, user.passwordResetOTP);
  if (!isOTPValid) {
    return errorResponse(res, "Invalid OTP. Please check and try again", 400);
  }

  // Check new password is not same as current
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    return errorResponse(
      res,
      "New password cannot be the same as your current password",
      400,
    );
  }

  // Update password and clear OTP
  user.password = newPassword;
  user.passwordResetOTP = null;
  user.passwordResetOTPExpiry = null;
  await user.save();

  // Invalidate all active sessions
  await Session.invalidateAllByUser(user._id, "password_changed");

  // Send password changed confirmation email
  await sendPasswordChangedEmail(user);

  logger.logAuth("StudentResetPassword", user._id, "student");

  return successResponse(
    res,
    "Password reset successfully. Please log in with your new password",
  );
});

// ── CHANGE PASSWORD ────────────────────────────────────────

// @desc    Change password when logged in
// @route   PUT /api/student/auth/change-password
// @access  Private
exports.changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.userId).select("+password");

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  // Verify current password
  const isCurrentCorrect = await user.comparePassword(currentPassword);
  if (!isCurrentCorrect) {
    return unauthorizedResponse(res, "Current password is incorrect");
  }

  // Check new password is different
  const isSamePassword = await user.comparePassword(newPassword);
  if (isSamePassword) {
    return errorResponse(
      res,
      "New password cannot be the same as your current password",
      400,
    );
  }

  // Update password
  user.password = newPassword;
  await user.save();

  // Invalidate all sessions
  await Session.invalidateAllByUser(user._id, "password_changed");

  // Send confirmation email
  await sendPasswordChangedEmail(user);

  logger.logAuth("StudentChangePassword", user._id, "student");

  return successResponse(
    res,
    "Password changed successfully. Please log in again with your new password",
  );
});

// ── GET ME ─────────────────────────────────────────────────

// @desc    Get current logged in student
// @route   GET /api/student/auth/me
// @access  Private
exports.getMe = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.userId);

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  return successResponse(res, "Student profile retrieved successfully", {
    user: user.getPublicProfile(),
  });
});

// ── UPDATE PROFILE ─────────────────────────────────────────

// @desc    Update student profile
// @route   PUT /api/student/auth/update-profile
// @access  Private
exports.updateProfile = catchAsync(async (req, res, next) => {
  const { name, school, grade, phone, bio, preferredLanguage } = req.body;

  const user = await User.findById(req.userId);

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  if (name) user.name = name;
  if (school) user.school = school;
  if (grade) user.grade = grade;
  if (phone) user.phone = phone;
  if (bio !== undefined) user.bio = bio;
  if (preferredLanguage) user.preferredLanguage = preferredLanguage;

  await user.save({ validateBeforeSave: false });

  logger.info(`Student profile updated — User: ${user._id}`);

  return successResponse(res, "Profile updated successfully", {
    user: user.getPublicProfile(),
  });
});

// ── UPLOAD AVATAR ──────────────────────────────────────────

// @desc    Upload student avatar
// @route   POST /api/student/auth/upload-avatar
// @access  Private
exports.uploadAvatar = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return errorResponse(res, "Please upload an image file", 400);
  }

  const user = await User.findById(req.userId);

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  // Delete old avatar from Cloudinary if exists
  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId);
  }

  // Upload new avatar to Cloudinary
  const fileInfo = getFileInfo(req.file);
  const base64Image = `data:${fileInfo.mimeType};base64,${fileInfo.buffer.toString("base64")}`;

  const uploadResult = await uploadImage(base64Image, "heroy/student-avatars");

  if (!uploadResult.success) {
    return errorResponse(res, "Image upload failed. Please try again", 500);
  }

  // Update user with new avatar
  user.avatar = uploadResult.url;
  user.avatarPublicId = uploadResult.publicId;
  await user.save({ validateBeforeSave: false });

  logger.info(`Student avatar uploaded — User: ${user._id}`);

  return successResponse(res, "Avatar uploaded successfully", {
    avatar: uploadResult.url,
    user: user.getPublicProfile(),
  });
});

// ── DELETE ACCOUNT ─────────────────────────────────────────

// @desc    Delete student account
// @route   DELETE /api/student/auth/delete-account
// @access  Private
exports.deleteAccount = catchAsync(async (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return errorResponse(
      res,
      "Please provide your password to confirm account deletion",
      400,
    );
  }

  const user = await User.findById(req.userId).select("+password");

  if (!user) {
    return notFoundResponse(res, "User not found");
  }

  // Verify password
  const isPasswordCorrect = await user.comparePassword(password);
  if (!isPasswordCorrect) {
    return unauthorizedResponse(res, "Incorrect password");
  }

  // Delete avatar from Cloudinary
  if (user.avatarPublicId) {
    await deleteImage(user.avatarPublicId);
  }

  // Invalidate all sessions
  await Session.invalidateAllByUser(user._id, "user_logout");

  // Soft delete account
  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save({ validateBeforeSave: false });

  logger.logAuth("StudentDeleteAccount", user._id, "student");

  return successResponse(res, "Account deleted successfully");
});
