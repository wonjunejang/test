import { useState, useEffect } from "react";
import type { TodoSearchRequest, TodoStatus, TodoPriority } from "../types";
import arrowDown from "../../../assets/arrow-down.png";
import "../todo.css";

interface TodoFilterProps {
  onFilter: (params: TodoSearchRequest) => void;
  onReset: () => void;
  parts: { id: number; name: string }[];
  members: { username: string; memberName: string }[];
  projectId: number;
}

const SESSION_KEY = (projectId: number) => `todo-filter-${projectId}`;

const TodoFilter = ({ onFilter, onReset, parts, members, projectId }: TodoFilterProps) => {
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<TodoStatus | "">("");
  const [priority, setPriority] = useState<TodoPriority | "">("");
  const [partId, setPartId] = useState<number | "">("");
  const [assigneeUsername, setAssigneeUsername] = useState("");
  const [sort, setSort] = useState("dueAsc");

  // 마운트 시 sessionStorage에서 필터 UI 복원
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY(projectId));
      if (!saved) return;
      const parsed: TodoSearchRequest = JSON.parse(saved);
      setKeyword(parsed.keyword ?? "");
      setStatus((parsed.status as TodoStatus) ?? "");
      setPriority((parsed.priority as TodoPriority) ?? "");
      setPartId(parsed.projectPartId ?? "");
      setAssigneeUsername(parsed.assigneeUsername ?? "");
      setSort(parsed.sort ?? "dueAsc");
    } catch {}
  }, [projectId]);

  const handleSearch = () => {
    onFilter({
      keyword: keyword || undefined,
      status: status || undefined,
      priority: priority || undefined,
      projectPartId: partId || undefined,
      assigneeUsername: assigneeUsername || undefined,
      sort,
    });
  };

  const handleReset = () => {
    setKeyword("");
    setStatus("");
    setPriority("");
    setPartId("");
    setAssigneeUsername("");
    setSort("dueAsc");
    onReset();
  };

  const selectStyle: React.CSSProperties = {
    backgroundImage: `url(${arrowDown})`,
    backgroundRepeat: "no-repeat",
    backgroundPosition: "right 8px center",
    backgroundSize: "22px 22px",
  };

  return (
    <div className="d-flex flex-column flex-md-row gap-2">

      {/* 왼쪽 영역 - 검색/정렬(위) + 필터(아래) */}
      <div className="d-flex flex-column gap-2 flex-grow-1">

        {/* 위 - 검색 + 정렬 */}
        <div className="d-flex flex-column flex-md-row gap-2">
          <div className="d-flex align-items-center gap-2">
            <label className="todo-label fw-semibold small mb-0 text-nowrap">검색</label>
            <input
              type="text"
              placeholder="업무 검색"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="form-control form-control-sm todo-filter-search"
            />
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="todo-label fw-semibold small mb-0 text-nowrap">정렬</label>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="form-select form-select-sm todo-filter-input"
              style={selectStyle}
            >
              <option value="dueAsc">마감임박순</option>
              <option value="dueDesc">마감늦은순</option>
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>
        </div>

        {/* 아래 - 상태 + 파트 + 중요도 + 담당자 */}
        <div className="d-flex flex-column flex-md-row gap-2">
          <div className="d-flex align-items-center gap-2">
            <label className="todo-label fw-semibold small mb-0 text-nowrap">상태</label>
            <select value={status} onChange={(e) => setStatus(e.target.value as TodoStatus | "")}
              className="form-select form-select-sm todo-filter-input" style={selectStyle}>
              <option value="">전체</option>
              <option value="TDEXT">예정</option>
              <option value="TDINPROG">진행중</option>
              <option value="TDFIN">완료</option>
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="todo-label fw-semibold small mb-0 text-nowrap">파트</label>
            <select value={partId} onChange={(e) => setPartId(e.target.value ? Number(e.target.value) : "")}
              className="form-select form-select-sm todo-filter-input" style={selectStyle}>
              <option value="">전체</option>
              {parts.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="todo-label fw-semibold small mb-0 text-nowrap">중요도</label>
            <select value={priority} onChange={(e) => setPriority(e.target.value as TodoPriority | "")}
              className="form-select form-select-sm todo-filter-input" style={selectStyle}>
              <option value="">전체</option>
              <option value="HIGH">상</option>
              <option value="MID">중</option>
              <option value="LOW">하</option>
            </select>
          </div>
          <div className="d-flex align-items-center gap-2">
            <label className="todo-label fw-semibold small mb-0 text-nowrap">담당자</label>
            <select value={assigneeUsername} onChange={(e) => setAssigneeUsername(e.target.value)}
              className="form-select form-select-sm todo-filter-input" style={selectStyle}>
              <option value="">전체</option>
              {members.map((m) => <option key={m.username} value={m.username}>{m.memberName}</option>)}
            </select>
          </div>
        </div>

      </div>

      {/* 오른쪽 영역 - 버튼 (데스크탑: 세로중앙, 모바일: 맨아래) */}
      <div className="d-flex flex-row flex-md-row align-items-start gap-2 px-md-0 px-2">
        <button onClick={handleReset} className="btn btn-outline-secondary btn-sm flex-grow-1 flex-md-grow-0">초기화</button>
        <button onClick={handleSearch} className="btn btn-outline-secondary btn-sm flex-grow-1 flex-md-grow-0">검색</button>
      </div>

    </div>
  );
};

export default TodoFilter;