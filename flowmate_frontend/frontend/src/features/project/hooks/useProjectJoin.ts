import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectByToken, joinProject, getMyProjects } from "../../../lib/projectApi";
import type { Project } from "../types";
import useMemberStore from "../../member/store/useMemberStore";
import { memberGetRequest } from "../../../lib/memberApi";
import useProjectMemberStore from "../../member/store/useProjectMemberStore";

export const useProjectJoin = (tokenUrl: string) => {
  const navigate = useNavigate();
  const memberInfo = useMemberStore((state) => state.memberInfo);

  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setProjectMembers } = useProjectMemberStore();

  useEffect(() => {
    if (!tokenUrl) return;

    if (!memberInfo) {
      navigate("/");
      return;
    }

    const fetch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getProjectByToken(tokenUrl);
        setPreviewProject(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "유효하지 않은 초대 링크입니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [tokenUrl]);

  const handleJoin = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await joinProject(tokenUrl);

      if (memberInfo?.username) {
        const memberListRes = await memberGetRequest(
          `/projects/getProjectMemberList?username=${memberInfo.username}`
        );
        setProjectMembers(memberListRes.data);
      }

      const res = await getMyProjects();
      const projects = res.data;

      if (!projects || projects.length === 0) {
        navigate("/projects/0");
      } else {
        const maxProjectId = Math.max(...projects.map((p: any) => p.projectId));
        navigate(`/projects/${maxProjectId}`);
      }

    } catch (err: any) {
      setError(err.response?.data?.message ?? "프로젝트 참여에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { previewProject, handleJoin, isLoading, error };
};