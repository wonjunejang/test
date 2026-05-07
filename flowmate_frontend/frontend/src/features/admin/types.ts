// 관리자 공지 엔티티(관리자)
export interface AdminNotice {
  id: number;
  adminNoticeTitle: string;
  adminNoticeContent: string;
  adminNoticeCreatedAt: string;
  adminUpdatedAt: string | null;
  delYn: string;
}

// 읽음 상태 포함 공지(사용자)
export interface AdminNoticeReadDto {
  id: number;
  adminNoticeTitle: string;
  adminNoticeContent?: string;
  adminNoticeCreatedAt: string;
  readYn: "Y" | "N";
}

// 등록/수정
export interface AdminNoticeRequest {
  adminNoticeTitle: string;
  adminNoticeContent: string;
}

// 스케쥴러
export interface AdminSchedulerDto {
  type: string;
  id: string;
  title: string;
  deletedAt: string;
  scheduledAt: string;
}

// 스케쥴러 필터
export type FilterType = "ALL" | "MEMBER" | "TODO" | "DISCUSSION" | "PROJECT";
