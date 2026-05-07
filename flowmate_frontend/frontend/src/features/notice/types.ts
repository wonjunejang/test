// 공지 상세 응답
export interface NoticeDetailResponse {
  noticeId: number;
  noticeTitle: string;
  noticeContent: string;
  createdAt: string;
  updatedAt: string;
  myReaction: string | null; // 내가 남긴 반응
  unreaders: MemberResponse[]; // 안 읽은 팀원 목록
}

// 공지 목록 응답
export interface NoticeListResponse {
  noticeId: number;
  noticeTitle: string;
  writerName: string;
  noticeCreatedAt: string;
  noticeUpdatedAt: string;
}

// 공지 생성/수정 요청
export interface NoticeRequest {
  noticeTitle: string;
  noticeContent: string;
}

// 페이징
export interface NoticeListParams {
  keyword?: string;
  page?: number;
  size?: number;
}

// 사용자 응답
export interface MemberResponse {
  username: string;
  name: string;
}

// 공지 반응
export type Reaction = "heart" | "thumbsUp" | "thumbsDown" | "clap" | "surprise" | "laugh" | "99";

// 공지별 읽음 상태 (내가 선택한 이모지)
export interface NoticeReadState {
  noticeId: number;
  myReaction: Reaction | null; // 내가 선택한 이모지 (null = 읽음 취소 상태)
}

export interface NoticeReader {
  username: string;
  name: string;
  reaction: string | null;
}

// 공지 상세에서 사용하는 읽음 통계
export interface NoticeReaderStats {
  readers: NoticeReader[];   // 이모지를 누른 팀원 목록 (팀장용)
  unreaders: MemberResponse[]; // 이모지를 누르지 않은 팀원 목록 (팀장용)
  isLoading: boolean;
}