import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDiscussionList } from "../hooks/useDiscussionList";
import useAuthStore from "../../../store/useAuthStore";
import ConfirmModal from "../../../components/ConfirmModal";
import "../discussion.css";

const handleDate = (createdAt: string, updatedAt: string | null | undefined) => {
  if (updatedAt && new Date(updatedAt) > new Date(createdAt)) {
    return updatedAt.slice(0, 10);
  }
  return createdAt.slice(0, 10);
};

const DiscussionList = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { memberRole } = useAuthStore();

  const { discussions, isLoading, loadList, handleDelete } = useDiscussionList(projectId!);
  const [keyword, setKeyword] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const handleSearch = () => {
    loadList(keyword.trim() || undefined);
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSearchClear = () => {
    setKeyword("");
    loadList();
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div className="d-flex align-items-center gap-3">
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm"
            onClick={() => navigate(`/projects/${projectId}`)}
          >
            ←
          </button>
          <h1 className="discussion-title">회의록</h1>
        </div>
        <button
          type="button"
          className="btn btn-dark btn-sm"
          onClick={() => navigate(`/projects/${projectId}/discussions/create`)}
        >
          회의록 추가
        </button>
      </div>


      {/* 검색창 */}
      <div className="mb-3 discussion-search-bar">
        <div className="input-group">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="제목 또는 내용 키워드 입력"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleSearchKeyDown}
          />
          <button 
            type="button" 
            className="btn btn-outline-secondary" 
            onClick={handleSearch}>
            검색
          </button>
        </div>

        {keyword && (
          <button
            type="button"
            className="btn nd-search-clear-btn" 
            onClick={handleSearchClear}
        >
            ✕
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : discussions.length === 0 ? (
        <div className="discussion-empty">해당하는 글이 없습니다.</div>
      ) : (
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
            {[...discussions]
              .sort((a, b) => {
                const dateA = new Date(a.discussionUpdatedAt ?? a.discussionCreatedAt).getTime();
                const dateB = new Date(b.discussionUpdatedAt ?? b.discussionCreatedAt).getTime();
                return dateB - dateA;
              })
              .map((d, index) => {
                const isUpdated =
                  d.discussionUpdatedAt &&
                  new Date(d.discussionUpdatedAt) > new Date(d.discussionCreatedAt);

                const displayAuthor = isUpdated
                  ? d.updatedUsername || d.createdUsername
                  : d.createdUsername;

                const displayDate = handleDate(d.discussionCreatedAt, d.discussionUpdatedAt);

                return (
                  <tr
                    key={d.discussionId}
                    onClick={() => navigate(`/projects/${projectId}/discussions/${d.discussionId}`)}
                  >
                    <td>{index + 1}</td>
                    <td style={{ textAlign: "left" }}>
                      {d.discussionTitle}
                      {isUpdated && (
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#888",
                            marginLeft: "8px",
                            fontWeight: "normal",
                          }}
                        >
                          (수정됨)
                        </span>
                      )}
                    </td>
                    <td>{displayAuthor}</td>
                    <td>{displayDate}</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      )}
      {deleteTargetId !== null && (
        <ConfirmModal
          message="정말 삭제하시겠습니까?"
          onCancel={() => setDeleteTargetId(null)}
          onConfirm={async () => {
            await handleDelete(deleteTargetId);
            setDeleteTargetId(null);
          }}
        />
      )}
    </div>
  );
};

export default DiscussionList;
