import { useEffect } from "react";
import useAlarmStore from "../../../store/useAlarmStore";
import type { TodoListResponse } from "../types";

const STORAGE_KEY = "deadline_notified";

function getNotifiedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveNotifiedSet(set: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...set]));
}

function getDaysLeft(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDateStr);
  due.setHours(0, 0, 0, 0);
  return Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function buildNoticeKey(todoId: number, daysLeft: number): string {
  const today = new Date().toISOString().slice(0, 10);
  return `${todoId}_d${daysLeft}_${today}`;
}

export default function useDeadlineScheduler(todos: TodoListResponse[]) {
  const addAlarm = useAlarmStore((s) => s.addAlarm);

  useEffect(() => {
    if (!todos.length) return;

    const notified = getNotifiedSet();
    let changed = false;

    todos.forEach((todo) => {
      if (todo.todoStatus === "TDFIN") return;

      const daysLeft = getDaysLeft(todo.todoDueAt);
      if (![0, 1, 3].includes(daysLeft)) return;

      const key = buildNoticeKey(todo.todoId, daysLeft);
      if (notified.has(key)) return;

      const label = daysLeft === 0 ? "오늘 마감" : `D-${daysLeft}`;
      addAlarm({
        id: Date.now() + todo.todoId,
        title: `마감 임박 (${label})`,
        desc: `[${todo.projectPartName}] ${todo.todoTitle}`,
        time: "방금",
        read: false,
      });

      notified.add(key);
      changed = true;
    });

    if (changed) saveNotifiedSet(notified);
  }, [todos]);
}
