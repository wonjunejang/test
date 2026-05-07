import { useEffect, useState } from "react";
import { getMyProjects, getProject } from "../../../lib/projectApi";
import { useProjectStore } from "../store/useProjectStore";
import { useNavigate } from "react-router-dom";

export const useProjectDetail = (projectId: number) => {
  const { currentProject, setCurrentProject, isLoading, setIsLoading, error, setError } =
    useProjectStore();
    const navigate = useNavigate();
    const [showKickedModal, setShowKickedModal] = useState(false);
    const [showUnauthorizedModal, setShowUnauthorizedModal] = useState(false);

    const handleKickedConfirm = async () => {
      setShowKickedModal(false);
      const res = await getMyProjects();
      const projects = res.data;
      if(!projects || projects.length === 0) {
        navigate("/projects/0");
      }else{
        const maxProjectId = Math.max(...projects.map((p:any) => p.projectId));
        navigate(`/projects/${maxProjectId}`);
      }
    };

    const handleUnauthorizedConfirm = () => {
      setShowUnauthorizedModal(false);
      if(window.history.length >1) {
        navigate(-1); // 이전 화면으로
      } else {
        navigate("/projects/0"); // 이전 화면 없으면 만들기/참여하기 화면
      }
    }

  useEffect(() => {
    if (!projectId) return;

    const fetch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getProject(projectId);
        setCurrentProject(res.data);
      } catch (err: any) {
        // 접근 권한 없음 (퇴장/퇴출된 경우)
        if(err.response?.status === 403 || err.response?.status === 500){
          const message = err.response?.data?.message ?? "";
          if (message.includes("접근 권한")) {
            // 퇴출/퇴장된 경우
            setShowKickedModal(true);
          } else {
            // 인가되지 않은 사용자
            setShowUnauthorizedModal(true);
          }
        } else {
          setError(err.response?.data?.message ?? "프로젝트를 불러오지 못했습니다.");
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, [projectId]);

  return { currentProject, isLoading, error, showKickedModal, handleKickedConfirm, showUnauthorizedModal, handleUnauthorizedConfirm };
};