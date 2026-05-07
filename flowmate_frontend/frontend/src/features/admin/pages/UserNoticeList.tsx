import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserNoticeList } from "../hooks/useUserNoticeList";
import useMemberStore from "../../member/store/useMemberStore";
import "../userStyle.css";

const PAGE_SIZE = 10;

const UserNoticeList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const memberInfo = useMemberStore((state) => state.memberInfo);
  const username = memberInfo?.username ?? null;

  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { notices, isLoading } = useUserNoticeList(username!);

  const fromProjectId = location.state?.fromProjectId;

  const handleBack = () => {
    if (fromProjectId) {
      navigate(`/projects/${fromProjectId}`);
    } else {
      navigate("/");
    }
  };

  const filteredNotices = keyword.trim()
    ? notices.filter((n) =>
        n.adminNoticeTitle.toLowerCase().includes(keyword.toLowerCase())
      )
    : notices;

  const totalPages = Math.ceil(filteredNotices.length / PAGE_SIZE);
  const paged = filteredNotices.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const handleSearch = () => {
    setKeyword(searchInput);
    setPage(0);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleReset = () => {
    setSearchInput("");
    setKeyword("");
    setPage(0);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setKeyword("");
    setPage(0);
  };

  return (
    <div className="container">
      
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleBack}
          >
            ←
          </button>
          <h1 className="discussion-title">관리자 공지사항</h1>
        </div>
      </div>
      

      <div className="input-group mb-3 discussion-search-bar">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="제목 또는 내용 키워드 입력"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        {keyword && (
          <button type="button" 
            className="btn" 
            onClick={handleSearchClear}
            style={{
              position: 'absolute',
              border: 'none',
              right: '4rem',
              zIndex: '99',
            }}
        >
            ✕
          </button>
        )}
        <button className="btn btn-outline-secondary" onClick={handleSearch}>
          검색
        </button>
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : (
        <>
          <table className="discussion-table">
            <thead>
              <tr>
                <th className="num" style={{ width: "10%" }}>번호</th>
                <th className="tit">제목</th>
                <th className="date" style={{ width: "20%" }}>작성일</th>
              </tr>
            </thead>
            <tbody className="user-list">
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-muted" style={{ padding: "20px" }}>
                    {keyword ? `"${keyword}"에 해당하는 공지가 없습니다.` : "공지사항이 없습니다."}
                  </td>
                </tr>
              ) : (
                paged.map((notice, index) => (

                  <tr 
                    key={notice.id}
                    className={notice.readYn === "N" ? "unread-notice" : ""}
                  >
                    <td className="num">
                      {filteredNotices.length - (page * PAGE_SIZE + index)}
                    </td>
                    <td
                      className="tit"
                      style={{ cursor: "pointer", fontWeight: notice.readYn === "N" ? 700 : 400 }}
                      onClick={() => navigate(`/notices/${notice.id}`, { state: { fromProjectId } })}
                      title={notice.adminNoticeTitle}
                    >
                      {notice.adminNoticeTitle.length > 28
                        ? notice.adminNoticeTitle.substring(0, 28) + "..."
                        : notice.adminNoticeTitle}
                    </td>
                    <td className="date">
                      {notice.adminNoticeCreatedAt?.toString().slice(0, 10)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center mt-4">
              <div className="pagination-wrap d-flex align-items-center">
                <button
                  onClick={() => setPage((p) => p - 1)}
                  disabled={page === 0}
                  className="pagination-btn"
                >&lt;</button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`pagination-btn ${page === i ? "pagination-btn-active" : ""}`}
                    >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page === totalPages - 1}
                  className="pagination-btn"
                >&gt;</button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UserNoticeList;