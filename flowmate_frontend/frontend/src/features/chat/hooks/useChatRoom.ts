// ANCHOR: useChatRoom
// NOTE: ChatRoom 컴포넌트의 API 호출 및 관련 로컬 상태 관리 훅
// NOTE: 메시지 히스토리 / 멤버 목록 / 밴 상태 조회, 초대 / 밴 처리 등 담당

import { useState, useEffect, useCallback } from "react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../../../store/useAuthStore";
import { axiosInstance } from "../../../lib/axios";
import type { TeamMember } from "../../discussion/types";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;
const WS_URL = import.meta.env.VITE_WEBSOCKET_URL as string | undefined;
const HTTP_WS_URL = WS_URL?.replace("wss://", "https://").replace("ws://", "http://");

// SECTION: 타입 정의
export interface ChatRoomMember {
  username: string;
  memberName: string;
}
// !SECTION

// SECTION: 훅 본체
export default function useChatRoom(messagesContainerScrollToBottom: () => void) {
  const { currentRoomId, rooms, setMessages, setRooms, exitRoom, setBanStatus } = useChatStore();
  const { username: currentUsername } = useAuthStore();

  const currentRoom = rooms.find((r) => r.id === currentRoomId) ?? null;

  // --- 채팅방 멤버 & 밴 상태 ---
  const [isLeader, setIsLeader] = useState<boolean>(false);
  const [chatRoomMembers, setChatRoomMembers] = useState<ChatRoomMember[]>([]);
  const [bannedUsernames, setBannedUsernames] = useState<Set<string>>(new Set());

  // --- 초대 관련 ---
  const [isInviteOpen, setIsInviteOpen] = useState<boolean>(false);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [isInviting, setIsInviting] = useState<boolean>(false);

  // SECTION: 초기 데이터 로드 (방 진입 시)
  // NOTE: 메시지 히스토리, 멤버 목록, 본인 밴 여부 조회
  // NOTE: projectId가 있는 경우 프로젝트 멤버 목록으로 isLeader 판별
  useEffect(() => {
    if (!currentRoomId) return;

    fetch(`${API_URL}/chat/rooms/${currentRoomId}/messages`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setMessages(data);
          setTimeout(messagesContainerScrollToBottom, 50);
        }
      })
      .catch((err) => console.error("메시지 히스토리 조회 실패", err));

    axiosInstance
      .get<ChatRoomMember[]>(`/chat/rooms/${currentRoomId}/members`)
      .then((res) => setChatRoomMembers(res.data.filter((m) => m.username !== currentUsername)))
      .catch(() => setChatRoomMembers([]));

    axiosInstance
      .get<{ isBanned: boolean }>(`/chat/rooms/${currentRoomId}/ban/me`)
      .then((res) => setBanStatus(res.data.isBanned))
      .catch(() => setBanStatus(false));

    if (currentRoom?.projectId) {
      axiosInstance
        .get<TeamMember[]>(`/projects/${currentRoom.projectId}/members`)
        .then((res) => {
          const me = res.data.find((m) => m.username === currentUsername);
          setIsLeader(me?.memberRole === "LEADER");
          // NOTE: 초대 모달에서도 재사용하기 위해 여기서 같이 세팅
          setTeamMembers(res.data);
        })
        .catch(() => setIsLeader(false));
    } else {
      setIsLeader(false);
    }
  }, [currentRoomId]);
  // !SECTION

  // SECTION: 멤버별 밴 상태 조회 (LEADER만)
  // NOTE: chatRoomMembers가 로드된 후 LEADER인 경우에만 각 멤버 밴 여부 조회
  useEffect(() => {
    if (!isLeader || !currentRoom?.projectId || chatRoomMembers.length === 0) return;

    const fetchBanStatuses = async () => {
      const banned = new Set<string>();
      await Promise.all(
        chatRoomMembers.map(async (member) => {
          try {
            const res = await axiosInstance.get<{ isBanned: boolean }>(
              `/chat/rooms/${currentRoomId}/members/${member.username}/ban`,
            );
            if (res.data.isBanned) banned.add(member.username);
          } catch {}
        }),
      );
      setBannedUsernames(banned);
    };

    fetchBanStatuses();
  }, [isLeader, chatRoomMembers, currentRoom?.projectId]);
  // !SECTION

  // SECTION: 방 나가기
  const handleLeave = useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/chat/rooms/${currentRoomId}/leave`, {
        method: "DELETE",
        credentials: "include",
      });
      exitRoom();
    } catch (err) {
      console.error("채팅방 나가기 실패", err);
    }
  }, [currentRoomId, exitRoom]);
  // !SECTION

  // SECTION: 방 삭제
  const handleDeleteRoom = useCallback(async (): Promise<void> => {
    try {
      await fetch(`${API_URL}/chat/rooms/${currentRoomId}`, {
        method: "DELETE",
        credentials: "include",
      });
      setRooms(rooms.filter((r) => r.id !== currentRoomId));
      exitRoom();
    } catch (err) {
      console.error("채팅방 삭제 실패", err);
    }
  }, [currentRoomId, rooms, setRooms, exitRoom]);
  // !SECTION

  // SECTION: 멤버 초대
  const handleInvite = useCallback(async (): Promise<void> => {
    if (selectedUsernames.length === 0) return;
    setIsInviting(true);
    try {
      await axiosInstance.post(`/chat/rooms/${currentRoomId}/invite`, {
        usernameList: selectedUsernames,
      });
      const res = await axiosInstance.get<ChatRoomMember[]>(`/chat/rooms/${currentRoomId}/members`);
      setChatRoomMembers(res.data.filter((m) => m.username !== currentUsername));
      setIsInviteOpen(false);
      setSelectedUsernames([]);
    } catch (err) {
      console.error("초대 실패", err);
    } finally {
      setIsInviting(false);
    }
  }, [currentRoomId, selectedUsernames, currentUsername]);

  const handleToggleInviteMember = useCallback((username: string): void => {
    setSelectedUsernames((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username],
    );
  }, []);
  // !SECTION

  // SECTION: 채팅 밴 / 밴 해제
  const handleChatBanToggle = useCallback(
    async (username: string, currentBanned: boolean): Promise<void> => {
      try {
        await axiosInstance.put(
          `/projects/${currentRoom?.projectId}/members/${username}/chat-ban`,
          { ban: !currentBanned },
        );

        if (HTTP_WS_URL) {
          await fetch(`${HTTP_WS_URL}/api/chat/ban-notify`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, isBanned: !currentBanned }),
          }).catch(() => {});
        }

        setBannedUsernames((prev) => {
          const next = new Set(prev);
          if (currentBanned) {
            next.delete(username);
          } else {
            next.add(username);
          }
          return next;
        });
      } catch (err) {
        console.error("채팅 금지 처리 실패", err);
        throw err;
      }
    },
    [currentRoom?.projectId],
  );
  // !SECTION

  // SECTION: 초대 가능한 멤버 필터링
  // NOTE: 팀원 중 본인 및 이미 초대된 멤버 제외
  const invitableMembers = teamMembers.filter(
    (m) =>
      m.username !== currentUsername && !chatRoomMembers.some((cm) => cm.username === m.username),
  );
  // !SECTION

  return {
    // 파생 상태
    currentRoom,
    isLeader,
    chatRoomMembers,
    bannedUsernames,
    // 초대
    isInviteOpen,
    setIsInviteOpen,
    invitableMembers,
    selectedUsernames,
    isInviting,
    handleInvite,
    handleToggleInviteMember,
    // 밴
    handleChatBanToggle,
    // 방 관리
    handleLeave,
    handleDeleteRoom,
  };
}
// !SECTION
// ANCHOR: useChatRoom-end
