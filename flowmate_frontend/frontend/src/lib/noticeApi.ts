import { axiosInstance } from "./axios";
import type {
  NoticeDetailResponse,
  NoticeListResponse,
  NoticeRequest,
  MemberResponse,
  NoticeReader
} from "../features/notice/types";

/**
 * 1. 공지 목록 조회
 * GET /projects/{projectId}/notices?keyword=
 */
export const fetchNoticeList = (projectId: number | string, keyword?: string) =>
  axiosInstance.get<NoticeListResponse[]>(`/projects/${projectId}/notices`, {
    params: { keyword },
  });

/**
 * 2. 공지 상세 조회
 * GET /projects/{projectId1}/notices/{noticeId}
 */
export const fetchNotice = (projectId: number | string, noticeId: number | string) =>
  axiosInstance.get<NoticeDetailResponse>(`/projects/${projectId}/notices/${noticeId}`);

/**
 * 3. 공지 생성
 * POST /projects/{projectId}/notices
 */
export const createNotice = (projectId: number | string, data: NoticeRequest) =>
  axiosInstance.post<NoticeDetailResponse>(`/projects/${projectId}/notices`, data);

/**
 * 4. 공지 수정
 * PUT /projects/{projectId}/notices/{noticeId}
 */
export const updateNotice = (
  projectId: number | string,
  noticeId: number | string,
  data: NoticeRequest,
) => axiosInstance.put<NoticeDetailResponse>(`/projects/${projectId}/notices/${noticeId}`, data);

/**
 * 5. 공지 삭제 (soft delete)
 * DELETE /projects/{projectId}/notices/{noticeId}
 */
export const deleteNotice = (projectId: number | string, noticeId: number | string) =>
  axiosInstance.delete<void>(`/projects/${projectId}/notices/${noticeId}`);


/**
 * 1. 읽음 처리 (이모지 클릭)
 * POST /projects/{projectId}/notices/{noticeId}/read
 */
export const readNotice = (projectId: number | string, noticeId: number | string, reaction: string) =>
  axiosInstance.post<void>(`/projects/${projectId}/notices/${noticeId}/read`, {reaction});

/**
 * 2. 읽음 취소
 * DELETE /projects/{projectId}/notices/{noticeId}/read
 */
export const unreadNotice = (projectId: number | string, noticeId: number | string) =>
  axiosInstance.delete<void>(`/projects/${projectId}/notices/${noticeId}/read`);

/**
 * 3. 읽음 여부 확인
 * GET /projects/{projectId}/notices/{noticeId}/read
 */
export const fetchIsNoticeRead = (projectId: number | string, noticeId: number | string) =>
  axiosInstance.get<boolean>(`/projects/${projectId}/notices/${noticeId}/read`);

/**
 * 4. 읽은 사용자 목록 (팀장 확인용)
 * GET /projects/{projectId}/notices/{noticeId}/readers
 */
export const fetchNoticeReaders = (projectId: number | string, noticeId: number | string) =>
  axiosInstance.get<NoticeReader[]>(`/projects/${projectId}/notices/${noticeId}/readers`);

/**
 * 5. 읽지 않은 사용자 목록 (팀장 확인용)
 * GET /projects/{projectId}/notices/{noticeId}/unreaders
 */
export const fetchNoticeUnreaders = (projectId: number | string, noticeId: number | string) =>
  axiosInstance.get<MemberResponse[]>(`/projects/${projectId}/notices/${noticeId}/unreaders`);

/**
 * 6. 내가 읽은 공지 목록 (공지 번호 리스트)
 * GET /projects/{projectId}/notices/read
 */
export const fetchMyReadNoticeIds = (projectId: number | string) =>
  axiosInstance.get<number[]>(`/projects/${projectId}/notices/read`);