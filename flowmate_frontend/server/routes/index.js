const express = require("express");
const router = express.Router();
const chatRouter = require("../chat/chat.router");
const notificationRouter = require("../notification/notification.router");

router.use("/chat", chatRouter);
router.use("/notification", notificationRouter);

module.exports = router;
