import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteProject, getMyProjects } from "../../../lib/projectApi";
import { useProjectStore } from "../store/useProjectStore";
import { memberGetRequest } from "../../../lib/memberApi";
import useProjectMemberStore from "../../member/store/useProjectMemberStore";
import useMemberStore from "../../member/store/useMemberStore";

export const useProjectDelete = (projectId: number) => {
  const navigate = useNavigate();
  const { reset } = useProjectStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProjectMembers } = useProjectMemberStore();
  const memberInfo = useMemberStore((state) => state.memberInfo);

  const handleDeleteConfirm = async () => {
    try {
      setIsLoading(true);
      setError(null);
      await deleteProject(projectId);
      reset();

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
        const maxProjectId = Math.max(...projects.map(p => p.projectId));
        navigate(`/projects/${maxProjectId}`);
      }

    } catch (err: any) {
      setError(err.response?.data?.message ?? "프로젝트 삭제에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleDeleteConfirm, isLoading, error };
};