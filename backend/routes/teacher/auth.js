const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const {
  authLimiter,
  passwordResetLimiter,
  otpLimiter,
  emailLimiter,
} = require("../../middleware/rateLimiter");
const {
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateVerifyOTP,
} = require("../../middleware/validate");
const { uploadAvatar } = require("../../middleware/upload");

const {
  login,
  logout,
  refreshToken,
  verifyEmail,
  resendVerificationOTP,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
  uploadAvatar: uploadAvatarController,
} = require("../../controllers/teacher/authController");

router.post("/login", authLimiter, validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateForgotPassword,
  forgotPassword,
);
router.post(
  "/reset-password",
  otpLimiter,
  validateResetPassword,
  resetPassword,
);
router.post("/verify-email", otpLimiter, validateVerifyOTP, verifyEmail);
router.post("/resend-verification", emailLimiter, resendVerificationOTP);

router.post("/logout", protect, restrictTo("teacher"), logout);
router.get("/me", protect, restrictTo("teacher"), getMe);
router.put("/update-profile", protect, restrictTo("teacher"), updateProfile);
router.put(
  "/change-password",
  protect,
  restrictTo("teacher"),
  validateChangePassword,
  changePassword,
);
router.post(
  "/upload-avatar",
  protect,
  restrictTo("teacher"),
  uploadAvatar,
  uploadAvatarController,
);

module.exports = router;
