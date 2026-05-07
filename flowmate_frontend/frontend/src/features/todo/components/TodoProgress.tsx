import type { TodoProgressResponse } from "../types";
import "../todo.css";

interface TodoProgressProps {
  progress: TodoProgressResponse | null;
}

const TodoProgress = ({ progress }: TodoProgressProps) => {
  if (!progress) return null;

  return (
    <div>
      {/* 통계 칩 */}
      <div className="d-flex flex-wrap gap-3 mb-3">
        <div className="progress-chip" style={{ background: "#FFFFFF", color: "#374151" }}>
          <span style={{fontWeight: 'bold'}}>전체</span>
          <span style={{ color: "#6B7280" }}>{progress.totalCount}건</span>
        </div>
        <div className="progress-chip" style={{ background: "#EFF6FF", color: "#1D4ED8" }}>
          <span className="progress-dot" style={{ background: "#60A5FA" }} />
          <span style={{fontWeight: 'bold'}}>예정</span>
          <span>{progress.pendingCount}</span>
        </div>
        <div className="progress-chip" style={{ background: "#FEF3C7", color: "#92400E" }}>
          <span className="progress-dot" style={{ background: "#FBBF24" }} />
          <span style={{fontWeight: 'bold'}}>진행 중</span>
          <span>{progress.inProgressCount}</span>
        </div>
        <div className="progress-chip" style={{ background: "#ECFDF5", color: "#065F46" }}>
          <span className="progress-dot" style={{ background: "#34D399" }} />
          <span style={{fontWeight: 'bold'}}>완료</span>
          <span>{progress.completedCount}</span>
        </div>
      </div>



      <div style={{ background: "#ffffff", borderRadius: "6px", padding: "12px 16px 16px" }}>

        {/* 팀 진행률 */}
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-baseline mb-1">
            <span style={{ fontSize: "12px", color: "var(--bs-secondary-color)" }}>팀 진행률</span>
            <span style={{ fontSize: "13px", fontWeight: 'bold' }}>{Math.round(progress.totalProgress)}%</span>
          </div>
          <div style={{ height: "20px", background: "#e0e0e0", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progress.totalProgress}%`, background: "linear-gradient(to right, #32C5FF 0%, #915CFF 50%, #E040FF 100%)", borderRadius: "100px" }} />
          </div>
        </div>

        {/* 내 진행률 */}
        <div>
          <div className="d-flex justify-content-between align-items-baseline mb-1">
            <span style={{ fontSize: "12px", color: "var(--bs-secondary-color)" }}>내 진행률</span>
            <span style={{ fontSize: "13px", fontWeight: 'bold' }}>{Math.round(progress.personalProgress)}%</span>
          </div>
          <div style={{ height: "20px", background: "#e0e0e0", borderRadius: "100px", overflow: "hidden" }}>
            <div style={{ width: `${progress.personalProgress}%`, height: "100%", background: "linear-gradient(to right, #32C5FF 0%, #915CFF 50%, #E040FF 100%)", borderRadius: "100px" }} />
          </div>
        </div>

      </div>



















    </div>
  );
};

export default TodoProgress;