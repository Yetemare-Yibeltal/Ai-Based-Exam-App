const express = require("express");
const router = express.Router();

const { protect } = require("../../middleware/auth");
const { adminOnly } = require("../../middleware/role");

const {
  getSettings,
  updateSettings,
  getSystemInfo,
  clearCache,
  getActivityLog,
  sendAnnouncement,
} = require("../../controllers/admin/settingsController");

router.use(protect);
router.use(adminOnly);

router.get("/", getSettings);
router.put("/", updateSettings);
router.get("/system", getSystemInfo);
router.post("/clear-cache", clearCache);
router.get("/activity-log", getActivityLog);
router.post("/announcement", sendAnnouncement);

module.exports = router;
