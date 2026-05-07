import { useEffect } from "react";
import { getMyProjects } from "../../../lib/projectApi";
import { useProjectStore } from "../store/useProjectStore";

export const useMyProjects = () => {
  const { myProjects, setMyProjects, isLoading, setIsLoading, error, setError } =
    useProjectStore();

  useEffect(() => {
    const fetch = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await getMyProjects();
        setMyProjects(res.data);
      } catch (err: any) {
        setError(err.response?.data?.message ?? "프로젝트 목록을 불러오지 못했습니다.");
      } finally {
        setIsLoading(false);
      }
    };
    fetch();
  }, []);

  return { myProjects, isLoading, error };
};