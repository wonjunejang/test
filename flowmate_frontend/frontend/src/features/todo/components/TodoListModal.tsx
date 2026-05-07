import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { TodoListResponse } from "../types";
import { PRIORITY_LABEL } from "./priority";
import "../todo.css";

interface Props {
  dateKey: string;
  todos: TodoListResponse[];
  projectId: number;
  onClose: () => void;
}

const TodoListModal = ({ dateKey, todos, projectId, onClose }: Props) => {
  const navigate = useNavigate();

  const [, month, day] = dateKey.split("-");
  const dateLabel = `${Number(month)}월 ${Number(day)}일`;

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleTodoClick = (todoId: number) => {
    onClose();
    navigate(`/projects/${projectId}/todos/${todoId}`);
  };

  return (
    <div
      className="todo-list-modal-overlay d-flex align-items-center justify-content-center"
      onClick={onClose}
    >
      <div
        className="todo-list-modal-box"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="d-flex justify-content-between align-items-center mb-3">
          <span style={{ fontSize: "14px", fontWeight: 600 }}>{dateLabel} Todo 목록</span>
          <button className="todo-list-modal-close-btn" onClick={onClose}>✕</button>
        </div>

        {/* 리스트 */}
        <div className="todo-list-modal-scroll">
          {todos.length === 0 ? (
            <p className="text-center text-muted my-4" style={{ fontSize: "13px" }}>
              Todo가 없습니다.
            </p>
          ) : (
            todos.map((todo, index) => {
              const bg    = PRIORITY_LABEL[todo.todoPriority]?.background ?? "#E8F5E9";
              const color = PRIORITY_LABEL[todo.todoPriority]?.color      ?? "#2E7D32";
              const label = PRIORITY_LABEL[todo.todoPriority]?.label      ?? "하";

              return (
                <div
                  key={todo.todoId}
                  className="todo-list-modal-item d-flex align-items-center gap-2 px-3 py-2"
                  onClick={() => handleTodoClick(todo.todoId)}
                >
                  {/* 우선순위 뱃지 - 색상 동적이라 inline 유지 */}
                  <span style={{ fontSize: "11px", background: bg, color, borderRadius: "4px", padding: "2px 6px", flexShrink: 0 }}>
                    {label}
                  </span>
                  <span className="todo-list-modal-title">{todo.todoTitle}</span>
                  <span className="todo-list-modal-assignee">{todo.assigneeMemberName}</span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default TodoListModal;