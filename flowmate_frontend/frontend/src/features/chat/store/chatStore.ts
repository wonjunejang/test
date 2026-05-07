// ANCHOR: chatStore
// NOTE: 채팅 전역 상태 관리 (Zustand)
// NOTE: UI 상태 (패널 열림/닫힘, 현재 방) + 서버 데이터 (rooms, messages) 통합 관리
// NOTE: normalizeMessage는 store 내부에서만 사용 → export 제거

import { create } from "zustand";
import useAuthStore from "../../../store/useAuthStore";

// SECTION: 타입 정의
export interface ChatRoom {
  id: number;
  chatRoomName: string;
  chatRoomLastChatAt: string | null;
  chatRoomMemberCnt: number;
  projectId: number | null;
}

export interface ChatMessage {
  id: number;
  senderUsername: string;
  senderMemberName: string | null;
  receiverUsername: string | null;
  chatMessageContent: string;
  chatMessageSentAt: string;
  type: "GROUP" | "WHISPER";
  isMine: boolean;
}

export interface RawChatMessage {
  id: number;
  senderUsername: string;
  senderMemberName?: string | null;
  receiverUsername?: string | null;
  chatMessageContent: string;
  chatMessageSentAt: string;
  type?: "GROUP" | "WHISPER";
}
// !SECTION

// SECTION: 내부 유틸
// NOTE: 서버 응답 → ChatMessage 정규화 (isMine 판별 포함)
function normalizeMessage(raw: RawChatMessage): ChatMessage {
  const username = useAuthStore.getState().username;
  return {
    id: raw.id,
    senderUsername: raw.senderUsername,
    senderMemberName: raw.senderMemberName ?? null,
    receiverUsername: raw.receiverUsername ?? null,
    chatMessageContent: raw.chatMessageContent,
    chatMessageSentAt: raw.chatMessageSentAt,
    type: raw.type ?? (raw.receiverUsername ? "WHISPER" : "GROUP"),
    isMine: raw.senderUsername === username,
  };
}
// !SECTION

// SECTION: Store 인터페이스
interface ChatStore {
  // --- UI 상태 ---
  isPanelOpen: boolean;
  currentRoomId: number | null;
  isChatDisabled: boolean;
  // NOTE: 스크롤이 하단에 있는지 여부 (자동 스크롤 & 화살표 버튼 표시 판단용)
  isAtBottom: boolean;

  // --- 서버 데이터 ---
  rooms: ChatRoom[];
  messages: ChatMessage[];

  // --- 채팅방 상태 ---
  isBanned: boolean;
  isEnvError: boolean;

  // --- UI 상태 액션 ---
  openPanel: () => void;
  closePanel: () => void;
  togglePanel: () => void;
  setChatDisabled: (disabled: boolean) => void;
  setIsAtBottom: (isAtBottom: boolean) => void;

  // --- 방 이동 액션 ---
  setCurrentRoom: (roomId: number) => void;
  exitRoom: () => void;

  // --- 서버 데이터 액션 ---
  setRooms: (rooms: ChatRoom[]) => void;
  addMessage: (message: RawChatMessage) => void;
  setMessages: (messages: RawChatMessage[]) => void;

  // --- 채팅방 상태 액션 ---
  setBanStatus: (isBanned: boolean) => void;
  setEnvError: (isEnvError: boolean) => void;
}
// !SECTION

// SECTION: Store 생성
const useChatStore = create<ChatStore>((set) => ({
  // --- UI 상태 초기값 ---
  isPanelOpen: false,
  currentRoomId: null,
  isChatDisabled: false,
  isAtBottom: true,

  // --- 서버 데이터 초기값 ---
  rooms: [],
  messages: [],

  // --- 채팅방 상태 초기값 ---
  isBanned: false,
  isEnvError: false,

  // --- UI 상태 액션 ---
  openPanel: () => set({ isPanelOpen: true }),
  closePanel: () => set({ isPanelOpen: false }),
  togglePanel: () => set((state) => ({ isPanelOpen: !state.isPanelOpen })),
  setChatDisabled: (disabled) => set({ isChatDisabled: disabled }),
  setIsAtBottom: (isAtBottom) => set({ isAtBottom }),

  // --- 방 이동 액션 ---
  setCurrentRoom: (roomId) =>
    set({ currentRoomId: roomId, messages: [], isBanned: false, isAtBottom: true }),
  exitRoom: () => set({ currentRoomId: null, messages: [], isBanned: false }),

  // --- 서버 데이터 액션 ---
  setRooms: (rooms) => set({ rooms }),
  addMessage: (raw) => set((state) => ({ messages: [...state.messages, normalizeMessage(raw)] })),
  setMessages: (raws) => set({ messages: raws.map(normalizeMessage) }),

  // --- 채팅방 상태 액션 ---
  setBanStatus: (isBanned) => set({ isBanned }),
  setEnvError: (isEnvError) => set({ isEnvError }),
}));
// !SECTION

export default useChatStore;
// ANCHOR: chatStore-end
