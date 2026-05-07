const express = require("express");
const router = express.Router();
const { userSockets } = require("./chat.handler");

// 채팅 금지/해제 알림 (프론트가 호출)
router.post("/ban-notify", (req, res) => {
  const { username, isBanned } = req.body;

  if (!username) {
    return res.status(400).json({ error: "username이 없습니다." });
  }

  const targetWs = userSockets.get(username);
  if (targetWs && targetWs.readyState === 1) {
    targetWs.send(
      JSON.stringify({
        type: isBanned ? "CHAT_BANNED" : "CHAT_UNBANNED",
      }),
    );
    console.log(`[ban-notify] ${username} → ${isBanned ? "금지" : "해제"} 알림 전송`);
  } else {
    console.log(`[ban-notify] ${username} 소켓 없음 (오프라인)`);
  }

  res.status(200).json({ ok: true });
});

router.get("/", (req, res) => {});

module.exports = router;
