// 프로젝트 상태 코드
export type ProjectStatus = "PSACT" | "PSEND" | "PSDEL";

// 멤버 역할
export type MemberRole = "LEADER" | "TEAMMATE";

// 채팅 정지 여부
export type ChatBannedYn = "Y" | "N";

// ── 파트 ──────────────────────────────────────────────────────────────────

export interface ProjectPart {
  partId: number;
  partName: string;
}

// ── 팀원 ──────────────────────────────────────────────────────────────────

export interface ProjectMember {
  username: string;
  memberName: string;
  memberRole: MemberRole;
  joinedAt: string;
  memberChatBannedYn: ChatBannedYn;
}

// ── 프로젝트 ──────────────────────────────────────────────────────────────

// 목록용 (Mypage 사이드바)
export interface ProjectSimple {
  projectId: number;
  projectTitle: string;
  projectTokenUrl: string;
}

// 상세용 (Mainpage)
export interface Project {
  projectId: number;
  projectTitle: string;
  projectContent: string;
  projectStartDate: string;
  projectEndDate: string;
  projectStatus: ProjectStatus;
  leaderName: string;
  leaderUsername: string;
  projectTokenUrl: string;
  parts: ProjectPart[];
  members: ProjectMember[];
}

// ── 요청 ──────────────────────────────────────────────────────────────────

export interface ProjectCreateForm {
  projectTitle: string;
  projectContent: string;
  projectStartDate: string;
  projectEndDate: string;
  partNames: string[];
}

export interface ProjectUpdateForm {
  projectTitle?: string;
  projectContent?: string;
  projectStartDate?: string;
  projectEndDate?: string;
  projectTeamSize?: number | null;
  projectStatus?: ProjectStatus;
}