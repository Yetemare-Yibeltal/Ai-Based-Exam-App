const express = require('express');
const router = express.Router();

const { protect } = require('../../middleware/auth');
const { restrictTo } = require('../../middleware/role');
const { authLimiter, passwordResetLimiter, otpLimiter } = require('../../middleware/rateLimiter');
const { validateLogin, validateResetPassword, validateChangePassword, validateForgotPassword } = require('../../middleware/validate');
const { uploadAvatar } = require('../../middleware/upload');

const {
  login,
  logout,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  getMe,
  updateProfile,
  uploadAvatar: uploadAvatarController,
} = require('../../controllers/admin/authController');

router.post('/login', authLimiter, validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', otpLimiter, validateResetPassword, resetPassword);

router.post('/logout', protect, restrictTo('admin'), logout);
router.get('/me', protect, restrictTo('admin'), getMe);
router.put('/update-profile', protect, restrictTo('admin'), updateProfile);
router.put('/change-password', protect, restrictTo('admin'), validateChangePassword, changePassword);
router.post('/upload-avatar', protect, restrictTo('admin'), uploadAvatar, uploadAvatarController);

module.exports = router;