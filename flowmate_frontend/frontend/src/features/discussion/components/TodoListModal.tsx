import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { TodoCreateRequest, TeamMember, ProjectPart } from "../types";
import { formatPriority } from "../../../lib/utils";

interface Props {
  todos: TodoCreateRequest[];
  teamMembers: TeamMember[];
  parts: ProjectPart[];
  onSelect: (index: number) => void;
  onClose: () => void;
}

const TodoListModal = ({ todos, teamMembers, parts, onSelect, onClose }: Props) => {
  // 모달 열리면 body 스크롤 잠금, 닫히면 복구
  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  return createPortal(
    <div className="modal-backdrop-custom">
      <div className="modal-box-custom" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h5 className="mb-0">Todo 목록</h5>
          <button type="button" className="btn-close" onClick={onClose} />
        </div>

        {todos.length === 0 ? (
          <div className="text-center text-muted py-4">추가된 Todo가 없습니다.</div>
        ) : (
          <table className="table table-bordered discussion-table">
            <thead>
              <tr>
                <th>업무</th>
                <th style={{ width: "80px" }}>파트</th>
                <th style={{ width: "60px" }}>중요도</th>
                <th style={{ width: "80px" }}>마감일</th>
                <th style={{ width: "80px" }}>담당자</th>
              </tr>
            </thead>
            <tbody>
              {todos.map((todo, index) => (
                <tr
                  key={index}
                  style={{ cursor: "pointer", whiteSpace: "nowrap" }}
                  onClick={() => onSelect(index)}
                >
                  <td>{todo.todoTitle}</td>
                  <td>
                    {parts.find((p) => p.partId === todo.projectPartId)?.partName ??
                      todo.projectPartId ??
                      "-"}
                  </td>
                  <td>{formatPriority(todo.todoPriority)}</td>
                  <td>{todo.todoDueAt ?? "-"}</td>
                  <td>
                    {teamMembers.find((m) => m.username === todo.assigneeUsername)?.memberName ??
                      todo.assigneeUsername ??
                      "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>,
    document.body,
  );
};

export default TodoListModal;
