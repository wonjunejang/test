import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import type { TodoCreateRequest } from "../types";
import { useTodoModal } from "../hooks/useTodoModal";
import AlertModal from "../../../components/AlertModal";

interface Props {
  projectId: string;
  onAdd: (todo: TodoCreateRequest) => void;
  onClose: () => void;
  onOpenList: () => void;
}

const TodoAddModal = ({ projectId, onAdd, onClose }: Props) => {
  const { teamMembers, parts } = useTodoModal(projectId);

  const [todoTitle, setTodoTitle] = useState("");
  const [todoContent, setTodoContent] = useState("");
  const [projectPartId, setProjectPartId] = useState<number | undefined>();
  const [todoPriority, setTodoPriority] = useState("");
  const [todoDueAt, setTodoDueAt] = useState("");
  const [assigneeUsername, setAssigneeUsername] = useState("");
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // ── 드래그 관련 ──
  const modalRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });
  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    // input, select, textarea, button 클릭 시 드래그 무시
    const tag = (e.target as HTMLElement).tagName.toLowerCase();
    if (["input", "select", "textarea", "button"].includes(tag)) return;

    isDragging.current = true;
    const rect = modalRef.current!.getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };

    const onMouseMove = (me: MouseEvent) => {
      if (!isDragging.current) return;
      setPos({ x: me.clientX - dragOffset.current.x, y: me.clientY - dragOffset.current.y });
    };
    const onMouseUp = () => {
      isDragging.current = false;
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  const handleAdd = () => {
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

    const todo: TodoCreateRequest = {
      todoTitle,
      ...(todoContent && { todoContent }),
      ...(projectPartId !== undefined && { projectPartId }),
      ...(todoPriority && { todoPriority }),
      ...(todoDueAt && { todoDueAt: `${todoDueAt}` }),
      ...(assigneeUsername && { assigneeUsername }),
    };

    onAdd(todo);
    onClose();
  };

  // 드래그 위치에 따른 style
  const modalStyle: React.CSSProperties = pos
    ? {
        position: "fixed",
        left: pos.x,
        top: pos.y,
        width: "520px",
        maxHeight: "90vh",
        overflowY: "auto",
        cursor: "grab",
        userSelect: "none",
      }
    : {
        width: "520px",
        maxHeight: "90vh",
        overflowY: "auto",
        cursor: "grab",
        userSelect: "none",
      };

  return createPortal(
    <>
      {/* ✅ 배경 클릭으로 닫기 잠금 (onClick 없음) */}
      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ background: "rgba(0,0,0,0.4)", zIndex: 1000 }}
      >
        <div
          ref={modalRef}
          className="bg-white rounded-3 p-4"
          style={modalStyle}
          onMouseDown={handleMouseDown}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 헤더 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-semibold mb-0" style={{ cursor: "grab" }}>
              ☰ 업무 추가
            </h6>
            <button onClick={onClose} className="btn-close" />
          </div>

          {/* 업무 제목 */}
          <div className="mb-3">
            <label className="form-label fw-medium small">
              업무 <span className="required-mark">*</span>
            </label>
            <input
              type="text"
              className="form-control form-control-sm"
              placeholder="업무 제목을 입력해주세요."
              maxLength={200}
              value={todoTitle}
              onChange={(e) => setTodoTitle(e.target.value)}
            />
          </div>

          {/* 설명 */}
          <div className="mb-3">
            <label className="form-label fw-medium small">
              설명 <span className="required-mark">*</span>
            </label>
            <textarea
              className="form-control form-control-sm"
              rows={3}
              placeholder="업무 내용을 입력해주세요."
              value={todoContent}
              onChange={(e) => setTodoContent(e.target.value)}
            />
          </div>

          {/* 파트 + 중요도 */}
          <div className="row g-2 mb-3">
            <div className="col">
              <label className="form-label fw-medium small">
                파트 <span className="required-mark">*</span>
              </label>
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
            </div>
            <div className="col">
              <label className="form-label fw-medium small">
                중요도 <span className="required-mark">*</span>
              </label>
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
            </div>
          </div>

          {/* 마감일 + 담당자 */}
          <div className="row g-2 mb-4">
            <div className="col">
              <label className="form-label fw-medium small">
                마감일 <span className="required-mark">*</span>
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={todoDueAt}
                min={new Date().toISOString().split("T")[0]}
                onChange={(e) => setTodoDueAt(e.target.value)}
              />
            </div>
            <div className="col">
              <label className="form-label fw-medium small">
                담당자 <span className="required-mark">*</span>
              </label>
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
            </div>
          </div>

          {/* 버튼 */}
          <div className="d-flex justify-content-end gap-2">
            <button onClick={onClose} className="btn btn-outline-secondary btn-sm px-4">
              취소
            </button>
            <button type="button" className="btn btn-dark btn-sm px-4" onClick={handleAdd}>
              추가
            </button>
          </div>
        </div>
      </div>

      {alertMessage && (
        <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} />
      )}
    </>,
    document.body,
  );
};

export default TodoAddModal;
