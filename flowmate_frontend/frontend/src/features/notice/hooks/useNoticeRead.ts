import { useState, useEffect, useCallback } from "react";
import useAuthStore from "../../../store/useAuthStore";
import { 
    readNotice, 
    unreadNotice, 
    fetchNoticeReaders, 
    fetchNoticeUnreaders, 
    fetchMyReadNoticeIds 
} from "../../../lib/noticeApi";
import type { MemberResponse, Reaction, NoticeReadState, NoticeReaderStats } from "../types";


/**
 * 공지 읽음 처리 훅
 *
 * - 사용자는 이모지(Reaction) 하나를 클릭해 읽음 처리를 할 수 있음
 * - 같은 이모지를 다시 클릭하면 읽음 취소
 * - 다른 이모지를 클릭하면 기존 읽음 취소 후 새 이모지로 재등록
 * - 팀장은 이모지를 누르지 않은 팀원 목록을 확인할 수 있음
 */
export default function useNoticeRead(projectId: number | string) {
  // State
  /**
   * {
      1: "LIKE",
      2: null,
      3: "DISLIKE"
     }
   */
  const [myReactions, setMyReactions] = useState<Record<number, Reaction | null>>({});

  const { memberRole } = useAuthStore();
  
  // 팀장 여부
  const isLeader = memberRole === "LEADER";

  
  /** 상세 페이지용 읽음/미읽음 팀원 통계 */
  const [readerStats, setReaderStats] = useState<NoticeReaderStats>({
    readers: [],
    unreaders: [],
    isLoading: false,
  });
 
  const [readNoticeIds, setReadNoticeIds] = useState<Set<number>>(new Set()); // 내가 읽은 공지 ID 리스트
  /**
   * 1. 내가 읽은 공지 ID 목록 가져오기 (목록 페이지용)
   */
  const getMyReadNoticeIds = useCallback(async () => {
    try {
      const res = await fetchMyReadNoticeIds(projectId);
      setReadNoticeIds(new Set(res.data));
    } catch (e) {
      console.error("내가 읽은 공지 로드 실패", e);
    }
  }, [projectId]);

  /**
   * 이모지 선택으로 읽음 처리 (토글 + 변경 지원)
   *
   * 동작:
   * 1. 같은 이모지 재클릭 → 읽음 취소 (DELETE)
   * 2. 다른 이모지 클릭   → 기존 취소 후 새 이모지로 읽음 처리 (DELETE → POST)
   * 3. 읽음 없는 상태     → 이모지로 읽음 처리 (POST)
   *
   * @param noticeId       - 대상 공지 ID
   * @param reaction       - 클릭한 이모지
   * @param afterToggle    - 토글 완료 후 콜백 (상세 페이지 통계 갱신 등)
   */
  const toggleReaction = useCallback(
    async (
      noticeId: number,
      reaction: Reaction,
      afterToggle?: () => void,
    ) => {
      try {
        // 1. 현재 반응 확인 (함수형 업데이트 내부가 아니므로 현재 render 시점의 myReactions 사용)
        const currentReaction = myReactions[noticeId] ?? null;
        const isSameReaction = currentReaction === reaction;

        if (isSameReaction) {
          // 같음 이모지 클릭 -> 읽음 취소
          await unreadNotice(projectId, noticeId);
          
          setMyReactions((prev) => ({ ...prev, [noticeId]: null }));
          setReadNoticeIds((prev) => {
            const next = new Set(prev);
            next.delete(noticeId);
            return next;
          });
        } else {
          // 다른 이모지 / 새로운 이모지 클릭
          if (currentReaction !== null) {
            await unreadNotice(projectId, noticeId);
          }

          await readNotice(projectId, noticeId, reaction);
          
          setMyReactions((prev) => ({ ...prev, [noticeId]: reaction }));
          setReadNoticeIds((prev) => new Set(prev).add(noticeId));
        }

        // 모든 상태 변경 후 콜백 실행
        if (afterToggle) afterToggle();

      } catch (error) {
        console.error("이모지 읽음 처리 실패", error);
      }
    },
    [projectId, unreadNotice, readNotice, myReactions] 
  );

  /**
   * 읽은 사람 리스트
   */
  const loadReaders = useCallback(
    async (noticeId: number | string) => {
      if (!noticeId || !projectId) return;
      setReaderStats((prev) => ({ ...prev, isLoading: true }));

      try {
        const res = await fetchNoticeReaders(projectId, noticeId);

        setReaderStats((prev) => ({
          ...prev,
          readers: res.data,
          isLoading: false,
        }));
      } catch (e) {
        console.error("읽은 사람 로드 실패", e);
        setReaderStats((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [projectId],
  );

  // 안 읽은 사람 (팀장 전용)
  const loadUnreaders = useCallback(
    async (noticeId: number | string) => {

      if (!noticeId || !projectId) return;
      setReaderStats((prev) => ({ ...prev, isLoading: true }));

      try {
        const res = await fetchNoticeUnreaders(projectId, noticeId);

        setReaderStats((prev) => ({
          ...prev,
          unreaders: res.data,
          isLoading: false,
        }));
      } catch (e) {
        console.error("미확인 명단 로드 실패", e);
        setReaderStats((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [projectId],
    // [projectId, isLeader],
  );

  // 초기 로드 시 읽은 ID 목록 가져오기
  useEffect(() => {
    if (projectId) {
      getMyReadNoticeIds();
    }
  }, [projectId, getMyReadNoticeIds]);

  /** 특정 공지를 읽었는지 여부 */
  const isRead = useCallback(
    (noticeId: number) => readNoticeIds.has(noticeId),
    [readNoticeIds],
  );

   /** 특정 공지에서 내가 선택한 이모지 반환 (없으면 null) */
  const getMyReaction = useCallback(
    (noticeId: number): Reaction | null => myReactions[noticeId] ?? null,
    [myReactions],
  );

  return {
   // ── 목록 페이지용 ──────────────────
    readNoticeIds,          // 내가 읽은 공지 ID Set
    isRead,                 // (noticeId) => boolean

    // ── 상세 페이지 / 이모지 ──────────
    myReactions,            // Record<noticeId, Reaction | null>
    getMyReaction,          // (noticeId) => Reaction | null
    setMyReactions,
    toggleReaction,         // (noticeId, reaction, afterToggle?) => void
 
    // ── 팀장용 읽음 통계 ──────────────
    readerStats,            // { readers, unreaders, isLoading }
    loadReaders,
    loadUnreaders,

    // ── 수동 갱신 ─────────────────────
    getMyReadNoticeIds,     // 목록 재조회
  };
}