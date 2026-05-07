import { useState, useEffect, useCallback } from "react";
import {
  fetchTodoList,
  fetchTodoProgress,
  deleteTodo,
} from "../../../lib/todoApi";
import type {
  TodoListResponse,
  TodoPageResponse,
  TodoProgressResponse,
  TodoSearchRequest,
} from "../types";
import { PAGE_SIZE } from "../components/pagination";

interface UseTodoProps {
  projectId: number;
  username: string;
}

const SESSION_KEY = (projectId: number) => `todo-filter-${projectId}`;

const useTodo = ({ projectId, username }: UseTodoProps) => {
  // 목록 상태
  const [todos, setTodos] = useState<TodoListResponse[]>([]);
  const [pageInfo, setPageInfo] = useState<Omit<TodoPageResponse, "todos">>({
    currentPage: 0,
    totalPages: 0,
    totalCount: 0,
    hasNext: false,
    hasPrevious: false,
  });

  // 진행률 상태
  const [progress, setProgress] = useState<TodoProgressResponse | null>(null);

  // 필터 상태 - 마운트 시 sessionStorage에서 복원
  const [searchParams, setSearchParams] = useState<TodoSearchRequest>(() => {
    try {
      const saved = sessionStorage.getItem(SESSION_KEY(projectId));
      if (saved) return { ...JSON.parse(saved), page: 0, size: PAGE_SIZE };
    } catch {}
    return { page: 0, size: PAGE_SIZE };
  });

  // 로딩/에러 상태
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 투두 목록 조회
  const loadTodos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetchTodoList(projectId, username, searchParams);
      setTodos(res.data.todos);
      setPageInfo({
        currentPage: res.data.currentPage,
        totalPages: res.data.totalPages,
        totalCount: res.data.totalCount,
        hasNext: res.data.hasNext,
        hasPrevious: res.data.hasPrevious,
      });
    } catch (e) {
      console.error("투두 목록 조회 실패", e);
      setError("목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, username, searchParams]);

  // 진행률 조회
  const loadProgress = useCallback(async () => {
    try {
      const res = await fetchTodoProgress(projectId, username);
      setProgress(res.data);
    } catch (e) {
      console.error("진행률 조회 실패", e);
    }
  }, [projectId, username]);

  // 투두 삭제
  const handleDelete = async (todoId: number) => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await deleteTodo(projectId, todoId, username);
      await Promise.all([loadTodos(), loadProgress()]);
    } catch (e) {
      console.error("투두 삭제 실패", e);
      alert("삭제에 실패했습니다.");
    }
  };

  // 페이지 변경
  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
  };

  // 필터 변경 - sessionStorage 저장
  const handleFilterChange = (newParams: TodoSearchRequest) => {
    const next = { ...newParams, page: 0, size: PAGE_SIZE };
    sessionStorage.setItem(SESSION_KEY(projectId), JSON.stringify(newParams));
    setSearchParams(next);
  };

  // 필터 초기화 - sessionStorage 제거
  const handleFilterReset = () => {
    sessionStorage.removeItem(SESSION_KEY(projectId));
    setSearchParams({ page: 0, size: PAGE_SIZE });
  };

  // 목록/진행률 새로고침
  const refresh = useCallback(async () => {
    await Promise.all([loadTodos(), loadProgress()]);
  }, [loadTodos, loadProgress]);

  // searchParams 바뀔 때마다 목록 조회
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // 마운트 시 진행률 조회
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    todos,
    pageInfo,
    progress,
    searchParams,
    isLoading,
    error,
    handleDelete,
    handlePageChange,
    handleFilterChange,
    handleFilterReset,
    refresh,
  };
};

export default useTodo;