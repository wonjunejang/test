import { createPortal } from "react-dom";
import { useState, useEffect } from "react";
import type { TodoCreateRequest, TeamMember, ProjectPart } from "../types";
import { formatPriority } from "../../../lib/utils";
import ConfirmModal from "../../../components/ConfirmModal";
import AlertModal from "../../../components/AlertModal";

interface Props {
  todo: TodoCreateRequest;
  teamMembers: TeamMember[];
  parts: ProjectPart[];
  onEdit: (updated: TodoCreateRequest) => void;
  onDelete: () => void;
  onClose: () => void;
}

const TodoDetailModal = ({ todo, teamMembers, parts, onEdit, onDelete, onClose }: Props) => {
  const [isEditMode, setIsEditMode] = useState(false);

  // 모달 열리면 body 스크롤 잠금, 닫히면 복구
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const [todoTitle, setTodoTitle] = useState(todo.todoTitle);
  const [todoContent, setTodoContent] = useState(todo.todoContent ?? "");
  const [projectPartId, setProjectPartId] = useState<number | undefined>(todo.projectPartId);
  const [todoPriority, setTodoPriority] = useState(todo.todoPriority ?? "");
  const [todoDueAt, setTodoDueAt] = useState(todo.todoDueAt ?? "");
  const [assigneeUsername, setAssigneeUsername] = useState(todo.assigneeUsername ?? "");

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const handleEdit = () => {
    if (!todoTitle.trim()) {
      setAlertMessage("업무명을 입력해주세요.");
      return;
    }
    if (!projectPartId) {
      setAlertMessage("파트를 선택해주세요.");
      return;
    }
    if (!todoPriority) {
      setAlertMessage("중요도를 선택해주세요.");
      return;
    }
    if (!todoDueAt) {
      setAlertMessage("마감일을 입력해주세요.");
      return;
    }
    if (!assigneeUsername) {
      setAlertMessage("담당자를 선택해주세요.");
      return;
    }

    onEdit({
      todoTitle,
      ...(todoContent && { todoContent }),
      projectPartId,
      todoPriority,
      todoDueAt,
      assigneeUsername,
    });
    onClose();
  };

  const assigneeName =
    teamMembers.find((m) => m.username === assigneeUsername)?.memberName ?? assigneeUsername ?? "-";

  return createPortal(
    <>
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ background: "rgba(0,0,0,0.4)", zIndex: 1000 }}
      >
        <div
          className="bg-white rounded-3 p-4"
          style={{ width: "520px", maxHeight: "90vh", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-semibold mb-0">Todo</h6>
            <button onClick={onClose} className="btn-close" />
          </div>

          {/* 업무 */}
          <div className="mb-3">
            <label className="form-label fw-medium small">업무 *</label>
            {isEditMode ? (
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="업무 제목을 입력해주세요."
                maxLength={200}
                value={todoTitle}
                onChange={(e) => setTodoTitle(e.target.value)}
              />
            ) : (
              <input
                type="text"
                className="form-control form-control-sm"
                value={todoTitle}
                readOnly
              />
            )}
          </div>

          {/* 설명 */}
          <div className="mb-3">
            <label className="form-label fw-medium small">설명</label>
            {isEditMode ? (
              <textarea
                className="form-control form-control-sm"
                rows={3}
                placeholder="업무 내용을 입력해주세요."
                value={todoContent}
                onChange={(e) => setTodoContent(e.target.value)}
              />
            ) : (
              <textarea
                className="form-control form-control-sm"
                rows={3}
                value={todoContent}
                readOnly
              />
            )}
          </div>

          {/* 파트 / 중요도 */}
          <div className="row g-2 mb-3">
            <div className="col">
              <label className="form-label fw-medium small">파트 *</label>
              {isEditMode ? (
                <select
                  className="form-select form-select-sm"
                  value={projectPartId ?? ""}
                  onChange={(e) => setProjectPartId(Number(e.target.value) || undefined)}
                >
                  <option value="">파트를 선택해주세요.</option>
                  {parts.map((p) => (
                    <option key={p.partId} value={p.partId}>
                      {p.partName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={
                    parts.find((p) => p.partId === projectPartId)?.partName ?? projectPartId ?? "-"
                  }
                  readOnly
                />
              )}
            </div>
            <div className="col">
              <label className="form-label fw-medium small">중요도 *</label>
              {isEditMode ? (
                <select
                  className="form-select form-select-sm"
                  value={todoPriority}
                  onChange={(e) => setTodoPriority(e.target.value)}
                >
                  <option value="">중요도 선택</option>
                  <option value="HIGH">상</option>
                  <option value="MID">중</option>
                  <option value="LOW">하</option>
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={formatPriority(todoPriority) || "-"}
                  readOnly
                />
              )}
            </div>
          </div>

          {/* 마감일 / 담당자 */}
          <div className="row g-2 mb-4">
            <div className="col">
              <label className="form-label fw-medium small">마감일 *</label>
              {isEditMode ? (
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={todoDueAt}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => setTodoDueAt(e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={todoDueAt || "-"}
                  readOnly
                />
              )}
            </div>
            <div className="col">
              <label className="form-label fw-medium small">담당자 *</label>
              {isEditMode ? (
                <select
                  className="form-select form-select-sm"
                  value={assigneeUsername}
                  onChange={(e) => setAssigneeUsername(e.target.value)}
                >
                  <option value="">담당자 선택</option>
                  {teamMembers.map((m) => (
                    <option key={m.username} value={m.username}>
                      {m.memberName}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  className="form-control form-control-sm"
                  value={assigneeName}
                  readOnly
                />
              )}
            </div>
          </div>

          {/* 버튼 영역 */}
          <div className="d-flex justify-content-end gap-2">
            <button
              type="button"
              className="btn btn-outline-danger btn-sm px-4"
              onClick={() => setIsConfirmOpen(true)}
            >
              삭제
            </button>
            {isEditMode ? (
              <>
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm px-4"
                  onClick={() => setIsEditMode(false)}
                >
                  취소
                </button>
                <button type="button" className="btn btn-dark btn-sm px-4" onClick={handleEdit}>
                  저장
                </button>
              </>
            ) : (
              <button
                type="button"
                className="btn btn-dark btn-sm px-4"
                onClick={() => setIsEditMode(true)}
              >
                수정
              </button>
            )}
          </div>
        </div>
      </div>

      {isConfirmOpen && (
        <ConfirmModal
          message="Todo를 삭제하시겠습니까?"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={onDelete}
        />
      )}
      {alertMessage && (
        <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} />
      )}
    </>,
    document.body,
  );
};

export default TodoDetailModal;
