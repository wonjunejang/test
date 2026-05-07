import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { type Member } from "../memberType";

interface AuthState {
  memberInfo: Member | null; // member info
  isLoggedIn: boolean; // true => 로그인 상태 o
  _hasHydrated: boolean; // 로딩

  // 액션: 로그인 및 정보 업데이트
  setMemberInfo: (data: Member) => void;

  // 액션: 부분 업데이트 (마이페이지 수정 등)
  updateMemberInfo: (partialData: Partial<Member>) => void;

  // 액션: 로그아웃 및 초기화
  clearMemberInfo: () => void;

  // Hydration 상태 설정 (미들웨어에서 호출)
  setHasHydrated: (state: boolean) => void;
}

const useMemberStore = create<AuthState>()(
  persist(
    (set) => ({
      memberInfo: null,
      isLoggedIn: false,
      _hasHydrated: false,

      setMemberInfo: (data) =>
        set({
          memberInfo: data,
          isLoggedIn: true,
        }),

      updateMemberInfo: (partialData) =>
        set((state) => ({
          memberInfo: state.memberInfo ? { ...state.memberInfo, ...partialData } : null,
        })),

      clearMemberInfo: () =>
        set({
          memberInfo: null,
          isLoggedIn: false,
        }),

      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "member-auth-storage", // 로컬스토리지에 저장될 Key
      storage: createJSONStorage(() => sessionStorage), // 저장소 결정
      // 하이드레이션 시작/끝 시점을 감지하여 상태 업데이트
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export default useMemberStore;
