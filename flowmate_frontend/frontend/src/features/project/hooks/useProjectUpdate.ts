import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { updateProject } from "../../../lib/projectApi";
import type { ProjectUpdateForm } from "../types";

export const useProjectUpdate = (projectId: number) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (form: ProjectUpdateForm) => {
    try {
      setIsLoading(true);
      setError(null);
      await updateProject(projectId, form);
      // 수정 완료 후 상세 페이지로 이동
      navigate(`/projects/${projectId}`);
    } catch (err: any) {
      setError(err.response?.data?.message ?? "프로젝트 수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return { handleUpdate, isLoading, error };
};