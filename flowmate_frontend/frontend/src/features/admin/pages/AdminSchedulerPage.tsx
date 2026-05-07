import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdminScheduler, PAGE_SIZE } from "../hooks/useAdminScheduler";
import type { FilterType } from "../types";
import "../schedulerStyle.css";
import ConfirmModal from "../../../components/ConfirmModal";
import AlertModal from "../../../components/AlertModal";

const FILTERS: { label: string; value: FilterType }[] = [
  { label: "전체", value: "ALL" },
  { label: "멤버", value: "MEMBER" },
  { label: "투두", value: "TODO" },
  { label: "회의록", value: "DISCUSSION" },
  { label: "프로젝트", value: "PROJECT" },
];

const TYPE_LABEL: Record<string, string> = {
  MEMBER: "멤버",
  TODO: "투두",
  DISCUSSION: "회의록",
  PROJECT: "프로젝트",
};

const TYPE_COLOR: Record<string, string> = {
  MEMBER: "#28a9ff",
  TODO: "#ff9810",
  DISCUSSION: "#00be3f",
  PROJECT: "#9b00d8",
};

const getDday = (scheduledAt: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(scheduledAt);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const AdminSchedulerPage = () => {
  const navigate = useNavigate();
  const {
    list,
    filter,
    page,
    setPage,
    isLoading,
    isRunning,
    handleFilterChange,
    handleManualRun,
  } = useAdminScheduler();

  const totalPages = Math.ceil(list.length / PAGE_SIZE);
  const paged = list.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const [showConfirm, setShowConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleManualRunClick = () => {
    setShowConfirm(true);
  };
  
  const executeManualRun = async () => {
    setShowConfirm(false);
    try {
      await handleManualRun();
      setAlertMessage("수동 실행이 완료되었습니다. 삭제 대기 데이터가 정리되었습니다.");
    } catch (e) {
      setAlertMessage("실행 중 오류가 발생했습니다.");
    }
  };

  const typeCounts = ["MEMBER", "TODO", "DISCUSSION", "PROJECT"].map((type) => ({
    type,
    label: TYPE_LABEL[type],
    color: TYPE_COLOR[type],
    count: list.filter((item) => item.type === type).length,
  }));

  return (
    <div className="container admin-container">
      <div className="container-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/admin")}
        />
        <h1 className="fw-bold">삭제 대기 목록</h1>
        <button
          type="button"
          className="btn-manual"
          onClick={handleManualRunClick}
          disabled={isRunning}
        >
          {isRunning ? "실행 중..." : "수동 실행"}
        </button>
      </div>
      
      <div className="d-flex summary-filter">
        {!isLoading && (
          <div className="d-flex gap-3">
            <div
              className="summary-card d-flex"
              style={{ borderLeft: `4px solid #333` }}
              onClick={() => handleFilterChange("ALL")}
            >
              <div className="summary-count">{list.length}</div>
              <div className="summary-label">전체</div>
            </div>
            {typeCounts.map((t) => (
              <div
                key={t.type}
                className="summary-card d-flex"
                style={{ borderLeft: `4px solid ${t.color}`, cursor: "pointer" }}
                onClick={() => handleFilterChange(t.type as FilterType)}
              >
                <div className="summary-count" style={{ color: t.color }}>{t.count}</div>
                <div className="summary-label">{t.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="filter-drop">
          <p className="fw-bold">필터</p>
          <select
            className="form-select form-select-sm"
            style={{ width: "120px" }}
            value={filter}
            onChange={(e) => handleFilterChange(e.target.value as FilterType)}
          >
            {FILTERS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-5 text-muted">불러오는 중...</div>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th className="num" style={{ width: "10%" }}>번호</th>
                <th className="type" style={{ width: "15%" }}>타입</th>
                <th className="tit">제목/이름</th>
                <th className="date-del" style={{ width: "15%" }}>삭제일</th>
                <th className="pending-delete" style={{ width: "20%" }}>삭제 예정일</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center text-muted" style={{ padding: "20px" }}>
                    삭제 대기 중인 데이터가 없습니다.
                  </td>
                </tr>
              ) : (
                paged.map((item, index) => {
                  const dday = getDday(item.scheduledAt);
                  return (
                    <tr key={`${item.type}-${item.id}`}>
                      <td className="num">{page * PAGE_SIZE + index + 1}</td>
                      <td className="type">
                        <span
                          className="type"
                          style={{ background: TYPE_COLOR[item.type] }}
                        >
                          {TYPE_LABEL[item.type] ?? item.type}
                        </span>
                      </td>
                      <td className="tit d-flex"
                        title={item.title}
                      >
                        {item.title.length > 17
                          ? item.title.substring(0, 17) + "..."
                          : item.title
                        }
                        <span
                          className="dday"
                          style={{
                            background: dday <= 3 ? "#dc3545" : "#aaaaaa",
                            fontWeight: dday <= 3 ? 700 : 400,
                          }}
                        >
                          D-{dday}
                        </span>
                      </td>
                      <td className="date-del">{item.deletedAt?.toString().slice(0, 10)}</td>
                      <td className="pending-delete" style={{ color: "#dc3545", fontWeight: 600 }}>
                        {item.scheduledAt?.toString().slice(0, 10)}
                      </td>
                    </tr>
                  );
                })
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

      {showConfirm && (
        <ConfirmModal
          message="모든 삭제 대기 데이터를 영구 삭제하시겠습니까?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={executeManualRun}
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

export default AdminSchedulerPage;