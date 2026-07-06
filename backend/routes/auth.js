const express = require("express");
const router = express.Router();

// Import middleware
const { protect } = require("../middleware/auth");
const {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  otpLimiter,
  emailLimiter,
} = require("../middleware/rateLimiter");
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateVerifyOTP,
} = require("../middleware/validate");
const { uploadAvatar } = require("../middleware/upload");

// Import controllers
const {
  register,
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
  deleteAccount,
} = require("../controllers/authController");

// ── PUBLIC ROUTES ──────────────────────────────────────────

// @route   POST /api/auth/register
// @desc    Register a new student account
// @access  Public
router.post("/register", registerLimiter, validateRegister, register);

// @route   POST /api/auth/login
// @desc    Login student and get JWT token
// @access  Public
router.post("/login", authLimiter, validateLogin, login);

// @route   POST /api/auth/refresh-token
// @desc    Refresh access token using refresh token
// @access  Public
router.post("/refresh-token", refreshToken);

// @route   POST /api/auth/forgot-password
// @desc    Send password reset OTP to email
// @access  Public
router.post(
  "/forgot-password",
  passwordResetLimiter,
  validateForgotPassword,
  forgotPassword,
);

// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post(
  "/reset-password",
  otpLimiter,
  validateResetPassword,
  resetPassword,
);

// @route   POST /api/auth/verify-email
// @desc    Verify email using OTP
// @access  Public
router.post("/verify-email", otpLimiter, validateVerifyOTP, verifyEmail);

// @route   POST /api/auth/resend-verification
// @desc    Resend email verification OTP
// @access  Public
router.post("/resend-verification", emailLimiter, resendVerificationOTP);

// ── PROTECTED ROUTES ───────────────────────────────────────

// @route   POST /api/auth/logout
// @desc    Logout student and invalidate session
// @access  Private
router.post("/logout", protect, logout);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, getMe);

// @route   PUT /api/auth/update-profile
// @desc    Update student profile
// @access  Private
router.put("/update-profile", protect, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Change password when logged in
// @access  Private
router.put("/change-password", protect, validateChangePassword, changePassword);

// @route   POST /api/auth/upload-avatar
// @desc    Upload profile avatar
// @access  Private
router.post("/upload-avatar", protect, uploadAvatar, uploadAvatarController);

// @route   DELETE /api/auth/delete-account
// @desc    Delete student account
// @access  Private
router.delete("/delete-account", protect, deleteAccount);

module.exports = router;
