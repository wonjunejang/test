import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useUserNoticeDetail } from "../hooks/useUserNoticeDetail";
import { fetchUserNotices } from "../../../lib/adminNoticeApi";
import useMemberStore from "../../member/store/useMemberStore";

const PAGE_SIZE = 10;

const UserNoticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const memberInfo = useMemberStore((state) => state.memberInfo);
  const username = memberInfo?.username ?? null;

  const { notice, isLoading } = useUserNoticeDetail(Number(id), username!);
  const [allIds, setAllIds] = useState<number[]>([]);

  // 전체 id 목록(이동용)
  useEffect(() => {
    if (!username) return;
    fetchUserNotices(username)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const ids = data
          .sort((a, b) => b.id - a.id)
          .map((n) => n.id);
        setAllIds(ids);
      })
      .catch((e) => console.error("목록 조회 실패", e));
  }, [username]);

  const currentIndex = allIds.indexOf(Number(id));
  const prevId = currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : null;
  const nextId = currentIndex > 0 ? allIds[currentIndex - 1] : null;

  if (isLoading) return <div className="text-center py-5 text-muted">불러오는 중...</div>;
  if (!notice) return null;

  return (
    <div className="nd-root container">
      
      {/* ── 헤더 ── */}
      <div className="nd-header">
        <div style={{width:"104px"}}>
          <button
            className="nd-back-btn"
            onClick={() => navigate("/notices")}
            aria-label="뒤로가기"
          >
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        </div>

        <span className="nd-header-title">관리자 공지</span>

        <div style={{width:"104px"}}></div>   

      </div>

      {/* ── 카드 ── */}
      <div className="nd-card">

        {/* 제목 / 메타 */}
        <div className="nd-meta">
          <div className="nd-meta-top">
            <h2 className="nd-notice-title">{notice.adminNoticeTitle}</h2>
          </div>
          <div className="nd-author">

            <div className="nd-writer-container">
              <div
                className="nd-writer-box nd-writer-color"
              >
                작성일
              </div>
              <span>{notice.adminNoticeCreatedAt.slice(0,10)}</span>
            </div>
            
          </div>
        </div>

        {/* 본문 */}
        <div className="nd-body">{notice.adminNoticeContent}</div>
      </div>

      {/* ── 이전 / 다음 ── */}
      <div className="nd-nav">
        <button
          className="nd-nav-btn"
          disabled={!prevId}
          onClick={() => prevId && navigate(`/notices/${prevId}`)}
        >
          이전
        </button>
        <button
          className="nd-nav-btn next"
          disabled={!nextId}
          onClick={() => nextId && navigate(`/notices/${nextId}`)}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default UserNoticeDetail;
