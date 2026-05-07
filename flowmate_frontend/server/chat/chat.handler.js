const rooms = new Map();
const userSockets = new Map();

const VITE_API_URL = process.env.VITE_API_URL;

// 토큰으로 Spring 검증
async function verifySession(token) {
  if (!VITE_API_URL) {
    console.error("VITE_API_URL 환경변수가 설정되지 않았습니다.");
    return null;
  }

  try {
    const res = await fetch(`${VITE_API_URL}/chat/token/verify?token=${token}`);

    if (!res.ok) return null;
    const json = await res.json();
    const username = json.username ?? null;
    const jsessionId = json.jsessionId ?? null;
    if (!username || !jsessionId) return null;
    return { username, jsessionId };
  } catch (err) {
    console.error("토큰 검증 실패", err);
    return null;
  }
}

function joinRoom(ws, roomId) {
  if (!rooms.has(roomId)) rooms.set(roomId, new Set());
  rooms.get(roomId).add(ws);
  ws.roomId = roomId;
}

function leaveRoom(ws) {
  const roomId = ws.roomId;
  if (!roomId || !rooms.has(roomId)) return;
  rooms.get(roomId).delete(ws);
  if (rooms.get(roomId).size === 0) rooms.delete(roomId);
  if (ws.username) userSockets.delete(ws.username);
}

function broadcast(roomId, message) {
  console.log(
    "[broadcast] roomId:",
    roomId,
    "rooms 키 목록:",
    [...rooms.keys()],
    "해당 방 인원:",
    rooms.get(roomId)?.size,
  );
  if (!rooms.has(roomId)) return;
  const payload = JSON.stringify(message);
  rooms.get(roomId).forEach((client) => {
    if (client.readyState === 1) {
      client.send(payload);
    }
  });
}

function sendWhisper(senderWs, targetUsername, message) {
  const payload = JSON.stringify(message);

  if (senderWs.readyState === 1) {
    senderWs.send(payload);
  }

  const targetWs = userSockets.get(targetUsername);
  if (targetWs && targetWs.readyState === 1) {
    targetWs.send(payload);
  } else {
    console.error(`귓속말 대상 없음 또는 연결 끊김: ${targetUsername}`);
  }
}

async function saveMessage(roomId, messageData, sessionId, senderUsername) {
  if (!VITE_API_URL) return null;

  const isWhisper = messageData.type === "WHISPER";
  const endpoint = isWhisper
    ? `${VITE_API_URL}/chat/rooms/${roomId}/whisper`
    : `${VITE_API_URL}/chat/rooms/${roomId}/messages`;

  const body = isWhisper
    ? {
        receiverUsername: messageData.targetUserId,
        chatMessageContent: messageData.content,
        senderUsername: senderUsername,
      }
    : { chatMessageContent: messageData.content, senderUsername: senderUsername };

  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `JSESSIONID=${sessionId}`,
      },
      body: JSON.stringify(body),
    });

    console.log("  [saveMessage] endpoint:", endpoint);
    console.log(
      "  [saveMessage] sessionId:",
      sessionId ? `있음 (${sessionId.slice(0, 8)}...)` : "❌ 없음",
    );
    console.log("  [saveMessage] body:", JSON.stringify(body));
    console.log("  [saveMessage] status:", res.status);

    if (!res.ok) {
      console.error("메시지 저장 실패 - status:", res.status);
      return null;
    }

    return await res.json();
  } catch (err) {
    console.error("메시지 저장 실패", err);
    return null;
  }
}

module.exports = {
  verifySession,
  joinRoom,
  leaveRoom,
  broadcast,
  sendWhisper,
  saveMessage,
  userSockets,
  rooms,
};
