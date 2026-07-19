const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const { adminOnly } = require("../middleware/role");
const {
  validateMongoId,
  validatePaginationQuery,
} = require("../middleware/validate");

const {
  getMyNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  sendAnnouncement,
  getNotificationStats,
  cleanOldNotifications,
} = require("../controllers/notificationController");

router.use(protect);

router.get("/", validatePaginationQuery, getMyNotifications);
router.get("/unread-count", getUnreadCount);
router.put("/mark-all-read", markAllAsRead);
router.delete("/delete-all", deleteAllNotifications);
router.put("/:id/read", validateMongoId("id"), markAsRead);
router.delete("/:id", validateMongoId("id"), deleteNotification);

router.post("/announce", adminOnly, sendAnnouncement);
router.get("/stats", adminOnly, getNotificationStats);
router.delete("/admin/clean", adminOnly, cleanOldNotifications);

module.exports = router;
