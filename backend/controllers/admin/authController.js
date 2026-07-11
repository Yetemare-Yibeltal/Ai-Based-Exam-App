const Admin = require('../../models/Admin');
const Session = require('../../models/Session');
const { catchAsync } = require('../../middleware/errorHandler');
const {
  generateTokenPair,
  getTokenExpiry,
  verifyRefreshToken,
} = require('../../utils/generateToken');
const {
  generatePasswordResetOTP,
  hashOTP,
  verifyOTP,
  isOTPExpired,
} = require('../../utils/otpGenerator');
const {
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
} = require('../../utils/sendEmail');
const {
  successResponse,
  errorResponse,
  unauthorizedResponse,
  notFoundResponse,
} = require('../../utils/apiResponse');
const { uploadImage, deleteImage } = require('../../config/cloudinary');
const { getFileInfo } = require('../../middleware/upload');
const logger = require('../../utils/logger');
const crypto = require('crypto');

exports.login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({
    email: email.toLowerCase(),
  }).select('+password');

  if (!admin || !(await admin.comparePassword(password))) {
    return unauthorizedResponse(res, 'Invalid email or password');
  }

  if (!admin.isActive) {
    return unauthorizedResponse(res, 'Your admin account has been deactivated');
  }

  const { accessToken, refreshToken } = generateTokenPair({
    id: admin._id,
    role: 'admin',
    email: admin.email,
  });

  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  await Session.create({
    userId: admin._id,
    userModel: 'Admin',
    role: 'admin',
    refreshToken,
    refreshTokenHash,
    ipAddress: req.ip,
    deviceInfo: { userAgent: req.headers['user-agent'] || null },
    expiresAt: getTokenExpiry(process.env.JWT_REFRESH_EXPIRE || '30d'),
  });

  await admin.updateLoginInfo(req.ip);
  await admin.logActivity('login', 'Admin', admin._id, 'Admin logged in', req.ip);

  logger.logAuth('AdminLogin', admin._id, 'admin');

  return successResponse(res, 'Admin login successful', {
    admin: admin.getPublicProfile(),
    accessToken,
    refreshToken,
  });
});

exports.logout = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (refreshToken) {
    const refreshTokenHash = crypto
      .createHash('sha256')
      .update(refreshToken)
      .digest('hex');

    const session = await Session.findOne({ refreshTokenHash, isActive: true });
    if (session) await session.invalidate('user_logout');
  }

  const admin = await Admin.findById(req.userId);
  if (admin) await admin.logActivity('logout', 'Admin', admin._id, 'Admin logged out', req.ip);

  logger.logAuth('AdminLogout', req.userId, 'admin');

  return successResponse(res, 'Logged out successfully');
});

exports.refreshToken = catchAsync(async (req, res) => {
  const { refreshToken } = req.body;

  if (!refreshToken) return unauthorizedResponse(res, 'Refresh token is required');

  const { valid, expired, decoded } = verifyRefreshToken(refreshToken);

  if (!valid) {
    return unauthorizedResponse(res, expired ? 'Session expired. Please log in again' : 'Invalid refresh token');
  }

  const refreshTokenHash = crypto
    .createHash('sha256')
    .update(refreshToken)
    .digest('hex');

  const session = await Session.findByRefreshTokenHash(refreshTokenHash);
  if (!session) return unauthorizedResponse(res, 'Session not found. Please log in again');

  const admin = await Admin.findById(decoded.id);
  if (!admin || !admin.isActive) {
    await session.invalidate('account_banned');
    return unauthorizedResponse(res, 'Account not found or deactivated');
  }

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
    id: admin._id,
    role: 'admin',
    email: admin.email,
  });

  await session.invalidate('user_logout');

  const newRefreshTokenHash = crypto
    .createHash('sha256')
    .update(newRefreshToken)
    .digest('hex');

  await Session.create({
    userId: admin._id,
    userModel: 'Admin',
    role: 'admin',
    refreshToken: newRefreshToken,
    refreshTokenHash: newRefreshTokenHash,
    ipAddress: req.ip,
    deviceInfo: session.deviceInfo,
    expiresAt: getTokenExpiry(process.env.JWT_REFRESH_EXPIRE || '30d'),
  });

  return successResponse(res, 'Token refreshed successfully', {
    accessToken,
    refreshToken: newRefreshToken,
  });
});

exports.forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body;
  const admin = await Admin.findOne({ email: email.toLowerCase() });

  if (!admin || !admin.isActive) {
    return successResponse(res, 'If an account exists with this email, a reset OTP has been sent');
  }

  const { otp, expiresAt } = generatePasswordResetOTP();
  admin.passwordResetOTP = hashOTP(otp);
  admin.passwordResetOTPExpiry = expiresAt;
  await admin.save({ validateBeforeSave: false });

  await sendPasswordResetOTP(admin, otp);

  logger.logAuth('AdminForgotPassword', admin._id, 'admin');

  return successResponse(res, 'If an account exists with this email, a reset OTP has been sent');
});

exports.resetPassword = catchAsync(async (req, res) => {
  const { email, otp, newPassword } = req.body;

  const admin = await Admin.findOne({
    email: email.toLowerCase(),
  }).select('+password +passwordResetOTP +passwordResetOTPExpiry');

  if (!admin) return notFoundResponse(res, 'No account found with this email');
  if (!admin.passwordResetOTP) return errorResponse(res, 'No reset request found. Please request a new OTP', 400);
  if (isOTPExpired(admin.passwordResetOTPExpiry)) return errorResponse(res, 'OTP has expired. Please request a new one', 400);

  const isValid = verifyOTP(otp, admin.passwordResetOTP);
  if (!isValid) return errorResponse(res, 'Invalid OTP. Please check and try again', 400);

  const isSame = await admin.comparePassword(newPassword);
  if (isSame) return errorResponse(res, 'New password cannot be the same as current password', 400);

  admin.password = newPassword;
  admin.passwordResetOTP = null;
  admin.passwordResetOTPExpiry = null;
  await admin.save();

  await Session.invalidateAllByUser(admin._id, 'password_changed');
  await sendPasswordChangedEmail(admin);

  logger.logAuth('AdminResetPassword', admin._id, 'admin');

  return successResponse(res, 'Password reset successfully. Please log in again');
});

exports.changePassword = catchAsync(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const admin = await Admin.findById(req.userId).select('+password');
  if (!admin) return notFoundResponse(res, 'Admin not found');

  const isCorrect = await admin.comparePassword(currentPassword);
  if (!isCorrect) return unauthorizedResponse(res, 'Current password is incorrect');

  const isSame = await admin.comparePassword(newPassword);
  if (isSame) return errorResponse(res, 'New password cannot be the same as current password', 400);

  admin.password = newPassword;
  await admin.save();

  await Session.invalidateAllByUser(admin._id, 'password_changed');
  await sendPasswordChangedEmail(admin);

  await admin.logActivity('change_password', 'Admin', admin._id, 'Password changed', req.ip);

  logger.logAuth('AdminChangePassword', admin._id, 'admin');

  return successResponse(res, 'Password changed successfully. Please log in again');
});

exports.getMe = catchAsync(async (req, res) => {
  const admin = await Admin.findById(req.userId);
  if (!admin) return notFoundResponse(res, 'Admin not found');

  return successResponse(res, 'Profile retrieved successfully', {
    admin: admin.getPublicProfile(),
  });
});

exports.updateProfile = catchAsync(async (req, res) => {
  const { name, phone, preferredLanguage, notificationsEnabled, emailNotificationsEnabled } = req.body;

  const admin = await Admin.findById(req.userId);
  if (!admin) return notFoundResponse(res, 'Admin not found');

  if (name !== undefined) admin.name = name;
  if (phone !== undefined) admin.phone = phone;
  if (preferredLanguage !== undefined) admin.preferredLanguage = preferredLanguage;
  if (notificationsEnabled !== undefined) admin.notificationsEnabled = notificationsEnabled;
  if (emailNotificationsEnabled !== undefined) admin.emailNotificationsEnabled = emailNotificationsEnabled;

  await admin.save({ validateBeforeSave: false });

  logger.info(`Admin profile updated — Admin: ${req.userId}`);

  return successResponse(res, 'Profile updated successfully', {
    admin: admin.getPublicProfile(),
  });
});

exports.uploadAvatar = catchAsync(async (req, res) => {
  if (!req.file) return errorResponse(res, 'Please select an image file', 400);

  const admin = await Admin.findById(req.userId);
  if (!admin) return notFoundResponse(res, 'Admin not found');

  if (admin.avatarPublicId) await deleteImage(admin.avatarPublicId);

  const fileInfo = getFileInfo(req.file);
  const base64Image = `data:${fileInfo.mimeType};base64,${fileInfo.buffer.toString('base64')}`;
  const uploadResult = await uploadImage(base64Image, 'heroy/avatars/admins');

  if (!uploadResult.success) return errorResponse(res, 'Image upload failed. Please try again', 500);

  admin.avatar = uploadResult.url;
  admin.avatarPublicId = uploadResult.publicId;
  await admin.save({ validateBeforeSave: false });

  logger.info(`Admin avatar uploaded — Admin: ${req.userId}`);

  return successResponse(res, 'Avatar uploaded successfully', {
    avatar: uploadResult.url,
    admin: admin.getPublicProfile(),
  });
});