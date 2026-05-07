import { axiosInstance } from "./axios";
import type {
  DiscussionResponse,
  DiscussionCreateRequest,
  DiscussionUpdateRequest,
  DiscussionMember,
  TeamMember,
  TodoCreateRequest,
  DiscussionTodoBulkResponse,
  ProjectPart,
} from "../features/discussion/types";

// 회의록 목록 조회 (keyword 검색 지원)
export const fetchDiscussionList = (projectId: number | string, keyword?: string) => {
  const params = keyword?.trim() ? { keyword: keyword.trim() } : {};
  return axiosInstance.get<DiscussionResponse[]>(`/projects/${projectId}/discussions/`, { params });
};

// 회의록 단건 조회
export const fetchDiscussion = (projectId: number | string, discussionId: number | string) =>
  axiosInstance.get<DiscussionResponse>(`/projects/${projectId}/discussions/${discussionId}`);

// 회의록 작성
export const createDiscussion = (projectId: number | string, data: DiscussionCreateRequest) =>
  axiosInstance.post<DiscussionResponse>(`/projects/${projectId}/discussions/`, data);

// 회의록 수정
export const updateDiscussion = (
  projectId: number | string,
  discussionId: number | string,
  data: DiscussionUpdateRequest,
) =>
  axiosInstance.put<DiscussionResponse>(`/projects/${projectId}/discussions/${discussionId}`, data);

// 회의록 삭제
export const deleteDiscussion = (projectId: number | string, discussionId: number | string) =>
  axiosInstance.delete<void>(`/projects/${projectId}/discussions/${discussionId}`);

// 회의록 멤버 목록 조회
export const fetchDiscussionMembers = (projectId: number | string, discussionId: number | string) =>
  axiosInstance.get<DiscussionMember[]>(
    `/projects/${projectId}/discussions/${discussionId}/members`,
  );

// 회의록 멤버 추가 (작성 시)
export const addDiscussionMembers = (
  projectId: number | string,
  discussionId: number | string,
  usernameList: string[],
) =>
  axiosInstance.post<DiscussionMember[]>(
    `/projects/${projectId}/discussions/${discussionId}/members`,
    usernameList,
  );

// 회의록 멤버 수정 (수정 시)
export const updateDiscussionMembers = (
  projectId: number | string,
  discussionId: number | string,
  usernameList: string[],
) =>
  axiosInstance.put<DiscussionMember[]>(
    `/projects/${projectId}/discussions/${discussionId}/members`,
    usernameList,
  );

// 팀 멤버 목록 조회
export const fetchTeamMembers = (projectId: number | string) =>
  axiosInstance.get<TeamMember[]>(`/projects/${projectId}/members`);

// 회의록 Todo 일괄 생성
export const createDiscussionTodos = (
  projectId: number | string,
  discussionId: number | string,
  username: string,
  todos: TodoCreateRequest[],
) =>
  axiosInstance.post<DiscussionTodoBulkResponse>(
    `/projects/${projectId}/discussions/${discussionId}/todos?username=${username}`,
    { todos },
  );

// 파트 목록 조회
export const fetchProjectParts = (projectId: number | string) =>
  axiosInstance.get<ProjectPart[]>(`/projects/${projectId}/parts`);
