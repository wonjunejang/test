import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProjectDetail } from "../../project/hooks/useProjectDetail";
import useMemberStore from "../../member/store/useMemberStore";
import useNoticeList from "../hooks/useNoticeList";
import useNoticeRead from "../hooks/useNoticeRead";
import NoticeCreateModal from "../components/NoticeCreateModal";
import NoticeListItem from "../components/NoticeListItem";
import AlertModal from "../../../components/AlertModal";

const PAGE_SIZE = 10;

export default function NoticeList() {
  const navigate = useNavigate();
  const { projectId } = useParams<{ projectId: string }>();

  // 모달 open 여부
  const [isModalOpen, setIsModalOpen] = useState(false);
  // 검색
  const [inputKeyword, setInputKeyword] = useState(""); // 입력 중인 값
  const [searchKeyword, setSearchKeyword] = useState(""); // 실제 검색에 쓰이는 값
  // 페이징
  const [currentPage, setCurrentPage] = useState(1);

  // 사용자 & 팀장 여부
  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");
  const { currentProject } = useProjectDetail(Number(projectId));
  const isLeader = currentProject?.leaderUsername === loginUsername;

  // 공지 목록, 상세 조회
  const { notices, isLoading, refetch, handleMoveToNotice,
     alertMessage, clearAlert } = useNoticeList(projectId!, searchKeyword);

  // 공지 읽음 여부
  const { isRead } = useNoticeRead(projectId!);

  /**
   * Handler
   */

  // 검색
  const handleSearch = useCallback(() => {
    setSearchKeyword(inputKeyword.trim());
    setCurrentPage(1);
  }, [inputKeyword]);

  const handleSearchClear = useCallback(() => {
    setInputKeyword("");
    setSearchKeyword("");
    setCurrentPage(1);
  }, []);

  const handleSearchKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") handleSearch();
    },
    [handleSearch]
  );

  // 페이징
  const totalPages = useMemo(
    () => Math.ceil(notices.length / PAGE_SIZE),
    [notices.length]
  );

  const paginatedNotices = useMemo(
    () => notices.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [notices, currentPage]
  );

  const pageNumbers = useMemo(() => {
    const delta = 2;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  }, [currentPage, totalPages]);

  /**
   * 화면
   */
  
  return (
    <>
    {alertMessage && (
      <AlertModal message={alertMessage} onConfirm={clearAlert} />
    )}
    
    <div className="container">

      {/* 헤더 */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            ←
          </button>
          <h1 className="discussion-title">공지</h1>
        </div>
        {isLeader && (
          <button
            type="button"
            className="btn btn-dark btn-sm"
            onClick={() => setIsModalOpen(true)}
          >
            공지 추가
          </button>
        )}
      </div>
      
      {/* 검색창 */}
      <div className="mb-3 discussion-search-bar">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="제목 또는 내용 키워드 입력"
            value={inputKeyword}
            onChange={(e) => setInputKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button 
            type="button" 
            className="btn btn-outline-secondary" 
            onClick={handleSearch}>
            검색
          </button>
        </div>

        {inputKeyword && (
          <button
            type="button"
            className="btn nd-search-clear-btn" 
            onClick={handleSearchClear}
        >
            ✕
          </button>
        )}
      </div>

      {/* 목록 */}
      {isLoading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : notices.length === 0 ? (
        <div className="discussion-empty">해당하는 글이 없습니다.</div>
      ) : (
        <>
          <table className="discussion-table">
            <thead>
              <tr>
                <th style={{ width: "10%" }}>번호</th>
                <th>제목</th>
                <th style={{ width: "15%" }}>작성자</th>
                <th style={{ width: "20%" }}>작성일</th>
              </tr>
            </thead>
            <tbody>
              {paginatedNotices.map((n, index) => (
                <NoticeListItem 
                  key={n.noticeId}
                  notice={n} // 공지 정보
                  index={notices.length - ((currentPage - 1) * PAGE_SIZE + index)} // 공지 번호
                  onClick={handleMoveToNotice}
                  isRead={isLeader ? true : isRead(n.noticeId)}
                />
              ))}
            </tbody>
          </table>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-3">
              <div className="pagination-wrap d-flex align-items-center">
                <button
                  onClick={() => setCurrentPage((p) => p - 1)}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >&lt;</button>

                {pageNumbers.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`pagination-btn ${currentPage === page ? "pagination-btn-active" : ""}`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >&gt;</button>
              </div>
            </div>
          )}
        </>
      )}

      {/* 공지 생성 모달 */}
      {isModalOpen && (
        <NoticeCreateModal
          projectId={projectId!}
          onClose={() => setIsModalOpen(false)}
          onSuccess={refetch}
        />
      )}

    </div>
    </>
  );
}
