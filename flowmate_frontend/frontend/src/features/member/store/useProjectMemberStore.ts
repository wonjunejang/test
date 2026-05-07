// ──────────────────────────────────────────
// useProjectMemberStore.ts
// 프로젝트 멤버 전역 상태 관리
// useMemberStore 패턴과 동일하게 구성
// ──────────────────────────────────────────

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type ProjectMember } from '../memberType';

interface ProjectMemberState {
    // 현재 조회된 프로젝트 멤버 목록
    projectMembers: ProjectMember[];

    // 현재 선택된 프로젝트 ID
    currentProjectId: number | null;

    // ── 액션 ──────────────────────────────
    // 멤버 목록 전체 세팅 (API 응답값으로)
    setProjectMembers: (data: ProjectMember[]) => void;

    // 특정 멤버 1명 업데이트 (채팅 밴 등 부분 수정)
    updateProjectMember: (username: string, partialData: Partial<ProjectMember>) => void;

    // 특정 멤버 제거 (delYn = 'Y' 처리된 멤버 목록에서 제거)
    removeProjectMember: (username: string) => void;

    // 현재 프로젝트 ID 세팅
    setCurrentProjectId: (projectId: number) => void;

    // 전체 초기화
    clearProjectMembers: () => void;
}

const useProjectMemberStore = create<ProjectMemberState>()(
    persist(
        (set) => ({
            projectMembers:   [],
            currentProjectId: null,

            // API 응답값으로 멤버 목록 전체 교체
            setProjectMembers: (data) =>
                set({ projectMembers: data }),

            // username 기준으로 특정 멤버만 부분 업데이트
            updateProjectMember: (username, partialData) =>
                set((state) => ({
                    projectMembers: state.projectMembers.map((pm) =>
                        pm.username === username
                            ? { ...pm, ...partialData }
                            : pm
                    ),
                })),

            // username 기준으로 목록에서 제거
            removeProjectMember: (username) =>
                set((state) => ({
                    projectMembers: state.projectMembers.filter(
                        (pm) => pm.username !== username
                    ),
                })),

            setCurrentProjectId: (projectId) =>
                set({ currentProjectId: projectId }),

            clearProjectMembers: () =>
                set({ projectMembers: [], currentProjectId: null }),
        }),
        {
            name:    'project-member-storage',
            storage: createJSONStorage(() => sessionStorage),
        }
    )
);

export default useProjectMemberStore;