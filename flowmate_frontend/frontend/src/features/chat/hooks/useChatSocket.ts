import { useEffect, useRef } from "react";
import useChatStore from "../store/chatStore";
import type { RawChatMessage } from "../store/chatStore";

const WS_URL = import.meta.env.VITE_WEBSOCKET_URL as string | undefined;
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

export default function useChatSocket(roomId: number | null) {
  const socketRef = useRef<WebSocket | null>(null);
  const { addMessage, setEnvError } = useChatStore();

  useEffect(() => {
    if (!roomId) return;
    if (!WS_URL || !API_URL) {
      setEnvError(true);
      return;
    }

    setEnvError(false);

    let socket: WebSocket;

    const connect = async () => {
      try {
        const res = await fetch(`${API_URL}/chat/token`, {
          credentials: "include",
        });

        if (!res.ok) {
          console.error("토큰 발급 실패 - 로그인 상태 확인 필요");
          setEnvError(true);
          return;
        }

        const { token } = await res.json();

        socket = new WebSocket(`${WS_URL}/chat/${roomId}?token=${token}`);
        socketRef.current = socket;

        socket.onmessage = (event: MessageEvent) => {
          const raw = JSON.parse(event.data) as Record<string, unknown>;

          if (raw["type"] === "ROOM_DELETED") {
            alert((raw["message"] as string) ?? "채팅방이 삭제되었습니다.");
            useChatStore.getState().exitRoom();
            return;
          }

          if (raw["type"] === "CHAT_BANNED") {
            useChatStore.getState().setBanStatus(true);
            return;
          }

          if (raw["type"] === "CHAT_UNBANNED") {
            useChatStore.getState().setBanStatus(false);
            return;
          }

          addMessage(raw as unknown as RawChatMessage);
        };

        socket.onerror = () => {
          console.error("WebSocket 연결 오류");
        };
      } catch (err) {
        console.error("WebSocket 연결 실패", err);
        setEnvError(true);
      }
    };

    connect();

    return () => {
      if (socketRef.current) {
        socketRef.current.onmessage = null;
        socketRef.current.close();
      }
    };
  }, [roomId]);

  const sendMessage = async (
    content: string,
    type: "GROUP" | "WHISPER" = "GROUP",
    targetUserId: string | null = null,
  ): Promise<void> => {
    if (!WS_URL) {
      useChatStore.getState().setEnvError(true);
      return;
    }

    if (socketRef.current?.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(
      JSON.stringify({
        roomId,
        content,
        type,
        targetUserId,
      }),
    );
  };

  return { sendMessage };
}
