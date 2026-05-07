import { useNavigate } from "react-router-dom";
import type { TodoListResponse } from "../types";
import { PRIORITY_LABEL } from "./priority";
import "../todo.css";

const MAX_VISIBLE = 3;

interface Props {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  todos: TodoListResponse[];
  projectId: number;
  onMoreClick: () => void;
}

const CalendarCell = ({ date, isCurrentMonth, isToday, todos, projectId, onMoreClick }: Props) => {
  const navigate = useNavigate();
  const visible = todos.slice(0, MAX_VISIBLE);
  const hiddenCount = todos.length - MAX_VISIBLE;

  return (
    <div
      className="calendar-cell"
      style={{
        border: isToday ? "1.5px solid #4A90D9" : "1px solid #e8e8e8",
        background: isCurrentMonth ? "#fff" : "#f9f9f9",
        opacity: isCurrentMonth ? 1 : 0.5,
      }}
    >
      {/* 날짜 숫자 */}
      <div
        className="calendar-cell-date"
        style={{
          fontWeight: isToday ? 700 : 400,
          color: isToday ? "#4A90D9" : "#555",
        }}
      >
        {date.getDate()}
      </div>

      {/* Todo 뱃지 최대 3개 */}
      {visible.map((todo) => {
        const bg = PRIORITY_LABEL[todo.todoPriority]?.background ?? "#E8F5E9";
        const color = PRIORITY_LABEL[todo.todoPriority]?.color ?? "#2E7D32";
        return (
          <div
            key={todo.todoId}
            onClick={() => navigate(`/projects/${projectId}/todos/${todo.todoId}`)}
            className="calendar-todo-badge"
            style={{ background: bg, color }}
            title={todo.todoTitle}
          >
            {todo.todoTitle}
          </div>
        );
      })}

      {/* +N 더보기 버튼 */}
      {hiddenCount > 0 && (
        <button className="calendar-more-btn" onClick={onMoreClick}>
          +{hiddenCount} 더보기
        </button>
      )}
    </div>
  );
};

export default CalendarCell;