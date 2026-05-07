// ANCHOR: useChatRoomList
// NOTE: ChatRoomList 컴포넌트의 API 호출 및 관련 로컬 상태 관리 훅
// NOTE: 채팅방 목록 조회, 채팅방 생성 / 초대 담당

import { useState, useEffect, useCallback } from "react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../../../store/useAuthStore";
import { axiosInstance } from "../../../lib/axios";
import type { TeamMember } from "../../discussion/types";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

// SECTION: 타입 정의
interface ProjectSimple {
  projectId: number;
  projectTitle: string;
}
// !SECTION

// SECTION: 훅 본체
export default function useChatRoomList() {
  const { rooms, setRooms, setEnvError } = useChatStore();
  const { username: currentUsername } = useAuthStore();

  // --- 채팅방 목록 상태 ---
  const [fetchError, setFetchError] = useState<"unauthorized" | "error" | null>(null);

  // --- 생성 폼 상태 ---
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [roomName, setRoomName] = useState<string>("");
  const [projects, setProjects] = useState<ProjectSimple[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | "">("");
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedUsernames, setSelectedUsernames] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // SECTION: 채팅방 목록 초기 로드
  useEffect(() => {
    if (!API_URL) {
      setEnvError(true);
      return;
    }

    fetch(`${API_URL}/chat/rooms`, { credentials: "include" })
      .then((res) => {
        if (res.status === 401) {
          setFetchError("unauthorized");
          return null;
        }
        if (!res.ok) {
          setFetchError("error");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!data) return;
        if (Array.isArray(data)) {
          setRooms(data);
          setFetchError(null);
        } else {
          setFetchError("error");
          setRooms([]);
        }
      })
      .catch(() => {
        setFetchError("error");
        setRooms([]);
      });
  }, []);
  // !SECTION

  // SECTION: 마운트 시 프로젝트 목록 로드
  // NOTE: 본인이 LEADER인 프로젝트만 채팅방 생성 대상으로 사용
  useEffect(() => {
    axiosInstance
      .get<ProjectSimple[]>("/projects/me")
      .then(async (res) => {
        const allProjects = res.data;
        const leaderProjects = (
          await Promise.all(
            allProjects.map(async (project) => {
              try {
                const membersRes = await axiosInstance.get<TeamMember[]>(
                  `/projects/${project.projectId}/members`,
                );
                const me = membersRes.data.find((m) => m.username === currentUsername);
                return me?.memberRole === "LEADER" ? project : null;
              } catch {
                return null;
              }
            }),
          )
        ).filter((p): p is ProjectSimple => p !== null);
        setProjects(leaderProjects);
      })
      .catch((err) => console.error("프로젝트 목록 조회 실패", err));
  }, []);
  // !SECTION

  // SECTION: 프로젝트 선택 시 팀원 목록 조회
  useEffect(() => {
    if (!selectedProjectId) {
      setTeamMembers([]);
      setSelectedUsernames([]);
      return;
    }

    axiosInstance
      .get<TeamMember[]>(`/projects/${selectedProjectId}/members`)
      .then((res) => setTeamMembers(res.data))
      .catch((err) => console.error("팀원 목록 조회 실패", err));
  }, [selectedProjectId]);
  // !SECTION

  // SECTION: 채팅방 생성
  const handleCreateRoom = useCallback(async (): Promise<void> => {
    if (!roomName.trim() || !selectedProjectId) return;
    setIsSubmitting(true);
    try {
      const createRes = await axiosInstance.post<number>("/chat/rooms", {
        chatRoomName: roomName.trim(),
        projectId: selectedProjectId,
      });
      const newRoomId = createRes.data;

      const inviteList = [currentUsername, ...selectedUsernames];
      await axiosInstance.post(`/chat/rooms/${newRoomId}/invite`, {
        usernameList: inviteList,
      });

      // NOTE: 생성 후 최신 목록 재조회
      const listRes = await fetch(`${API_URL}/chat/rooms`, { credentials: "include" });
      const data = await listRes.json();
      if (Array.isArray(data)) setRooms(data);

      handleCancelForm();
    } catch (err) {
      console.error("채팅방 생성 실패", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [roomName, selectedProjectId, currentUsername, selectedUsernames, setRooms]);
  // !SECTION

  // SECTION: 생성 폼 취소
  const handleCancelForm = useCallback((): void => {
    setIsFormOpen(false);
    setRoomName("");
    setSelectedProjectId("");
    setSelectedUsernames([]);
  }, []);
  // !SECTION

  // SECTION: 초대 멤버 토글
  const handleToggleMember = useCallback((username: string): void => {
    setSelectedUsernames((prev) =>
      prev.includes(username) ? prev.filter((u) => u !== username) : [...prev, username],
    );
  }, []);
  // !SECTION

  // NOTE: 본인 제외한 초대 가능한 팀원 목록
  const invitableTeamMembers = teamMembers.filter((m) => m.username !== currentUsername);

  // NOTE: 이미 채팅방이 존재하는 프로젝트는 선택 목록에서 제외
  const existingProjectIds = new Set(
    rooms.map((r) => r.projectId).filter((id): id is number => id !== null),
  );
  const availableProjects = projects.filter((p) => !existingProjectIds.has(p.projectId));

  return {
    // 상태
    fetchError,
    // 폼 상태
    isFormOpen,
    setIsFormOpen,
    roomName,
    setRoomName,
    projects: availableProjects,
    selectedProjectId,
    setSelectedProjectId,
    invitableTeamMembers,
    selectedUsernames,
    isSubmitting,
    // 액션
    handleCreateRoom,
    handleCancelForm,
    handleToggleMember,
  };
}
// !SECTION
// ANCHOR: useChatRoomList-end
