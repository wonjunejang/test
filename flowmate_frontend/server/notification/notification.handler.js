function notificationHandler(ws, wss) {
  console.log("notification 클라이언트 연결됨 (임시 핸들러)");

  ws.on("message", (message) => {
    console.log("notification 메시지 수신:", message);
  });

  ws.on("close", () => {
    console.log("notification 클라이언트 연결 종료");
  });
}

module.exports = notificationHandler;
