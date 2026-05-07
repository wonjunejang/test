require("dotenv").config();
const express = require("express");
const http = require("http");
const cors = require("cors");
const { WebSocketServer } = require("ws");
const router = require("./routes/index");
const {
  verifySession,
  joinRoom,
  leaveRoom,
  broadcast,
  sendWhisper,
  saveMessage,
  userSockets,
  rooms,
} = require("./chat/chat.handler");

// ✅ [DEBUG] 서버 시작 시 환경변수 확인
console.log("=== 서버 환경변수 확인 ===");
console.log("VITE_API_URL:", process.env.VITE_API_URL ?? "❌ 없음");
console.log("WS_PORT:", process.env.WS_PORT ?? "없음 (기본값 5050 사용)");
console.log("========================\n");

const app = express();
app.use(express.json());

// ✅ CORS 설정
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  }),
);

app.use("/api", router);

// ✅ Health Check
app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", async (ws, req) => {
  const url = new URL(req.url, `http://localhost`);
  const roomId = url.pathname.split("/chat/")[1];

  // ✅ [DEBUG] 연결 시도 정보
  console.log("\n[연결 시도]");
  console.log("  URL:", req.url);
  console.log("  roomId:", roomId ?? "❌ 없음 (경로가 /chat/{id} 형식인지 확인)");
  console.log("  origin:", req.headers.origin ?? "없음");

  // ✅ [DEBUG] URL 쿼리에서 토큰 읽기
  const sessionId = url.searchParams.get("token") ?? null;
  console.log("  token:", sessionId ? `있음 (${sessionId.slice(0, 8)}...)` : "❌ 없음");

  if (!sessionId) {
    console.log("  → 연결 거부: token 없음\n");
    ws.close(1008, "토큰이 없습니다.");
    return;
  }

  // ✅ [DEBUG] Spring 토큰 검증 시도
  console.log("  → Spring 토큰 검증 중...");
  const result = await verifySession(sessionId);
  console.log("  → result:", result ?? "❌ null (토큰 만료 또는 API 오류)");

  if (!result) {
    console.log("  → 연결 거부: 토큰 검증 실패\n");
    ws.close(1008, "유효하지 않은 토큰입니다.");
    return;
  }

  console.log(`  → 연결 성공! username: ${result.username}, roomId: ${roomId}\n`);

  ws.username = result.username;
  ws.sessionId = result.jsessionId;
  userSockets.set(result.username, ws);

  if (roomId) joinRoom(ws, roomId);

  ws.on("message", async (raw) => {
    let data;
    try {
      data = JSON.parse(raw);
    } catch (e) {
      console.error("[메시지 파싱 오류]", e.message);
      return;
    }

    // ✅ [DEBUG] 수신 메시지 확인
    console.log("[메시지 수신]", {
      roomId: data.roomId,
      type: data.type,
      content: data.content?.slice(0, 20) + "...",
      targetUserId: data.targetUserId ?? null,
    });

    const savedMessage = await saveMessage(
      data.roomId,
      {
        content: data.content,
        type: data.type,
        targetUserId: data.targetUserId ?? null,
      },
      ws.sessionId,
      ws.username,
    );

    if (!savedMessage) {
      console.error("  → ❌ 메시지 저장 실패, 브로드캐스트 중단");
      return;
    }

    console.log("  → ✅ 메시지 저장 성공, 브로드캐스트 시작");

    if (data.type === "WHISPER") {
      sendWhisper(ws, data.targetUserId, savedMessage);
    } else {
      broadcast(String(data.roomId), savedMessage);
    }
  });

  ws.on("close", (code, reason) => {
    console.log(
      `[연결 종료] username: ${ws.username}, code: ${code}, reason: ${reason?.toString() ?? "없음"}`,
    );
    leaveRoom(ws);
  });

  ws.on("error", (err) => {
    console.error(`[소켓 오류] username: ${ws.username}`, err.message);
  });
});

const PORT = process.env.WS_PORT || 5050;
server.listen(PORT, () => {
  console.log(`\n✅ 서버 실행 중 : port ${PORT}`);
  console.log(`✅ Spring URL: ${process.env.VITE_API_URL}\n`);
});
