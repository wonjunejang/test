import { useState, useEffect } from "react";
import { updateTodo } from "../../../lib/todoApi";
import type { TodoDetailResponse, TodoUpdateRequest } from "../types";
import todoDeleteIcon from "../../../assets/todo-delete-icon.png";
import "../todo.css";
import AlertModal from "../../../components/AlertModal";
import { useFileValidation } from "../hooks/useFileValidation";

interface TodoEditModalProps {
  projectId: number;
  username: string;
  isLeader: boolean;
  members: { username: string; memberName: string }[];
  parts: { id: number; name: string }[];
  todo: TodoDetailResponse;
  onClose: () => void;
  onSuccess: () => void;
}

const TodoEditModal = ({
  projectId, username, isLeader, members, parts, todo, onClose, onSuccess,
}: TodoEditModalProps) => {
  const [form, setForm] = useState<TodoUpdateRequest>({
    todoTitle: todo.todoTitle,
    todoContent: todo.todoContent,
    todoStatus: todo.todoStatus,
    todoPriority: todo.todoPriority,
    todoDueAt: todo.todoDueAt?.slice(0, 10) ?? "",
    projectPartId: todo.projectPartId,
    assigneeUsername: todo.assigneeUsername,
    deleteFileIds: [],
  });
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [deleteFileIds, setDeleteFileIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const { alertMessage, setAlertMessage, validateFiles } = useFileValidation();

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setIsAlertOpen(true);
  };

  useEffect(() => {
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "projectPartId" ? Number(value) : value,
    }));
  };

  const handleFileAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const added = Array.from(e.target.files);
    const merged = [...newFiles, ...added];
    const remainingExisting = todo.files.filter(
      (f) => !deleteFileIds.includes(f.fileId)
    ).length;
    if (!validateFiles(merged, remainingExisting)) {
      setIsAlertOpen(true);
      return;
    }
    setNewFiles(merged);
  };

  const handleNewFileRemove = (index: number) => {
    setNewFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleExistingFileDelete = (fileId: number) => {
    setDeleteFileIds((prev) => [...prev, fileId]);
  };

  const handleSubmit = async () => {
    if (!form.todoTitle.trim()) return showAlert("업무 제목을 입력해주세요.");
    if (!form.todoContent.trim()) return showAlert("설명을 입력해주세요.");
    if (!form.projectPartId) return showAlert("파트를 선택해주세요.");
    if (!form.todoPriority) return showAlert("중요도를 선택해주세요.");
    if (!form.todoDueAt) return showAlert("마감일을 입력해주세요.");
    if (!form.assigneeUsername) return showAlert("담당자를 선택해주세요.");

    setIsLoading(true);
    try {
      await updateTodo(projectId, todo.todoId, username, { ...form, deleteFileIds }, newFiles);
      onSuccess();
      onClose();
    } catch (e: any) {
      console.error("투두 수정 실패", e);
      const msg = e?.response?.data?.message;
      showAlert(msg || "수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="todo-modal-overlay d-flex align-items-center justify-content-center"
      onClick={onClose}
    >
      <div
        className="todo-modal-box bg-white rounded-3 p-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h6 className="fw-semibold mb-0">업무 수정</h6>
          <button onClick={onClose} className="btn-close" />
        </div>

        {/* 업무 제목 */}
        <div className="mb-3">
          <label className="form-label fw-medium small">
            업무 <span className="required-mark">*</span>
          </label>
          <input
            name="todoTitle"
            value={form.todoTitle}
            onChange={handleChange}
            placeholder="업무 제목을 입력하세요."
            className="form-control form-control-sm"
          />
        </div>

        {/* 설명 */}
        <div className="mb-3">
          <label className="form-label fw-medium small">
            설명 <span className="required-mark">*</span>
          </label>
          <textarea
            name="todoContent"
            value={form.todoContent}
            onChange={handleChange}
            rows={3}
            className="form-control form-control-sm todo-textarea"
          />
        </div>

        {/* 파트 + 상태 + 중요도 */}
        <div className="row g-2 mb-3">
          <div className="col">
            <label className="form-label fw-medium small">
              파트 <span className="required-mark">*</span>
            </label>
            <select name="projectPartId" value={form.projectPartId} onChange={handleChange}
              className="form-select form-select-sm">
              {parts.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>
          <div className="col">
            <label className="form-label fw-medium small">
              상태 <span className="required-mark">*</span>
            </label>
            <select name="todoStatus" value={form.todoStatus} onChange={handleChange}
              className="form-select form-select-sm">
              <option value="TDEXT">예정</option>
              <option value="TDINPROG">진행중</option>
              <option value="TDFIN">완료</option>
            </select>
          </div>
          <div className="col">
            <label className="form-label fw-medium small">
              중요도 <span className="required-mark">*</span>
            </label>
            <select name="todoPriority" value={form.todoPriority} onChange={handleChange}
              className="form-select form-select-sm">
              <option value="HIGH">상</option>
              <option value="MID">중</option>
              <option value="LOW">하</option>
            </select>
          </div>
        </div>

        {/* 마감일 + 담당자 */}
        <div className="row g-2 mb-3">
          <div className="col">
            <label className="form-label fw-medium small">
              마감일 <span className="required-mark">*</span>
            </label>
            <input
              type="date"
              name="todoDueAt"
              value={form.todoDueAt}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="form-control form-control-sm"
            />
          </div>
          <div className="col">
            <label className="form-label fw-medium small">
              담당자<span className="required-mark">{isLeader ? " *" : ""}</span>
            </label>
            {isLeader ? (
              <select name="assigneeUsername" value={form.assigneeUsername} onChange={handleChange}
                className="form-select form-select-sm">
                {members.map((m) => (
                  <option key={m.username} value={m.username}>{m.memberName}</option>
                ))}
              </select>
            ) : (
              <input
                value={members.find((m) => m.username === username)?.memberName ?? username}
                disabled
                className="form-control form-control-sm bg-light text-muted"
              />
            )}
          </div>
        </div>

        {/* 기존 첨부파일 */}
        {todo.files.length > 0 && (
          <div className="mb-3">
            <label className="form-label fw-medium small">기존 첨부파일</label>
            {todo.files.map((file) => (
              <div key={file.fileId} className="d-flex justify-content-between align-items-center mt-1">
                <span
                  className="small"
                  style={{
                    textDecoration: deleteFileIds.includes(file.fileId) ? "line-through" : "none",
                    color: deleteFileIds.includes(file.fileId) ? "#999" : "#333",
                  }}
                >
                  • {file.originalFileName}
                </span>
                {!deleteFileIds.includes(file.fileId) && (
                  <button
                    onClick={() => handleExistingFileDelete(file.fileId)}
                    className="btn btn-outline-secondary btn-sm py-1 px-2"
                    style={{ fontSize: "12px", borderColor: "#ccc" }}
                  >
                    <img src={todoDeleteIcon} alt="삭제" className="todo-icon" />
                    삭제
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* 새 첨부파일 */}
        <div className="mb-4">
          <label className="form-label fw-medium small">첨부파일 추가</label>
          <div className="d-flex align-items-center gap-2 p-1 rounded" style={{ border: "1px solid #ddd" }}>
            <label className="btn btn-outline-secondary btn-sm mb-0">
              파일선택
              <input type="file" multiple onChange={handleFileAdd} className="d-none" />
            </label>
            <span className="small text-muted">
              {newFiles.length === 0 ? "선택된 파일이 없습니다." : `${newFiles.length}개 선택됨`}
            </span>
          </div>
          {newFiles.map((file, i) => (
            <div key={i} className="d-flex justify-content-between align-items-center mt-2">
              <span className="small">• {file.name}</span>
              <button
                onClick={() => handleNewFileRemove(i)}
                className="btn btn-outline-secondary btn-sm py-0 px-2 d-flex align-items-center gap-1"
                style={{ fontSize: "12px" }}
              >
                <img src={todoDeleteIcon} alt="삭제" className="todo-icon" />
                삭제
              </button>
            </div>
          ))}
        </div>

        {/* 버튼 */}
        <div className="d-flex justify-content-end gap-2">
          <button onClick={onClose} className="btn btn-outline-secondary btn-sm px-4">취소</button>
          <button onClick={handleSubmit} disabled={isLoading} className="btn btn-dark btn-sm px-4">
            {isLoading ? "수정 중..." : "변경"}
          </button>
        </div>
      </div>

      {/* Alert 모달 */}
      {isAlertOpen && (
        <AlertModal
          message={alertMessage ?? ""}
          onConfirm={() => setIsAlertOpen(false)}
        />
      )}
    </div>
  );
};

export default TodoEditModal;