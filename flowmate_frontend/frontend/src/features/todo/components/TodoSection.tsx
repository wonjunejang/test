import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import useTodo from "../hooks/useTodo";
import useDeadlineScheduler from "../hooks/useDeadlineScheduler";
import TodoFilter from "./TodoFilter";
import TodoList from "./TodoList";
import TodoAddModal from "./TodoAddModal";
import TodoEditModal from "./TodoEditModal";
import { fetchProjectParts, fetchProjectMembers } from "../../../lib/todoApi";
import type { ProjectPartResponse, ProjectMemberResponse } from "../../../lib/todoApi";
import type { TodoDetailResponse } from "../types";
import checkCircle from "../../../assets/check-circle.png";
import useMemberStore from "../../member/store/useMemberStore";
import TodoCalendar from "./TodoCalendar";
import "../todo.css";

type Props = {
  onProgressRefresh?: () => void;
};

const TodoSection = ({ onProgressRefresh }: Props) => {
  const { projectId } = useParams<{ projectId: string }>();
  const parsedProjectId = Number(projectId);
  if (!parsedProjectId) return null;

  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");

  const {
    todos,
    pageInfo,
    isLoading,
    error,
    handleDelete,
    handlePageChange,
    handleFilterChange,
    handleFilterReset,
    refresh,
  } = useTodo({ projectId: parsedProjectId, username: loginUsername });

  useDeadlineScheduler(todos ?? []);

  const [parts, setParts] = useState<ProjectPartResponse[]>([]);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [calendarRefresh, setCalendarRefresh] = useState(0);
  const [editTarget, setEditTarget] = useState<TodoDetailResponse | null>(null);

  const handleSuccess = useCallback(async () => {
    await refresh();
    onProgressRefresh?.();
    setCalendarRefresh((prev) => prev + 1);
  }, [refresh, onProgressRefresh]);

  useEffect(() => {
    const loadProjectInfo = async () => {
      try {
        const [partsRes, membersRes] = await Promise.all([
          fetchProjectParts(parsedProjectId),
          fetchProjectMembers(parsedProjectId),
        ]);
        setParts(partsRes.data);
        setMembers(membersRes.data);
        const me = membersRes.data.find((m) => m.username === loginUsername);
        setIsLeader(me?.memberRole === "LEADER");
      } catch (e) {
        console.error("프로젝트 정보 조회 실패", e);
      }
    };
    loadProjectInfo();
  }, [parsedProjectId]);

  const modalParts = parts.map((p) => ({ id: p.partId, name: p.partName }));
  const modalMembers = members.map((m) => ({ username: m.username, memberName: m.memberName }));

  if (error) return <div className="alert alert-danger m-4">{error}</div>;

  return (
    <div>
      {/* 캘린더 - 모바일에서 숨김 */}
      <div className="calendar-wrap">
        <TodoCalendar refreshTrigger={calendarRefresh} />
      </div>

      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <div className="d-flex gap-2">
          <img src={checkCircle} alt="todo" style={{ width: "25px", height: "25px" }} />
          <span className="fs-5 fw-semibold">Todo</span>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="btn btn-outline-secondary btn-sm p-1"
        >
          + 업무 추가
        </button>
      </div>

      {/* Filter */}
      <div className="rounded-4 border p-3 mb-3" style={{ background: "#F3F3F3" }}>
        <TodoFilter
          onFilter={handleFilterChange}
          onReset={handleFilterReset}
          parts={modalParts}
          members={modalMembers}
          projectId={parsedProjectId}
        />
      </div>

      {/* List */}
      <TodoList
        projectId={parsedProjectId}
        todos={todos ?? []}
        isLoading={isLoading}
        currentPage={pageInfo.currentPage}
        totalPages={pageInfo.totalPages}
        onPageChange={handlePageChange}
        onDelete={handleDelete}
      />

      {/* Modals */}
      {isAddModalOpen && (
        <TodoAddModal
          projectId={parsedProjectId}
          username={loginUsername}
          isLeader={isLeader}
          members={modalMembers}
          parts={modalParts}
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={handleSuccess}
        />
      )}

      {editTarget && (
        <TodoEditModal
          projectId={parsedProjectId}
          username={loginUsername}
          isLeader={isLeader}
          members={modalMembers}
          parts={modalParts}
          todo={editTarget}
          onClose={() => setEditTarget(null)}
          onSuccess={handleSuccess}
        />
      )}
    </div>
  );
};

export default TodoSection;