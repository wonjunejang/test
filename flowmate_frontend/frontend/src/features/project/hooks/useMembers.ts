import { useState, useEffect } from "react";
import {
  getMembers,
  kickMember,
  delegateLeader,
  leaveProject,
  updateChatBan,
  getMyProjects,
} from "../../../lib/projectApi";
import type { ProjectMember } from "../types";
import { memberGetRequest } from "../../../lib/memberApi";
import { useNavigate } from "react-router-dom";
import { useProjectStore } from "../store/useProjectStore";
import useProjectMemberStore from "../../member/store/useProjectMemberStore";
import useMemberStore from "../../member/store/useMemberStore";

export const useMembers = (projectId: number) => {
  const navigate = useNavigate();
  const { reset } = useProjectStore();
  const [members, setMembers] = useState<ProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProjectMembers } = useProjectMemberStore();
  const memberInfo = useMemberStore((state) => state.memberInfo);

  // 팀원 목록 조회
  const fetchMembers = async () => {
    try {
      setIsLoading(true);
      const res = await getMembers(projectId);
      setMembers(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "팀원 목록을 불러오지 못했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, [projectId]);

  // 팀원 퇴출
  const handleKick = async (username: string) => {
    try {
      await kickMember(projectId, username);
      // 퇴출 후 목록 다시 불러오기
      await fetchMembers();

      if(memberInfo?.username){
        const memberListRes = await memberGetRequest(
          `/projects/getProjectMemberList?username=${memberInfo.username}`
        );
        setProjectMembers(memberListRes.data);
      }

    } catch (err: any) {
      setError(err.response?.data?.message ?? "팀원 퇴출에 실패했습니다.");
    }
  };

  // 팀장 위임
  const handleDelegate = async (username: string) => {
    try {
      await delegateLeader(projectId, username);
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "팀장 위임에 실패했습니다.");
    }
  };

  // 프로젝트 나가기
  const handleLeave = async () => {
    try {
      await leaveProject(projectId);
      reset();

      if(memberInfo?.username){
        const memberListRes = await memberGetRequest(
          `/projects/getProjectMemberList?username=${memberInfo.username}`
        );
        setProjectMembers(memberListRes.data);
      }

      const res = await getMyProjects();  // getMyProjects import 추가 필요
      const projects = res.data;

      if (!projects || projects.length === 0) {
        navigate("/projects/0");
      } else {
        const maxProjectId = Math.max(...projects.map((p: any) => p.projectId));
        navigate(`/projects/${maxProjectId}`);
      }



    } catch (err: any) {
      setError(err.response?.data?.message ?? "프로젝트 나가기에 실패했습니다.");
    }
  };

  // 채팅 정지/해제
  const handleChatBan = async (username: string, ban: boolean) => {
    try {
      await updateChatBan(projectId, username, ban);
      await fetchMembers();
    } catch (err: any) {
      setError(err.response?.data?.message ?? "채팅 정지 설정에 실패했습니다.");
    }
  };

  return {
    members,
    isLoading,
    error,
    handleKick,
    handleDelegate,
    handleLeave,
    handleChatBan,
    fetchMembers,
  };
};