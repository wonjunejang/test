import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDiscussionDetail } from "../hooks/useDiscussionDetail";
import "../discussion.css";
import ConfirmModal from "../../../components/ConfirmModal";
import { useDiscussionList } from "../hooks/useDiscussionList";
import useAuthStore from "../../../store/useAuthStore";

const DiscussionDetail = () => {
  const { projectId, discussionId } = useParams<{ projectId: string; discussionId: string }>();
  const navigate = useNavigate();

  const { discussion, isLoading, prevId, nextId } = useDiscussionDetail(projectId!, discussionId!);

  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const { handleDelete } = useDiscussionList(projectId!);

  const { memberRole } = useAuthStore();
  const isLeader = memberRole === "LEADER";

  const handleDeleteClick = (e: React.MouseEvent, discussionId: number) => {
    e.stopPropagation();
    setDeleteTargetId(discussionId);
  };

  if (isLoading) return <div className="text-center py-5 text-muted">불러오는 중...</div>;
  if (!discussion) return null;

  return (
    <div className="nd-root container">
      {/* ── 헤더 ── */}
      <div className="nd-header">
        <div style={{ width: "104px" }}>
          <button
            className="nd-back-btn"
            onClick={() => navigate(`/projects/${projectId}/discussions`)}
            aria-label="뒤로가기"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <span className="nd-header-title">회의록</span>

        <div className="nd-header-actions" style={{ width: "104px", justifyContent: "end" }}>
          <button
            className="nd-header-btn"
            onClick={() => navigate(`/projects/${projectId}/discussions/${discussionId}/edit`)}
          >
            수정
          </button>
          {isLeader && (
            <button
              className="nd-header-btn danger"
              onClick={(e) => handleDeleteClick(e, Number(discussionId))}
            >
              삭제
            </button>
          )}
        </div>
      </div>

      {/* ── 카드 ── */}
      <div className="nd-card">
        {/* 상단 */}
        <div className="nd-meta">
          {/* 제목 */}
          <div className="nd-meta-top">
            <h2 className="nd-notice-title">{discussion.discussionTitle}</h2>
          </div>

          {/* 메타 */}
          <div className="nd-author">
            <div className="nd-writer-container">
              <div className="nd-writer-box nd-writer-color">작성자</div>
              <span style={{ fontWeight: 600 }}>{discussion.createdUsername}</span>
              <span>{discussion.discussionCreatedAt.slice(0, 10)}</span>
            </div>

            {/* 수정자 행 — 수정된 경우만 표시 */}
            {discussion.updatedUsername &&
              discussion.discussionUpdatedAt &&
              new Date(discussion.discussionUpdatedAt) >
                new Date(discussion.discussionCreatedAt) && (
                <div className="nd-writer-container">
                  <div className="nd-writer-box nd-updater-color">수정자</div>
                  <span style={{ fontWeight: 600 }}>{discussion.updatedUsername}</span>
                  <span style={{ fontWeight: 500 }}>
                    {discussion.discussionUpdatedAt.slice(0, 10)}
                  </span>
                </div>
              )}
          </div>
        </div>

        {/* 본문 */}
        <div className="nd-body">{discussion.discussionContent}</div>

        {/* 회의 참여자 목록 */}
        <div className="nd-unreaders-section">
          <div className="nd-unreaders-label">회의 참여자 목록</div>
          <div>
            {discussion.members.map((member) => (
              <span key={member.memberName} className="nd-unreader-chip">
                {member.memberName}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── 이전 / 다음 ── */}
      <div className="nd-nav">
        <button
          className="nd-nav-btn"
          disabled={!prevId}
          onClick={() => prevId && navigate(`/projects/${projectId}/discussions/${prevId}`)}
        >
          이전
        </button>
        <button
          className="nd-nav-btn next"
          disabled={!nextId}
          onClick={() => nextId && navigate(`/projects/${projectId}/discussions/${nextId}`)}
        >
          다음
        </button>
      </div>

      {deleteTargetId !== null && (
        <ConfirmModal
          message="정말 삭제하시겠습니까?"
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={async () => {
            await handleDelete(deleteTargetId!);
            setDeleteTargetId(null);
            navigate(`/projects/${projectId}/discussions`);
          }}
        />
      )}
    </div>
  );
};

export default DiscussionDetail;
