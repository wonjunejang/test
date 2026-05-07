import { useEffect } from "react";
import { Client } from "@stomp/stompjs";
import useNotificationStore from "../features/notification/store/useNotificationStore";
import useToastStore from "../features/notification/store/useToastStore";

export function useNotification(username: string | null) {
  const increaseUnread = useNotificationStore((s) => s.increaseUnread);
  const triggerRefresh = useNotificationStore((s) => s.triggerRefresh);

  // 알림 수신 모달창
  const showToast = useToastStore((s) => s.showToast);

  useEffect(() => {
    if (!username) return;

    const client = new Client({
      brokerURL: import.meta.env.VITE_WS_URL,

      onConnect: () => {
        console.log("WebSocket Connected!");
        
        client.subscribe(`/topic/notify/${username}`, (message) => {
            const newNoti = JSON.parse(message.body);
            console.log("New Notification received:", newNoti);

            // 1. 모달(토스트) 띄우기
            const raw = newNoti.content?.split('\n')[0] ?? '';
            showToast(raw, newNoti.projectName, newNoti.type, newNoti.action);
            
            // 실시간 알림
            increaseUnread();   // 벨 뱃지 +1
            triggerRefresh();   // NotificationList 자동 새로고침
        });
      },
      onStompError: (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        },
        onWebSocketClose: (event) => {
            console.log("WebSocket Closed: ", event);
        },
      debug: (str) => { console.log(str); }, // 연결 로그 확인용
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.activate();
    return () => { client.deactivate(); };
  }, [username]);
}