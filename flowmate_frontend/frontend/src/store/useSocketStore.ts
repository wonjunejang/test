import { create } from "zustand";
import { Client, type IMessage } from "@stomp/stompjs";

const WS_URL = import.meta.env.VITE_WS_URL as string;

interface NotificationPayload {
  notificationId: number;
  content: string;
  readYn: string;
}

interface SocketState {
  client: Client | null;
  isConnected: boolean;
  notifications: NotificationPayload[]; // 수신된 실시간 알림들
  connect: (username: string) => void;
  disconnect: () => void;
  // 초기 알림 리스트를 세팅하는 함수
  setNotifications: (notifications: NotificationPayload[]) => void;
}

const useSocketStore = create<SocketState>((set, get) => ({
  client: null,
  isConnected: false,
  notifications: [],

  setNotifications: (notifications) => set({ notifications }),

  connect: (username: string) => {
    // 중복 연결 방지
    if (get().client?.active) return;

    const client = new Client({
      brokerURL: WS_URL, // ex: ws://localhost:8080/ws-stomp
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
    });

    client.onConnect = () => {
      set({ isConnected: true });

      // 백엔드 NotificationServiceImpl의 messagingTemplate 경로 구독
      client.subscribe(`/topic/notify/${username}`, (message: IMessage) => {
        const newNoti: NotificationPayload = JSON.parse(message.body);

        // 새로운 알림을 리스트 앞에 추가
        set((state) => ({
          notifications: [newNoti, ...state.notifications],
        }));
      });
    };

    client.onDisconnect = () => {
      set({ isConnected: false, client: null });
    };

    client.activate();
    set({ client });
  },

  disconnect: () => {
    const { client } = get();
    if (client) {
      client.deactivate();
      set({ client: null, isConnected: false });
    }
  },
}));

export default useSocketStore;
