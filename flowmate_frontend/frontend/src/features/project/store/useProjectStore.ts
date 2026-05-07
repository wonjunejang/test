import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ProjectSimple, Project } from "../types";

interface ProjectStore {
  // 내 프로젝트 목록 (Mypage 사이드바)
  myProjects: ProjectSimple[];
  setMyProjects: (projects: ProjectSimple[]) => void;

  // 현재 선택된 프로젝트
  currentProject: Project | null;
  setCurrentProject: (project: Project | null) => void;

  // 현재 선택된 프로젝트 ID
  currentProjectId: number | null;
  setCurrentProjectId: (id: number | null) => void;

  // 로딩 상태
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;

  // 에러 상태
  error: string | null;
  setError: (error: string | null) => void;

  // 초기화
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      myProjects: [],
      setMyProjects: (projects) => set({ myProjects: projects }),

      currentProject: null,
      setCurrentProject: (project) => set({ currentProject: project }),

      currentProjectId: null,
      setCurrentProjectId: (id) => set({ currentProjectId: id }),

      isLoading: false,
      setIsLoading: (loading) => set({ isLoading: loading }),

      error: null,
      setError: (error) => set({ error }),

      reset: () =>
        set({
          myProjects: [],
          currentProject: null,
          currentProjectId: null,
          isLoading: false,
          error: null,
        }),
    }),
    {
      name: "project-storage",
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);