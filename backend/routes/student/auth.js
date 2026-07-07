const express = require('express');
const router = express.Router();

// Import middleware
const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const {
  authLimiter,
  registerLimiter,
  passwordResetLimiter,
  otpLimiter,
  emailLimiter,
} = require('../../middleware/rateLimiter');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateResetPassword,
  validateChangePassword,
  validateVerifyOTP,
} = require('../../middleware/validate');
const { uploadAvatar } = require('../../middleware/upload');

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
} = require('../../controllers/student/authController');

// ── PUBLIC ROUTES ──────────────────────────────────────────

// @route   POST /api/student/auth/register
// @desc    Register a new student account
// @access  Public
router.post('/register', registerLimiter, validateRegister, register);

// @route   POST /api/student/auth/login
// @desc    Login student
// @access  Public
router.post('/login', authLimiter, validateLogin, login);

// @route   POST /api/student/auth/refresh-token
// @desc    Refresh access token
// @access  Public
router.post('/refresh-token', refreshToken);

// @route   POST /api/student/auth/forgot-password
// @desc    Send password reset OTP
// @access  Public
router.post(
  '/forgot-password',
  passwordResetLimiter,
  validateForgotPassword,
  forgotPassword
);

// @route   POST /api/student/auth/reset-password
// @desc    Reset password using OTP
// @access  Public
router.post(
  '/reset-password',
  otpLimiter,
  validateResetPassword,
  resetPassword
);

// @route   POST /api/student/auth/verify-email
// @desc    Verify email using OTP
// @access  Public
router.post('/verify-email', otpLimiter, validateVerifyOTP, verifyEmail);

// @route   POST /api/student/auth/resend-verification
// @desc    Resend email verification OTP
// @access  Public
router.post(
  '/resend-verification',
  emailLimiter,
  resendVerificationOTP
);

// ── PROTECTED ROUTES ───────────────────────────────────────

// @route   POST /api/student/auth/logout
// @desc    Logout student
// @access  Private - Student
router.post('/logout', protect, restrictTo('student'), logout);

// @route   GET /api/student/auth/me
// @desc    Get current logged in student
// @access  Private - Student
router.get('/me', protect, restrictTo('student'), getMe);

// @route   PUT /api/student/auth/update-profile
// @desc    Update student profile
// @access  Private - Student
router.put(
  '/update-profile',
  protect,
  restrictTo('student'),
  updateProfile
);

// @route   PUT /api/student/auth/change-password
// @desc    Change password
// @access  Private - Student
router.put(
  '/change-password',
  protect,
  restrictTo('student'),
  validateChangePassword,
  changePassword
);

// @route   POST /api/student/auth/upload-avatar
// @desc    Upload profile avatar
// @access  Private - Student
router.post(
  '/upload-avatar',
  protect,
  restrictTo('student'),
  uploadAvatar,
  uploadAvatarController
);

// @route   DELETE /api/student/auth/delete-account
// @desc    Delete student account
// @access  Private - Student
router.delete(
  '/delete-account',
  protect,
  restrictTo('student'),
  deleteAccount
);

module.exports = router;