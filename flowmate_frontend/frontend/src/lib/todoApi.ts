import { axiosInstance } from "./axios";
import type {
  TodoPageResponse,
  TodoDetailResponse,
  TodoProgressResponse,
  TodoSearchRequest,
  TodoCreateRequest,
  TodoUpdateRequest,
} from "../features/todo/types";

// ───────────────────────────────────
// 프로젝트 파트/멤버 응답 타입
// ───────────────────────────────────
export interface ProjectPartResponse {
  partId: number;
  partName: string;
}

export interface ProjectMemberResponse {
  username: string;
  memberName: string;
  memberRole: string; // "LEADER" | "TEAMMATE"
  joinedAt: string;
  memberChatBannedYn: string;
}

// ───────────────────────────────────
// 프로젝트 파트/멤버 조회
// ───────────────────────────────────

// 파트 목록 조회 - GET /projects/{projectId}/parts
export const fetchProjectParts = (projectId: number) =>
  axiosInstance.get<ProjectPartResponse[]>(`/projects/${projectId}/parts`);

// 팀원 목록 조회 - GET /projects/{projectId}/members
export const fetchProjectMembers = (projectId: number) =>
  axiosInstance.get<ProjectMemberResponse[]>(`/projects/${projectId}/members`);

// ───────────────────────────────────
// Todo API
// ───────────────────────────────────

// 투두 목록 조회 (페이징 + 필터)
export const fetchTodoList = (
  projectId: number,
  username: string,
  params: TodoSearchRequest = {}
) =>
  axiosInstance.get<TodoPageResponse>(`/projects/${projectId}/todos`, {
    params: { username, ...params },
  });

// 투두 상세 조회
export const fetchTodoDetail = (
  projectId: number,
  todoId: number,
  username: string
) =>
  axiosInstance.get<TodoDetailResponse>(`/projects/${projectId}/todos/${todoId}`, {
    params: { username },
  });

// 투두 생성 (파일 첨부 포함)
export const createTodo = (
  projectId: number,
  username: string,
  requestData: TodoCreateRequest,
  files: File[] = []
) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(requestData)], { type: "application/json" })
  );
  files.forEach((file) => formData.append("files", file));

  return axiosInstance.post<number>(
    `/projects/${projectId}/todos?username=${username}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

// 투두 수정 (파일 첨부 포함)
export const updateTodo = (
  projectId: number,
  todoId: number,
  username: string,
  requestData: TodoUpdateRequest,
  newFiles: File[] = []
) => {
  const formData = new FormData();
  formData.append(
    "request",
    new Blob([JSON.stringify(requestData)], { type: "application/json" })
  );
  newFiles.forEach((file) => formData.append("newFiles", file));

  return axiosInstance.put<number>(
    `/projects/${projectId}/todos/${todoId}?username=${username}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );
};

// 투두 삭제
export const deleteTodo = (
  projectId: number,
  todoId: number,
  username: string
) =>
  axiosInstance.delete<void>(`/projects/${projectId}/todos/${todoId}`, {
    params: { username },
  });

// 진행률 조회
export const fetchTodoProgress = (projectId: number, username: string) =>
  axiosInstance.get<TodoProgressResponse>(`/projects/${projectId}/todos/progress`, {
    params: { username },
  });

// 파일 다운로드
export const downloadTodoFile = (
  projectId: number,
  todoId: number,
  fileId: number,
  username: string
) =>
  axiosInstance.get(
    `/projects/${projectId}/todos/${todoId}/files/${fileId}/download`,
    { params: { username }, responseType: "blob" }
  );

// 현재 로그인 유저가 해당 프로젝트의 팀장인지 여부 조회
export const fetchIsLeader = (projectId: number) =>
  axiosInstance.get<boolean>(`/projects/${projectId}/isLeader`);