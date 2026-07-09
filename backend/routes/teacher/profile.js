const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { restrictTo } = require("../../middleware/role");
const { uploadAvatar } = require("../../middleware/upload");
const { validatePaginationQuery } = require("../../middleware/validate");

const {
  getProfile,
  updateProfile,
  uploadAvatar: uploadAvatarController,
  deleteAvatar,
  getMyStats,
  getMyAIUsage,
} = require("../../controllers/teacher/profileController");

router.use(protect);
router.use(restrictTo("teacher"));

router.get("/", getProfile);
router.put("/", updateProfile);
router.post("/avatar", uploadAvatar, uploadAvatarController);
router.delete("/avatar", deleteAvatar);
router.get("/stats", getMyStats);
router.get("/ai-usage", getMyAIUsage);

module.exports = router;
