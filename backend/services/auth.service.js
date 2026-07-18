const User = require("../models/User");
const Teacher = require("../models/Teacher");
const Admin = require("../models/Admin");
const Session = require("../models/Session");
const {
  generateTokenPair,
  getTokenExpiry,
  verifyRefreshToken,
} = require("../utils/generateToken");
const {
  generateEmailVerificationOTP,
  generatePasswordResetOTP,
  hashOTP,
  verifyOTP,
  isOTPExpired,
} = require("../utils/otpGenerator");
const {
  sendWelcomeEmail,
  sendEmailVerificationOTP,
  sendPasswordResetOTP,
  sendPasswordChangedEmail,
} = require("../utils/sendEmail");
const { uploadImage, deleteImage } = require("../config/cloudinary");
const logger = require("../utils/logger");
const crypto = require("crypto");

const getModelByRole = (role) => {
  if (role === "teacher") return Teacher;
  if (role === "admin") return Admin;
  return User;
};

const createSession = async (userId, userModel, role, refreshToken, req) => {
  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  return Session.create({
    userId,
    userModel,
    role,
    refreshToken,
    refreshTokenHash,
    ipAddress: req.ip,
    deviceInfo: { userAgent: req.headers["user-agent"] || null },
    expiresAt: getTokenExpiry(process.env.JWT_REFRESH_EXPIRE || "30d"),
  });
};

const invalidateSession = async (refreshToken) => {
  if (!refreshToken) return;

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const session = await Session.findOne({ refreshTokenHash, isActive: true });
  if (session) await session.invalidate("user_logout");
};

const rotateRefreshToken = async (
  oldRefreshToken,
  userId,
  userModel,
  role,
  req,
) => {
  const { valid, expired, decoded } = verifyRefreshToken(oldRefreshToken);

  if (!valid) {
    throw new Error(
      expired
        ? "Session expired. Please log in again"
        : "Invalid refresh token",
    );
  }

  const oldHash = crypto
    .createHash("sha256")
    .update(oldRefreshToken)
    .digest("hex");
  const oldSession = await Session.findByRefreshTokenHash(oldHash);

  if (!oldSession) throw new Error("Session not found. Please log in again");

  const { accessToken, refreshToken: newRefreshToken } = generateTokenPair({
    id: userId,
    role,
    email: decoded.email,
  });

  await oldSession.invalidate("user_logout");
  await createSession(userId, userModel, role, newRefreshToken, req);

  return { accessToken, refreshToken: newRefreshToken };
};

const registerStudent = async (userData, req) => {
  const { name, email, password, grade, school } = userData;

  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw new Error("An account with this email already exists");

  const { otp, expiresAt } = generateEmailVerificationOTP();
  const hashedOTP = hashOTP(otp);

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    grade: grade || "Grade 12",
    school: school || "Not specified",
    emailVerificationOTP: hashedOTP,
    emailVerificationOTPExpiry: expiresAt,
  });

  const { accessToken, refreshToken } = generateTokenPair({
    id: user._id,
    role: "student",
    email: user.email,
  });

  await createSession(user._id, "User", "student", refreshToken, req);
  await sendWelcomeEmail(user);
  await sendEmailVerificationOTP(user, otp);
  await user.updateLoginInfo(req.ip);

  logger.logAuth("Register", user._id, "student");

  return { user: user.getPublicProfile(), accessToken, refreshToken };
};

const loginUser = async (email, password, role, req) => {
  const Model = getModelByRole(role);
  const modelName =
    role === "teacher" ? "Teacher" : role === "admin" ? "Admin" : "User";

  const user = await Model.findOne({ email: email.toLowerCase() }).select(
    "+password",
  );

  if (!user || !(await user.comparePassword(password))) {
    throw new Error("Invalid email or password");
  }

  if (!user.isActive)
    throw new Error(
      "Your account has been deactivated. Please contact support",
    );
  if (user.isBanned)
    throw new Error(
      `Your account has been banned. Reason: ${user.banReason || "Violation of terms"}`,
    );

  if (role === "teacher" && !user.isApproved) {
    throw new Error("Your teacher account is pending admin approval");
  }

  const { accessToken, refreshToken } = generateTokenPair({
    id: user._id,
    role,
    email: user.email,
  });

  await createSession(user._id, modelName, role, refreshToken, req);
  await user.updateLoginInfo(req.ip);

  logger.logAuth("Login", user._id, role);

  return {
    user: user.getPublicProfile(),
    accessToken,
    refreshToken,
    isEmailVerified: user.isEmailVerified,
  };
};

const verifyUserEmail = async (email, otp, role) => {
  const Model = getModelByRole(role);

  const user = await Model.findOne({
    email: email.toLowerCase(),
  }).select("+emailVerificationOTP +emailVerificationOTPExpiry");

  if (!user) throw new Error("No account found with this email");
  if (user.isEmailVerified) return { alreadyVerified: true };
  if (!user.emailVerificationOTP)
    throw new Error("No verification OTP found. Please request a new one");
  if (isOTPExpired(user.emailVerificationOTPExpiry))
    throw new Error("OTP has expired. Please request a new one");

  const isValid = verifyOTP(otp, user.emailVerificationOTP);
  if (!isValid) throw new Error("Invalid OTP. Please check and try again");

  user.isEmailVerified = true;
  user.emailVerificationOTP = null;
  user.emailVerificationOTPExpiry = null;
  await user.save({ validateBeforeSave: false });

  logger.logAuth("EmailVerified", user._id, role);

  return { verified: true, userId: user._id };
};

const resendVerificationEmail = async (email, role) => {
  const Model = getModelByRole(role);

  const user = await Model.findOne({
    email: email.toLowerCase(),
  }).select("+emailVerificationOTP +emailVerificationOTPExpiry");

  if (!user) throw new Error("No account found with this email");
  if (user.isEmailVerified) return { alreadyVerified: true };

  const { otp, expiresAt } = generateEmailVerificationOTP();
  user.emailVerificationOTP = hashOTP(otp);
  user.emailVerificationOTPExpiry = expiresAt;
  await user.save({ validateBeforeSave: false });

  await sendEmailVerificationOTP(user, otp);

  return { sent: true };
};

const sendPasswordReset = async (email, role) => {
  const Model = getModelByRole(role);
  const user = await Model.findOne({ email: email.toLowerCase() });

  if (!user || !user.isActive) return { sent: true };

  const { otp, expiresAt } = generatePasswordResetOTP();
  user.passwordResetOTP = hashOTP(otp);
  user.passwordResetOTPExpiry = expiresAt;
  await user.save({ validateBeforeSave: false });

  await sendPasswordResetOTP(user, otp);

  logger.logAuth("ForgotPassword", user._id, role);

  return { sent: true };
};

const resetUserPassword = async (email, otp, newPassword, role) => {
  const Model = getModelByRole(role);

  const user = await Model.findOne({
    email: email.toLowerCase(),
  }).select("+password +passwordResetOTP +passwordResetOTPExpiry");

  if (!user) throw new Error("No account found with this email");
  if (!user.passwordResetOTP)
    throw new Error("No reset request found. Please request a new OTP");
  if (isOTPExpired(user.passwordResetOTPExpiry))
    throw new Error("OTP has expired. Please request a new one");

  const isValid = verifyOTP(otp, user.passwordResetOTP);
  if (!isValid) throw new Error("Invalid OTP. Please check and try again");

  const isSame = await user.comparePassword(newPassword);
  if (isSame)
    throw new Error("New password cannot be the same as current password");

  user.password = newPassword;
  user.passwordResetOTP = null;
  user.passwordResetOTPExpiry = null;
  await user.save();

  await Session.invalidateAllByUser(user._id, "password_changed");
  await sendPasswordChangedEmail(user);

  logger.logAuth("ResetPassword", user._id, role);

  return { reset: true };
};

const changeUserPassword = async (
  userId,
  currentPassword,
  newPassword,
  role,
) => {
  const Model = getModelByRole(role);
  const user = await Model.findById(userId).select("+password");

  if (!user) throw new Error("User not found");

  const isCorrect = await user.comparePassword(currentPassword);
  if (!isCorrect) throw new Error("Current password is incorrect");

  const isSame = await user.comparePassword(newPassword);
  if (isSame)
    throw new Error("New password cannot be the same as current password");

  user.password = newPassword;
  await user.save();

  await Session.invalidateAllByUser(userId, "password_changed");
  await sendPasswordChangedEmail(user);

  logger.logAuth("ChangePassword", userId, role);

  return { changed: true };
};

const uploadUserAvatar = async (userId, file, role, folder) => {
  const Model = getModelByRole(role);
  const user = await Model.findById(userId);

  if (!user) throw new Error("User not found");
  if (!file) throw new Error("Please select an image file to upload");

  if (user.avatarPublicId) await deleteImage(user.avatarPublicId);

  const base64Image = `data:${file.mimetype};base64,${file.buffer.toString("base64")}`;
  const uploadResult = await uploadImage(base64Image, folder);

  if (!uploadResult.success)
    throw new Error("Image upload failed. Please try again");

  user.avatar = uploadResult.url;
  user.avatarPublicId = uploadResult.publicId;
  await user.save({ validateBeforeSave: false });

  logger.info(`Avatar uploaded — User: ${userId} — Role: ${role}`);

  return { avatar: uploadResult.url, user: user.getPublicProfile() };
};

const deleteUserAccount = async (userId, password, role) => {
  const Model = getModelByRole(role);
  const user = await Model.findById(userId).select("+password");

  if (!user) throw new Error("User not found");

  const isCorrect = await user.comparePassword(password);
  if (!isCorrect) throw new Error("Incorrect password");

  if (user.avatarPublicId) await deleteImage(user.avatarPublicId);

  await Session.invalidateAllByUser(userId, "user_logout");

  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save({ validateBeforeSave: false });

  logger.logAuth("DeleteAccount", userId, role);

  return { deleted: true };
};

module.exports = {
  createSession,
  invalidateSession,
  rotateRefreshToken,
  registerStudent,
  loginUser,
  verifyUserEmail,
  resendVerificationEmail,
  sendPasswordReset,
  resetUserPassword,
  changeUserPassword,
  uploadUserAvatar,
  deleteUserAccount,
  getModelByRole,
};
