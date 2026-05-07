import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminNoticeList } from "../hooks/useAdminNoticeList";
import "../adminStyle.css";
import ConfirmModal from "../../../components/ConfirmModal";
import AlertModal from "../../../components/AlertModal";

const PAGE_SIZE = 10;

const AdminNoticeList = () => {
  const navigate = useNavigate();
  const { notices, deletedNotices, isLoading, handleDelete, handleRestore } = useAdminNoticeList();
  const [page, setPage] = useState(0);
  const [keyword, setKeyword] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const [confirmConfig, setConfirmConfig] = useState<{
    id: number;
    type: "DELETE" | "RESTORE";
  } | null>(null);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const allNotices = [...notices, ...deletedNotices].sort((a, b) => b.id - a.id);

  const filteredNotices = keyword.trim()
    ? allNotices.filter((n) =>
        n.adminNoticeTitle.toLowerCase().includes(keyword.toLowerCase())
      )
    : allNotices;

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

  const handleDeleteClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmConfig({ id, type: "DELETE" });
  };

  const handleRestoreClick = (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    setConfirmConfig({ id, type: "RESTORE" });
  };

  const handleConfirm = async () => {
    if (!confirmConfig) return;
    try {
      if (confirmConfig.type === "DELETE") {
        await handleDelete(confirmConfig.id);
        setAlertMessage("공지가 삭제되었습니다.");
      } else {
        await handleRestore(confirmConfig.id);
        setAlertMessage("공지가 복원되었습니다.");
      }
    } catch (error) {
      setAlertMessage("작업 중 오류가 발생했습니다.");
    } finally {
      setConfirmConfig(null);
    }
  };

  return (
    <div className="container admin-container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate("/admin")}
          >
            ←
          </button>
          <h1 className="discussion-title">공지사항 관리</h1>
        </div>
        <button
          type="button"
          className="btn btn-dark btn-sm"
          onClick={() => navigate("/admin/notices/create")}
        >
          공지 추가
        </button>
      </div>
      

      <div className="input-group mb-3 discussion-search-bar">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="키워드 입력"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <button type="button" className="btn btn-outline-secondary" onClick={handleSearch}>
          검색
        </button>
        {keyword && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleReset}
          >
            초기화
          </button>
        )}
      </div>

      {/* <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`/admin`)}
          >
            ←
          </button>
          <h1 className="discussion-title">관리자 공지</h1>
        </div>
        <button
          type="button"
          className="btn btn-dark btn-sm"
          onClick={() => navigate("/admin/notices/create")}
        >
          공지 추가
        </button>
      </div>
      

      <div className="input-group mb-3 discussion-search-bar">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="키워드 입력"
          value={keyword}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <button type="button" className="btn btn-outline-secondary" onClick={handleSearch}>
          검색
        </button>
        {keyword && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleReset}
          >
            초기화
          </button>
        )}
      </div> */}
{/* 
      <div className="container-header">
        <button type="button" className="back-btn" onClick={() => navigate("/admin")} />
        <h1 className="fw-bold">공지사항 관리</h1>
        <button
          type="button"
          className="create-btn"
          onClick={() => navigate("/admin/notices/create")}
        >
          공지 등록
        </button>
      </div>

      <div className="d-flex gap-2 mb-3">
        <input
          type="text"
          className="form-control form-control-sm"
          placeholder="제목 검색"
          style={{ maxWidth: "300px" }}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={handleSearchKeyDown}
        />
        <button
          type="button"
          className="btn btn-dark btn-sm"
          onClick={handleSearch}
        >
          검색
        </button>
        {keyword && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={handleReset}
          >
            초기화
          </button>
        )}
      </div> */}

      {isLoading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th className="num" style={{ width: "10%" }}>번호</th>
                <th className="tit">제목</th>
                <th className="date" style={{ width: "20%" }}>작성일</th>
                <th className="status" style={{ width: "15%" }}>상태</th>
                <th className="manage" style={{ width: "15%" }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredNotices.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: "20px" }}>
                    {keyword ? `"${keyword}"에 해당하는 공지가 없습니다.` : "등록된 공지가 없습니다."}
                  </td>
                </tr>
              ) : (
                paged.map((notice, index) => (
                  <tr
                    key={notice.id}
                    style={{ color: notice.delYn === "Y" ? "#cccccc" : "inherit" }}
                  >
                    <td className="num">
                      {filteredNotices.length - (page * PAGE_SIZE + index)}
                    </td>
                    <td
                      className="tit"
                      style={{
                        textDecoration: notice.delYn === "Y" ? "line-through" : "none",
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/admin/notices/${notice.id}`)}
                      title={notice.adminNoticeTitle}
                    >
                      {notice.adminNoticeTitle.length > 22
                        ? notice.adminNoticeTitle.substring(0, 22) + "..."
                        : notice.adminNoticeTitle}
                    </td>
                    <td className="date">
                      {notice.adminNoticeCreatedAt?.toString().slice(0, 10)}
                    </td>
                    <td className="status">
                      <span className={`${notice.delYn === "N" ? "status-suc" : "status-del"}`}>
                        {notice.delYn === "N" ? "공개" : "삭제"}
                      </span>
                    </td>
                    <td className="manage" onClick={(e) => e.stopPropagation()}>
                      {notice.delYn === "N" ? (
                        <button
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                          onClick={(e) => handleDeleteClick(e, notice.id)}
                        >
                          삭제
                        </button>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-outline-secondary btn-sm"
                          onClick={(e) => handleRestoreClick(e, notice.id)}
                        >
                          복원
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="d-flex justify-content-center page-btn">
              <div className="btn-group">
                <button
                  type="button"
                  className="btn btn-outline-secondary page-prev-btn"
                  disabled={page === 0}
                  onClick={() => setPage((p) => p - 1)}
                >
                  이전
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={`btn ${page === i ? "btn-dark" : "btn-outline-secondary"}`}
                    onClick={() => setPage(i)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className="btn btn-outline-secondary page-next-btn"
                  disabled={page === totalPages - 1}
                  onClick={() => setPage((p) => p + 1)}
                >
                  다음
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {confirmConfig && (
        <ConfirmModal
          message={
            confirmConfig.type === "DELETE"
              ? "공지를 삭제하시겠습니까?"
              : "공지를 복원하시겠습니까?"
          }
          onCancel={() => setConfirmConfig(null)}
          onConfirm={handleConfirm}
        />
      )}

      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => setAlertMessage(null)}
        />
      )}
    </div>
  );
};

export default AdminNoticeList;