// ANCHOR: useAuthStore
// NOTE: useMemberStore + useProjectMemberStore 를 읽어서 반환하는 파사드 훅
// NOTE: 팀원 파일 수정 없이 기존 3가지 호출 패턴 모두 호환
// NOTE:   1. useAuthStore()                      → { username, memberName, memberRole }
// NOTE:   2. useAuthStore((s) => s.memberRole)   → 셀렉터 패턴 (ChatRoomList)
// NOTE:   3. useAuthStore.getState().username     → 정적 메서드 (chatStore, useChatGuard)

import useMemberStore from "../features/member/store/useMemberStore";
import useProjectMemberStore from "../features/member/store/useProjectMemberStore";

// SECTION: 타입 정의
export type MemberRole = "LEADER" | "TEAMMATE" | "99" | null;

interface AuthState {
  username: string | null;
  memberName: string | null;
  memberRole: MemberRole;
  setAuth: (info: { username: string; memberName: string; memberRole: MemberRole }) => void;
  clearAuth: () => void;
}
// !SECTION

// SECTION: 내부 유틸
// NOTE: URL에서 projectId 추출 → /projects/:projectId/... 형태 대응
const getProjectIdFromPath = (): number | null => {
  const match = window.location.pathname.match(/\/projects\/(\d+)/);
  return match ? Number(match[1]) : null;
};

// NOTE: projectMembers에서 현재 유저의 role 조회
const resolveRole = (
  username: string | null,
  projectMembers: Array<{ projectId: number; username: string; memberRole: string }>,
): MemberRole => {
  if (!username) return null;
  const projectId = getProjectIdFromPath();
  if (!projectId) return null;
  const found = projectMembers.find((pm) => pm.projectId === projectId && pm.username === username);
  const role = found?.memberRole;
  if (role === "LEADER" || role === "TEAMMATE" || role === "99") return role;
  return null;
};
// !SECTION

// SECTION: getState (훅 외부 호출 대응)
// NOTE: useAuthStore.getState().username 패턴 대응 (chatStore, useChatGuard)
const getState = (): AuthState => {
  try {
    const memberInfo = useMemberStore.getState().memberInfo;
    const projectMembers = useProjectMemberStore.getState().projectMembers;

    const username = memberInfo?.username ?? null;
    const memberName = memberInfo?.memberName ?? null;

    return {
      username,
      memberName,
      memberRole: resolveRole(username, projectMembers),
      setAuth: () => {},
      clearAuth: () => {},
    };
  } catch {
    return {
      username: null,
      memberName: null,
      memberRole: null,
      setAuth: () => {},
      clearAuth: () => {},
    };
  }
};
// !SECTION

// SECTION: 메인 훅 (오버로딩으로 셀렉터 패턴 지원)
function useAuthStore(): AuthState;
function useAuthStore<T>(selector: (state: AuthState) => T): T;
function useAuthStore<T>(selector?: (state: AuthState) => T): AuthState | T {
  const memberInfo = useMemberStore((s) => s.memberInfo);
  const projectMembers = useProjectMemberStore((s) => s.projectMembers);

  const username = memberInfo?.username ?? null;
  const memberName = memberInfo?.memberName ?? null;
  const memberRole = resolveRole(username, projectMembers);

  const state: AuthState = {
    username,
    memberName,
    memberRole,
    setAuth: () => {},
    clearAuth: () => {},
  };

  if (selector) return selector(state);
  return state;
}

useAuthStore.getState = getState;
// !SECTION

export default useAuthStore;
// ANCHOR: useAuthStore-end
