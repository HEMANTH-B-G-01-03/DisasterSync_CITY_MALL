const express = require("express");
const { getNotifications, markAllAsRead } = require("../controllers/notificationContoller");
const router = express.Router();

router.get("/:userId", getNotifications);
router.post("/mark-read", markAllAsRead);

module.exports = router;
