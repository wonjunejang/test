import { axiosInstance } from "./axios";
import type {
  ProjectSimple,
  Project,
  ProjectCreateForm,
  ProjectUpdateForm,
  ProjectPart,
  ProjectMember,
} from "../features/project/types";

// ── 프로젝트 ──────────────────────────────────────────────────────────────

// 내 프로젝트 목록 조회
// → GET /projects/me
// → 반환: ProjectSimple[] (id, 제목, 토큰URL)
export const getMyProjects = () =>
  axiosInstance.get<ProjectSimple[]>("/projects/me");

// 프로젝트 단건 조회
// → GET /projects/{projectId}
// → 반환: Project (전체 상세 + parts + members)
export const getProject = (projectId: number) =>
  axiosInstance.get<Project>(`/projects/${projectId}`);

// 프로젝트 생성
// → POST /projects
// → 반환: number (생성된 projectId)
export const createProject = (data: ProjectCreateForm) =>
  axiosInstance.post<number>("/projects", {
    projectTitle: data.projectTitle,
    projectContent: data.projectContent,
    projectStartDate: data.projectStartDate
      ? `${data.projectStartDate}T00:00:00`   // date → timestamp 변환
      : null,
    projectEndDate: data.projectEndDate
      ? `${data.projectEndDate}T00:00:00`
      : null,
    partNames: data.partNames.filter((p) => p.trim() !== ""),
  });

// 프로젝트 수정
// → PUT /projects/{projectId}
// → 반환: Project (수정된 프로젝트 상세)
export const updateProject = (projectId: number, data: ProjectUpdateForm) =>
  axiosInstance.put<Project>(`/projects/${projectId}`, {
    ...data,
    projectStartDate: data.projectStartDate
      ? `${data.projectStartDate}T00:00:00`
      : undefined,
    projectEndDate: data.projectEndDate
      ? `${data.projectEndDate}T00:00:00`
      : undefined,
  });

// 프로젝트 삭제
// → DELETE /projects/{projectId}
// → 반환: void
export const deleteProject = (projectId: number) =>
  axiosInstance.delete(`/projects/${projectId}`);

// ── 초대링크 ──────────────────────────────────────────────────────────────

// 초대링크로 프로젝트 정보 조회 (참여 전 미리보기)
// → GET /projects/invite/{tokenUrl}
// → 반환: Project
export const getProjectByToken = (tokenUrl: string) =>
  axiosInstance.get<Project>(`/projects/invite/${tokenUrl}`);

// 초대링크로 프로젝트 참여
// → POST /projects/invite/{tokenUrl}/join
// → 반환: void
export const joinProject = (tokenUrl: string) =>
  axiosInstance.post(`/projects/invite/${tokenUrl}/join`);

// ── 팀원 ──────────────────────────────────────────────────────────────────

// 팀원 목록 조회
// → GET /projects/{projectId}/members
// → 반환: ProjectMember[]
export const getMembers = (projectId: number) =>
  axiosInstance.get<ProjectMember[]>(`/projects/${projectId}/members`);

// 팀원 퇴출 (팀장만 가능)
// → DELETE /projects/{projectId}/members/{username}
// → 반환: void
export const kickMember = (projectId: number, username: string) =>
  axiosInstance.delete(`/projects/${projectId}/members/${username}`);

// 팀장 위임 (팀장만 가능)
// → PUT /projects/{projectId}/members/{username}/delegate
// → 반환: void
export const delegateLeader = (projectId: number, username: string) =>
  axiosInstance.put(`/projects/${projectId}/members/${username}/delegate`);

// 프로젝트 나가기 (팀원만 가능)
// → DELETE /projects/{projectId}/leave
// → 반환: void
export const leaveProject = (projectId: number) =>
  axiosInstance.delete(`/projects/${projectId}/leave`);

// 채팅 정지/해제 (팀장만 가능)
// → PUT /projects/{projectId}/members/{username}/chat-ban
// → body: { ban: true/false }
// → 반환: void
export const updateChatBan = (
  projectId: number,
  username: string,
  ban: boolean
) =>
  axiosInstance.put(
    `/projects/${projectId}/members/${username}/chat-ban`,
    { ban }
  );

// ── 파트 ──────────────────────────────────────────────────────────────────

// 파트 목록 조회
// → GET /projects/{projectId}/parts
// → 반환: ProjectPart[]
export const getParts = (projectId: number) =>
  axiosInstance.get<ProjectPart[]>(`/projects/${projectId}/parts`);

// 파트 추가 (팀장만 가능)
// → POST /projects/{projectId}/parts
// → body: { partName: string }
// → 반환: ProjectPart
export const createPart = (projectId: number, partName: string) =>
  axiosInstance.post<ProjectPart>(`/projects/${projectId}/parts`, {
    partName,
  });

// 파트 수정 (팀장만 가능)
// → PUT /projects/{projectId}/parts/{partId}
// → body: { partName: string }
// → 반환: ProjectPart
export const updatePart = (
  projectId: number,
  partId: number,
  partName: string
) =>
  axiosInstance.put<ProjectPart>(
    `/projects/${projectId}/parts/${partId}`,
    { partName }
  );

// 파트 삭제 (팀장만 가능)
// → DELETE /projects/{projectId}/parts/{partId}
// → 반환: void
export const deletePart = (projectId: number, partId: number) =>
  axiosInstance.delete(`/projects/${projectId}/parts/${partId}`);