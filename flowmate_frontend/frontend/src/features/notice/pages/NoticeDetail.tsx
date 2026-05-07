import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useProjectDetail } from "../../project"; 
import useMemberStore from "../../member/store/useMemberStore";
import useNoticeDetail from "../hooks/useNoticeDetail";
import useNoticeRead from "../hooks/useNoticeRead";
import NoticeCreateModal from "../components/NoticeCreateModal";
import type { Reaction } from "../types";
import '../notice.css';
import AlertModal from "../../../components/AlertModal";
import ConfirmModal from "../../../components/ConfirmModal";

// ─── 이모지 설정 ─────────────────────────────────────────────────────────────
 
const REACTIONS: { key: Reaction; emoji: string; label: string }[] = [
  { key: "heart",     emoji: "❤️",  label: "하트"    },
  { key: "thumbsUp",  emoji: "👍",  label: "좋아요"  },
  { key: "thumbsDown",emoji: "👎",  label: "싫어요"  },
  { key: "clap",      emoji: "👏",  label: "박수"    },
  { key: "surprise",  emoji: "😮",  label: "놀라움"  },
  { key: "laugh",     emoji: "😂",  label: "웃음"    },
];

// REACTIONS 배열 기반으로 단일 정의
const REACTION_KEYS = new Set(REACTIONS.map((r) => r.key));
const isValidReaction = (value: unknown): value is Reaction =>
  typeof value === "string" && REACTION_KEYS.has(value as Reaction);

// 날짜 포맷
const formatDate = (dateStr: string) => dateStr.slice(0, 10);

export default function NoticeDetail(){
  const navigate = useNavigate();
  const { projectId, noticeId } = useParams<{ projectId: string; noticeId: string }>();

  // 모달 열고 닫기
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // 삭제 확인 모달
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // 팀장 여부
  const { currentProject } = useProjectDetail(Number(projectId));
  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");
  const isLeader = currentProject?.leaderUsername === loginUsername;

  // 공지 상세 조회
  const { notice, isLoading, allIds, error, removeNotice, refetch,
  alertMessage, confirmMessage, handleAlertConfirm, handleDeleteConfirmed, closeConfirm, } 
    = useNoticeDetail(projectId!, noticeId!);
    
  // 페이징
  const { prevId, nextId } = useMemo(() => {
    const currentIndex = allIds.indexOf(Number(noticeId));
    return {
      prevId: currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : null,
      nextId: currentIndex > 0 ? allIds[currentIndex - 1] : null,
    };
  }, [allIds, noticeId]);

  // 읽음 처리
  const {
    getMyReaction,
    toggleReaction,
    setMyReactions,
    loadReaders,
    loadUnreaders,
    readerStats 
  } = useNoticeRead(projectId!);

  // 내가 입력한 반응
  const myReaction = getMyReaction(Number(noticeId));

  // 수정 여부
  const isUpdated = useMemo(
    () =>
      !!notice?.updatedAt &&
      new Date(notice.updatedAt) > new Date(notice.createdAt),
    [notice?.updatedAt, notice?.createdAt]
  );

  // 공지를 열 때마다 서버에서 받아온 notice.myReaction 값으로 동기화
  // notice.myReaction → 로컬 상태 동기화
  useEffect(() => {
    if (!notice) return;
    setMyReactions((prev) => ({
      ...prev,
      [Number(notice.noticeId)]: isValidReaction(notice.myReaction)
        ? notice.myReaction
        : null,
    }));
  }, [notice, setMyReactions]); // ✅ setMyReactions 의존성 추가

  // 읽음 통계 로드 함수로 추출
  const loadReaderStats = useCallback(() => {
    if (!noticeId || !projectId) return;
    loadReaders(Number(noticeId));
    if (isLeader) loadUnreaders(Number(noticeId));
  }, [noticeId, projectId, isLeader, loadReaders, loadUnreaders]);


  // 상세 진입 시 읽음 통계 로드
  useEffect(() => {
    if (noticeId && projectId) {
      loadReaderStats();
    }
  }, [noticeId, loadReaderStats]);
  // }, [noticeId, currentProject, loadReaderStats]);

  // 이모지 클릭 핸들러
  const handleReaction = useCallback(
    (reaction: Reaction) => {
      toggleReaction(Number(noticeId), reaction, loadReaderStats);
    },
    [noticeId, toggleReaction, loadReaderStats]
  );
 
  const handleDelete = useCallback(() => {
    removeNotice();
  }, [removeNotice]);

  // ─── 로딩 / 에러 ──────────────────────────
  if (isLoading) {
    return (
      <div className="nd-loading">
        <div className="nd-spinner" />
      </div>
    );
  }
 
  if (error || !notice) {
    return (
      <div className="nd-loading">
        <p style={{ color: "#6b7280" }}>공지를 불러올 수 없습니다.</p>
      </div>
    );
  }

return (

  <>
  {alertMessage && (
    <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
  )}
  {confirmMessage && (
    <ConfirmModal
      message={confirmMessage}
      onConfirm={handleDeleteConfirmed}
      onCancel={closeConfirm}
    />
  )}
  
  <div className="nd-root container">

    {/* ── 헤더 ── */}
    <div className="nd-header">
      <div style={{width:"104px"}}>
        <button
          className="nd-back-btn"
          onClick={() => navigate(`/projects/${projectId}/notices`)}
          aria-label="뒤로가기"
        >
          <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </button>
      </div>

      <span className="nd-header-title">공지</span>

      <div className="nd-header-actions">
        {isLeader ? (
          <>
            <button
              className="nd-header-btn"
              onClick={() => setIsEditModalOpen(true)}
            >
              수정
            </button>
            <button className="nd-header-btn danger" onClick={handleDelete}>
              삭제
            </button>
          </>
        ):(
          // ✅ 인라인 스타일 → className
            // <div className="nd-header-spacer" />
          <div style={{width:"104px"}}></div>
        )}
      </div>
    </div>

    {/* ── 카드 ── */}
    <div className="nd-card">
      {/* 제목 / 메타 */}
      <div className="nd-meta">
        <div className="nd-meta-top">
          <h2 className="nd-notice-title">{notice.noticeTitle}</h2>
          {isLeader && (
            <span className="nd-notice-sub">
              읽음 {Math.max(0, readerStats.readers.length - 1)} | 미확인 {readerStats.unreaders.length}
            </span>
          )}
        </div>

        <div className="nd-author">
          
          <div className="nd-writer-container">
            <div className="nd-writer-box nd-writer-color">작성일</div>
            <span>{formatDate(notice.createdAt)}</span>
          </div>

          {isUpdated && (
            <div className="nd-writer-container">
              <div className="nd-writer-box nd-updater-color">수정일</div>
              <span style={{ fontWeight: 500 }}>
                {formatDate(notice.updatedAt)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 본문 */}
      <div className="nd-body">{notice.noticeContent}</div>

      {!isLeader && (
        <>
          {/* 이모지 바 */}
          <div className="nd-reaction-row">
            <div className="nd-emoji-list">
              {REACTIONS.map(({ key, emoji }) => (
                <button
                  key={key}
                  className={`nd-emoji-btn ${myReaction === key ? "active" : ""}`}
                  onClick={() => handleReaction(key)}
                  aria-pressed={myReaction === key}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {/* 읽은 팀원 칩 목록 */}
      {readerStats.readers.length > 0 && (
        <div className="nd-readers-row">
          {readerStats.readers.map((member) => {
            const chipEmoji =
              REACTIONS.find((r) => r.key === member.reaction)?.emoji ?? "👑";

            return (
              <div key={member.username} className="nd-member-chip">
                <span className="nd-chip-emoji">{chipEmoji}</span>
                <span className="nd-chip-name">{member.name}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* 미확인 팀원 — 팀장 전용 */}
      {isLeader && (
        <div className="nd-unreaders-section">
          <div className="nd-unreaders-label">
            미확인 팀원
          </div>
          <div>
            {readerStats.unreaders.map((member) => (
              <span key={member.username} className="nd-unreader-chip">
                {member.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>

    {/* ── 이전 / 다음 ── */}
    <div className="nd-nav">
      <button
        className="nd-nav-btn"
        disabled={!prevId}
        onClick={() => prevId && navigate(`/projects/${projectId}/notices/${prevId}`)}
      >
        이전
      </button>
      <button
        className="nd-nav-btn next"
        disabled={!nextId}
        onClick={() => nextId && navigate(`/projects/${projectId}/notices/${nextId}`)}
      >
        다음
      </button>
    </div>

    {isEditModalOpen && (
      <NoticeCreateModal
        projectId={projectId!}
        noticeId={noticeId}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          refetch();
          loadReaderStats();
        }}
      />
    )}
    </div>
  </>
  );
};