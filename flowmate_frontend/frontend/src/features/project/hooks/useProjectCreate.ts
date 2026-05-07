import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProject, getMyProjects } from "../../../lib/projectApi";
import type { ProjectCreateForm } from "../types";
import useProjectMemberStore from "../../member/store/useProjectMemberStore";
import { memberGetRequest } from "../../../lib/memberApi";
import useMemberStore from "../../member/store/useMemberStore";
import useAlertStore from "../../member/store/useAlertStore";

export const useProjectCreate = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { setProjectMembers } = useProjectMemberStore();
  const memberInfo = useMemberStore((state) => state.memberInfo);
  const { openAlert } = useAlertStore();

  const handleCreate = async (form: ProjectCreateForm) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await createProject(form);
      const projectId = res.data;

      // 프로젝트 멤버 전역 상태 갱신
      if (memberInfo?.username) {
        const memberListRes = await memberGetRequest(
          `/projects/getProjectMemberList?username=${memberInfo.username}`
        );
        setProjectMembers(memberListRes.data);
      }
      // 모달 추가 
      openAlert("프로젝트가 생성되었습니다.", () => navigate(`/projects/${projectId}`));

    } catch (err: any) {
      openAlert("프로젝트 생성에 실패했습니다!");
      setError(err.response?.data?.message ?? "프로젝트 생성에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleCreate, isLoading, error };
};