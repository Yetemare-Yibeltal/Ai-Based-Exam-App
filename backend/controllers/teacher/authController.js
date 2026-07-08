const Teacher = require("../../models/Teacher");
const Session = require("../../models/Session");
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

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const teacher = await Teacher.findOne({
    email: email.toLowerCase(),
  }).select("+password");

  if (!teacher || !(await teacher.comparePassword(password))) {
    return unauthorizedResponse(res, "Invalid email or password");
  }

  if (!teacher.isActive) {
    return unauthorizedResponse(
      res,
      "Your account has been deactivated. Please contact support",
    );
  }

  if (teacher.isBanned) {
    return unauthorizedResponse(
      res,
      `Your account has been banned. Reason: ${teacher.banReason || "Violation of terms"}`,
    );
  }

  if (!teacher.isApproved) {
    return unauthorizedResponse(
      res,
      "Your teacher account is pending admin approval. Please wait for approval.",
    );
  }

  const { accessToken, refreshToken } = generateTokenPair({
    id: teacher._id,
    role: "teacher",
    email: teacher.email,
  });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  await Session.create({
    userId: teacher._id,
    userModel: "Teacher",
    role: "teacher",
    refreshToken,
    refreshTokenHash,
    ipAddress: req.ip,
    deviceInfo: { userAgent: req.headers["user-agent"] || null },
    expiresAt: getTokenExpiry(process.env.JWT_REFRESH_EXPIRE || "30d"),
  });

  await teacher.updateLoginInfo(req.ip);

  logger.logAuth("TeacherLogin", teacher._id, "teacher");

  return successResponse(res, "Login successful", {
    teacher: teacher.getPublicProfile(),
    accessToken,
    refreshToken,
    isEmailVerified: teacher.isEmailVerified,
  });
});

exports.logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const refreshTokenHash = crypto
      .createHash("sha256")
      .update(refreshToken)
      .digest("hex");

    const session = await Session.findOne({ refreshTokenHash, isActive: true });
    if (session) await session.invalidate("user_logout");
  }

  logger.logAuth("TeacherLogout", req.userId, "teacher");
  return successResponse(res, "Logged out successfully");
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return unauthorizedResponse(res, "Refresh token is required");
  }

  const { valid, expired, decoded } = verifyRefreshToken(refreshToken);

  if (!valid) {
    return unauthorizedResponse(
      res,
      expired
        ? "Session expired. Please log in again"
        : "Invalid refresh token",
    );
  }

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findByRefreshTokenHash(refreshTokenHash);

  if (!session) {
    return unauthorizedResponse(res, "Session not found. Please log in again");
  }

  const teacher = await Teacher.findById(decoded.id);

  if (!teacher || !teacher.isActive) {
    await session.invalidate("account_banned");
    return unauthorizedResponse(res, "Account not found or deactivated");
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
    id: teacher._id,
    role: "teacher",
    email: teacher.email,
  });

  await session.invalidate("user_logout");

  const newRefreshTokenHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await Session.create({
    userId: teacher._id,
    userModel: "Teacher",
    role: "teacher",
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

exports.verifyEmail = catchAsync(async (req, res) => {
  const { email, otp } = req.body;

  const teacher = await Teacher.findOne({
    email: email.toLowerCase(),
  }).select("+emailVerificationOTP +emailVerificationOTPExpiry");

  if (!teacher)
    return notFoundResponse(res, "No account found with this email");
  if (teacher.isEmailVerified)
    return successResponse(res, "Email is already verified");
  if (!teacher.emailVerificationOTP)
    return errorResponse(
      res,
      "No verification OTP found. Please request a new one",
      400,
    );
  if (isOTPExpired(teacher.emailVerificationOTPExpiry))
    return errorResponse(res, "OTP has expired. Please request a new one", 400);

  const isValid = verifyOTP(otp, teacher.emailVerificationOTP);
  if (!isValid)
    return errorResponse(res, "Invalid OTP. Please check and try again", 400);

  teacher.isEmailVerified = true;
  teacher.emailVerificationOTP = null;
  teacher.emailVerificationOTPExpiry = null;
  await teacher.save({ validateBeforeSave: false });

  return successResponse(res, "Email verified successfully");
});

exports.resendVerificationOTP = catchAsync(async (req, res) => {
  const { email } = req.body;

  if (!email) return errorResponse(res, "Email is required", 400);

  const teacher = await Teacher.findOne({
    email: email.toLowerCase(),
  }).select("+emailVerificationOTP +emailVerificationOTPExpiry");

  if (!teacher)
    return notFoundResponse(res, "No account found with this email");
  if (teacher.isEmailVerified)
    return successResponse(res, "Email is already verified");

  const { otp, expiresAt } = generateEmailVerificationOTP();
  teacher.emailVerificationOTP = hashOTP(otp);
  teacher.emailVerificationOTPExpiry = expiresAt;
  await teacher.save({ validateBeforeSave: false });

  await sendEmailVerificationOTP(teacher, otp);

  return successResponse(res, "Verification OTP sent to your email");
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const teacher = await Teacher.findOne({ email: email.toLowerCase() });

  if (!teacher || !teacher.isActive) {
    return successResponse(
      res,
      "If an account exists with this email, a reset OTP has been sent",
    );
  }

  const { otp, expiresAt } = generatePasswordResetOTP();
  teacher.passwordResetOTP = hashOTP(otp);
  teacher.passwordResetOTPExpiry = expiresAt;
  await teacher.save({ validateBeforeSave: false });

  await sendPasswordResetOTP(teacher, otp);

  logger.logAuth("TeacherForgotPassword", teacher._id, "teacher");

  return successResponse(
    res,
    "If an account exists with this email, a reset OTP has been sent",
  );
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const teacher = await Teacher.findOne({
    email: email.toLowerCase(),
  }).select("+password +passwordResetOTP +passwordResetOTPExpiry");

  if (!teacher)
    return notFoundResponse(res, "No account found with this email");
  if (!teacher.passwordResetOTP)
    return errorResponse(
      res,
      "No password reset request found. Please request a new OTP",
      400,
    );
  if (isOTPExpired(teacher.passwordResetOTPExpiry))
    return errorResponse(res, "OTP has expired. Please request a new one", 400);

  const isValid = verifyOTP(otp, teacher.passwordResetOTP);
  if (!isValid)
    return errorResponse(res, "Invalid OTP. Please check and try again", 400);

  const isSame = await teacher.comparePassword(newPassword);
  if (isSame)
    return errorResponse(
      res,
      "New password cannot be the same as current password",
      400,
    );

  teacher.password = newPassword;
  teacher.passwordResetOTP = null;
  teacher.passwordResetOTPExpiry = null;
  await teacher.save();

  await Session.invalidateAllByUser(teacher._id, "password_changed");
  await sendPasswordChangedEmail(teacher);

  logger.logAuth("TeacherResetPassword", teacher._id, "teacher");

  return successResponse(
    res,
    "Password reset successfully. Please log in with your new password",
  );
});

exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const teacher = await Teacher.findById(req.userId).select("+password");
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  const isCorrect = await teacher.comparePassword(currentPassword);
  if (!isCorrect)
    return unauthorizedResponse(res, "Current password is incorrect");

  const isSame = await teacher.comparePassword(newPassword);
  if (isSame)
    return errorResponse(
      res,
      "New password cannot be the same as current password",
      400,
    );

  teacher.password = newPassword;
  await teacher.save();

  await Session.invalidateAllByUser(teacher._id, "password_changed");
  await sendPasswordChangedEmail(teacher);

  logger.logAuth("TeacherChangePassword", teacher._id, "teacher");

  return successResponse(
    res,
    "Password changed successfully. Please log in again",
  );
});

exports.getMe = catchAsync(async (req, res) => {
  const teacher = await Teacher.findById(req.userId);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  return successResponse(res, "Profile retrieved successfully", {
    teacher: teacher.getPublicProfile(),
  });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const {
    name,
    phone,
    bio,
    school,
    experience,
    qualification,
    subjects,
    preferredLanguage,
    socialLinks,
    notificationsEnabled,
    emailNotificationsEnabled,
  } = req.body;

  const teacher = await Teacher.findById(req.userId);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  if (name !== undefined) teacher.name = name;
  if (phone !== undefined) teacher.phone = phone;
  if (bio !== undefined) teacher.bio = bio;
  if (school !== undefined) teacher.school = school;
  if (experience !== undefined) teacher.experience = experience;
  if (qualification !== undefined) teacher.qualification = qualification;
  if (subjects !== undefined) teacher.subjects = subjects;
  if (preferredLanguage !== undefined)
    teacher.preferredLanguage = preferredLanguage;
  if (socialLinks !== undefined)
    teacher.socialLinks = { ...teacher.socialLinks, ...socialLinks };
  if (notificationsEnabled !== undefined)
    teacher.notificationsEnabled = notificationsEnabled;
  if (emailNotificationsEnabled !== undefined)
    teacher.emailNotificationsEnabled = emailNotificationsEnabled;

  await teacher.save({ validateBeforeSave: false });

  logger.info(`Teacher profile updated — Teacher: ${req.userId}`);

  return successResponse(res, "Profile updated successfully", {
    teacher: teacher.getPublicProfile(),
  });
});

exports.uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file)
    return errorResponse(res, "Please select an image file to upload", 400);

  const teacher = await Teacher.findById(req.userId);
  if (!teacher) return notFoundResponse(res, "Teacher not found");

  if (teacher.avatarPublicId) await deleteImage(teacher.avatarPublicId);

  const fileInfo = getFileInfo(req.file);
  const base64Image = `data:${fileInfo.mimeType};base64,${fileInfo.buffer.toString("base64")}`;
  const uploadResult = await uploadImage(base64Image, "heroy/avatars/teachers");

  if (!uploadResult.success)
    return errorResponse(res, "Image upload failed. Please try again", 500);

  teacher.avatar = uploadResult.url;
  teacher.avatarPublicId = uploadResult.publicId;
  await teacher.save({ validateBeforeSave: false });

  logger.info(`Teacher avatar uploaded — Teacher: ${req.userId}`);

  return successResponse(res, "Avatar uploaded successfully", {
    avatar: uploadResult.url,
    teacher: teacher.getPublicProfile(),
  });
});
