import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchTodoList } from "../../../lib/todoApi";
import type { TodoListResponse } from "../types";
import useMemberStore from "../../member/store/useMemberStore";
import CalendarCell from "./CalendarCell";
import TodoListModal from "./TodoListModal";
import "../todo.css";

const toDateKey = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const DAY_LABELS = ["일", "월", "화", "수", "목", "금", "토"];

interface Props {
  refreshTrigger?: number;
}

const TodoCalendar = ({ refreshTrigger }: Props) => {
  const { projectId } = useParams<{ projectId: string }>();
  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");

  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [todoMap, setTodoMap] = useState<Record<string, TodoListResponse[]>>({});
  const [modalDate, setModalDate] = useState<string | null>(null);
  const [modalTodos, setModalTodos] = useState<TodoListResponse[]>([]);

  const loadTodos = async () => {
    if (!loginUsername) return;
    try {
      const res = await fetchTodoList(Number(projectId), loginUsername, { size: 999 });
      const todos: TodoListResponse[] = res.data.todos;
      const map: Record<string, TodoListResponse[]> = {};
      todos.forEach((todo) => {
        if (!todo.todoDueAt) return;
        const key = toDateKey(new Date(todo.todoDueAt));
        if (!map[key]) map[key] = [];
        map[key].push(todo);
      });
      setTodoMap(map);
    } catch (e) {
      console.error("캘린더 Todo 조회 실패", e);
    }
  };

  useEffect(() => {
    loadTodos();
  }, [projectId, loginUsername, refreshTrigger]);

  const buildCalendarDays = (): { date: Date; isCurrentMonth: boolean }[] => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      const d = new Date(currentYear, currentMonth, -firstDay.getDay() + i + 1);
      days.push({ date: d, isCurrentMonth: false });
    }
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(currentYear, currentMonth, d), isCurrentMonth: true });
    }
    const remaining = 7 - (days.length % 7);
    if (remaining < 7) {
      for (let i = 1; i <= remaining; i++) {
        days.push({ date: new Date(currentYear, currentMonth + 1, i), isCurrentMonth: false });
      }
    }
    return days;
  };

  const calendarDays = buildCalendarDays();
  const todayKey = toDateKey(today);

  const handlePrevMonth = () => {
    if (currentMonth === 0) { setCurrentYear((y) => y - 1); setCurrentMonth(11); }
    else setCurrentMonth((m) => m - 1);
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) { setCurrentYear((y) => y + 1); setCurrentMonth(0); }
    else setCurrentMonth((m) => m + 1);
  };

  const handleMoreClick = (dateKey: string, todos: TodoListResponse[]) => {
    setModalDate(dateKey);
    setModalTodos(todos);
  };

  return (
    <div style={{marginBottom:"5rem"}}>
      {/* 월 네비게이션 */}
      <div className="d-flex align-items-center gap-3 mb-3">
        <button
          onClick={handlePrevMonth}
          className="btn btn-outline-secondary btn-sm"
          style={{ fontSize: "13px" }}
        >
          &lt;
        </button>
        <span className="fw-semibold" style={{ fontSize: "15px" }}>
          {currentYear}년 {currentMonth + 1}월
        </span>
        <button
          onClick={handleNextMonth}
          className="btn btn-outline-secondary btn-sm"
          style={{ fontSize: "13px" }}
        >
          &gt;
        </button>
      </div>

      {/* 요일 헤더 */}
      <div className="calendar-grid mb-1">
        {DAY_LABELS.map((label) => (
          <div key={label} className="text-center text-muted py-1" style={{ fontSize: "12px" }}>
            {label}
          </div>
        ))}
      </div>

      {/* 날짜 셀 */}
      <div className="calendar-grid" style={{ gap: "3px" }}>
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const key = toDateKey(date);
          const todos = todoMap[key] ?? [];
          return (
            <CalendarCell
              key={idx}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={key === todayKey}
              todos={todos}
              projectId={Number(projectId)}
              onMoreClick={() => handleMoreClick(key, todos)}
            />
          );
        })}
      </div>

      {modalDate && (
        <TodoListModal
          dateKey={modalDate}
          todos={modalTodos}
          projectId={Number(projectId)}
          onClose={() => setModalDate(null)}
        />
      )}
    </div>
  );
};

export default TodoCalendar;