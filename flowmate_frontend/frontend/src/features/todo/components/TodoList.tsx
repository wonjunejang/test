import { useNavigate } from "react-router-dom";
import type { TodoListResponse } from "../types";
import { PRIORITY_LABEL } from "./priority";
import "../todo.css";

interface TodoListProps {
  projectId: number;
  todos: TodoListResponse[];
  isLoading: boolean;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onDelete: (todoId: number) => void;
}

const getStatusStyle = (status: string, delayed: boolean): React.CSSProperties => {
  if (delayed) return { background: "#fde8e8", color: "#e74c3c" };
  switch (status) {
    case "TDINPROG": return { background: "#DBE9FF", color: "#0062FF" };
    case "TDFIN":    return { background: "#F6F6F6", color: "#000000" };
    default:         return { background: "#E9E9E9", color: "#888888" };
  }
};

const TodoList = ({ projectId, todos, isLoading, currentPage, totalPages, onPageChange, onDelete }: TodoListProps) => {
  const navigate = useNavigate();

  if (isLoading) return (
    <div className="text-center py-4" style={{ color: "#999", fontSize: "13px" }}>로딩 중...</div>
  );
  if (!todos) return null;

  return (
    <div>
      {/* 테이블 - 데스크탑 */}
      <div className="todo-table-wrap" style={{ borderRadius: "20px" }}>
        <table style={{borderCollapse: "separate", borderSpacing: 0, width: "100%", fontSize: "12px" }}>
          <thead className="text-center">
            <tr style={{ background: "#D9D9D9", borderBottom: "1px solid #8C8C8C" }}>
              <th style={{padding: "10px", fontSize: "12px"}}>업무</th>
              <th style={{padding: "10px", width: "15%", fontSize: "12px"}}>파트</th>
              <th style={{padding: "10px", width: "10%", fontSize: "12px"}}>상태</th>
              <th style={{padding: "10px", width: "10%", fontSize: "12px"}}>마감일</th>
              <th style={{padding: "10px", width: "5%", fontSize: "12px"}}>중요도</th>
              <th style={{padding: "10px", width: "15%", fontSize: "12px"}}>담당자</th>
              {/* {["업무", "파트", "상태", "마감일", "중요도", "담당자"].map((h) => (
                <th className="text-center fw-medium"
                  style={{ color: "#333", fontSize: "12px" }}
                >{h}</th>
              ))} */}
            </tr>
          </thead>
          <tbody>
            {todos.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-4" style={{ color: "#999", fontSize: "12px", padding: "10px" }}>
                  배정된 업무가 없습니다.
                </td>
              </tr>
            ) : (
              todos.map((todo, index) => (
                <tr className="fw-medium "
                  key={todo.todoId}
                  onClick={() => navigate(`/projects/${projectId}/todos/${todo.todoId}`)}
                  style={{
                    borderBottom: index < todos.length - 1 ? "1px solid #8C8C8C" : "none",
                    cursor: "pointer",
                    background: todo.delayed ? "#fff5f5" : "transparent",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = todo.delayed ? "#ffe8e8" : "#f9f9f9")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = todo.delayed ? "#fff5f5" : "transparent")}
                >
                  <td className="px-3 py-2 fw-medium" style={{ color: "#222", fontSize: "12px" }}>{todo.todoTitle}</td>
                  <td className="px-3 py-2 fw-medium text-center" style={{ color: "#444", fontSize: "12px" }}>{todo.projectPartName}</td>
                  <td className="px-3 py-2 text-center">
                    <span className="todo-status-badge" style={getStatusStyle(todo.todoStatus, todo.delayed)}>
                      {todo.delayed ? "지연" : todo.displayStatusName}
                    </span>
                  </td>

                  <td
                    className="text-center"
                    style={{
                      color: "#444",
                      fontSize: "12px",
                      padding: "10px"
                    }}
                  >
                    {todo.todoDueAt ? new Date(todo.todoDueAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) : "-"}
                  </td>

                  <td className="text-center"
                    style={{padding: "10px"}}
                  >
                    {(() => {
                      const badge = PRIORITY_LABEL[todo.todoPriority];
                      return badge ? (
                        <span style={{
                          display: "inline-flex", alignItems: "center", justifyContent: "center",
                          padding: "4px", borderRadius: "100%", fontSize: "11px",
                          background: badge.background, color: badge.color, fontWeight: 500, lineHeight: 1,
                        }}>
                          {badge.label}
                        </span>
                      ) : <span style={{ color: "#999" }}>-</span>;
                    })()}
                  </td>

                  <td className="text-center"
                    style={{
                      color: "#444",
                      fontSize: "12px",
                      padding: "10px"
                    }}
                  >
                    {todo.assigneeMemberName}
                  </td>

                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 카드형 - 모바일 */}
      <div className="todo-card-wrap">
        {todos.length === 0 ? (
          <div className="text-center py-4" style={{ color: "#999", fontSize: "12px" }}>배정된 업무가 없습니다.</div>
        ) : (
          todos.map((todo) => {
            const badge = PRIORITY_LABEL[todo.todoPriority];
            return (
              <div
                key={todo.todoId}
                onClick={() => navigate(`/projects/${projectId}/todos/${todo.todoId}`)}
                className="todo-card-item"
                style={{ background: todo.delayed ? "#fff5f5" : "#fff" }}
              >
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="todo-card-title">{todo.todoTitle}</span>
                  <span className="todo-status-badge" style={getStatusStyle(todo.todoStatus, todo.delayed)}>
                    {todo.delayed ? "지연" : todo.displayStatusName}
                  </span>
                </div>
                <div className="d-flex flex-wrap gap-2" style={{ fontSize: "11px", color: "#666" }}>
                  <span>파트: {todo.projectPartName}</span>
                  <span>마감: {todo.todoDueAt ? new Date(todo.todoDueAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" }) : "-"}</span>
                  <span>담당: {todo.assigneeMemberName}</span>
                  {badge && (
                    <span style={{ background: badge.background, color: badge.color, borderRadius: "100%", padding: "1px 5px" }}>
                      {badge.label}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* 페이징 */}
      <div className="d-flex justify-content-center mt-4">
        <div className="pagination-wrap d-flex align-items-center">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="pagination-btn"
          >&lt;</button>
          {Array.from({ length: Math.max(totalPages, 1) }, (_, i) => (
            <button key={i} onClick={() => onPageChange(i)}
              className={`pagination-btn ${currentPage === i ? "pagination-btn-active" : ""}`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= Math.max(totalPages, 1) - 1}
            className="pagination-btn"
          >&gt;</button>
        </div>
      </div>
    </div>
  );
};

export default TodoList;