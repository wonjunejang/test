import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchTodoDetail, deleteTodo, downloadTodoFile,
  fetchProjectParts, fetchProjectMembers, fetchIsLeader,
} from "../../../lib/todoApi";
import type { ProjectPartResponse, ProjectMemberResponse } from "../../../lib/todoApi";
import TodoEditModal from "../components/TodoEditModal";
import type { TodoDetailResponse } from "../types";
import useMemberStore from "../../member/store/useMemberStore";
import todoEditIcon from "../../../assets/todo-edit-icon.png";
import todoDeleteIcon from "../../../assets/todo-delete-icon.png";
import todoFileIcon from "../../../assets/todo-file-icon.png";
import "../todo.css";
import ConfirmModal from "../../../components/ConfirmModal";

const TodoDetail = () => {
  const { projectId, todoId } = useParams<{ projectId: string; todoId: string }>();
  const navigate = useNavigate();

  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");

  const [todo, setTodo] = useState<TodoDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [parts, setParts] = useState<ProjectPartResponse[]>([]);
  const [members, setMembers] = useState<ProjectMemberResponse[]>([]);
  const [isLeader, setIsLeader] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false); // 삭제 확인 모달

  const loadDetail = async () => {
    setIsLoading(true);
    try {
      const res = await fetchTodoDetail(Number(projectId), Number(todoId), loginUsername);
      setTodo(res.data);
    } catch (e) {
      console.error("투두 상세 조회 실패", e);
    } finally {
      setIsLoading(false);
    }
  };

  const loadProjectInfo = async () => {
    try {
      const [partsRes, membersRes, isLeaderRes] = await Promise.all([
        fetchProjectParts(Number(projectId)),
        fetchProjectMembers(Number(projectId)),
        fetchIsLeader(Number(projectId)),
      ]);
      setParts(partsRes.data);
      setMembers(membersRes.data);
      setIsLeader(isLeaderRes.data);
    } catch (e) {
      console.error("프로젝트 정보 조회 실패", e);
    }
  };

  useEffect(() => {
    if (!loginUsername) return;
    loadDetail();
    loadProjectInfo();
  }, [projectId, todoId]);

  const handleDeleteClick = () => {
    setIsConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    setIsConfirmOpen(false);
    if (!todo) return;
    try {
      await deleteTodo(Number(projectId), todo.todoId, loginUsername);
      navigate(`/projects/${projectId}`);
    } catch (e) {
      console.error("투두 삭제 실패", e);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const res = await downloadTodoFile(Number(projectId), Number(todoId), fileId, loginUsername);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("파일 다운로드 실패", e);
      alert("파일 다운로드에 실패했습니다.");
    }
  };

  const modalParts = parts.map((p) => ({ id: p.partId, name: p.partName }));
  const modalMembers = members.map((m) => ({ username: m.username, memberName: m.memberName }));

  if (isLoading) return <div className="text-center py-5 text-muted">로딩 중...</div>;
  if (!todo) return <div className="text-center py-5 text-muted">데이터를 불러올 수 없습니다.</div>;

  return (
    <div className="container" style={{ maxWidth: "900px", margin: "0 auto" }}>
      <h2 className="todo-title fw-bold d-flex gap-3" style={{ fontSize: "20px" }}>

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm mb-3"
          onClick={() => navigate(`/projects/${projectId}`)}
        >
        ←
        </button>{todo.todoTitle}
      </h2>

      {/* 설명 레이블 + 수정/삭제 버튼 */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <label className="fw-bold" style={{ fontSize: "16px" }}>설명</label>
        <div className="d-flex gap-2">
          {todo.editable && (
            <button className="btn-action" onClick={() => setIsEditModalOpen(true)}>
              <img src={todoEditIcon} alt="수정" className="todo-icon" />
              수정
            </button>
          )}
          {todo.deletable && (
            <button className="btn-action" onClick={handleDeleteClick}>
              <img src={todoDeleteIcon} alt="삭제" className="todo-icon" />
              삭제
            </button>
          )}
        </div>
      </div>

      {/* 본문 - 좌우 분할 (모바일: 세로) */}
      <div className="d-flex gap-3 align-items-start todo-body">
        {/* 왼쪽 - 설명 */}
        <div className="todo-left">
          <div style={{
            padding: "12px", border: "1px solid #ddd", borderRadius: "4px",
            minHeight: "120px", fontSize: "15px", fontWeight: 600, color: "#333",
            lineHeight: "1.6", wordBreak: "break-all", whiteSpace: "pre-wrap",
          }}>
            {todo.todoContent}
          </div>
        </div>

        {/* 오른쪽 - 세부사항 */}
        <div className="todo-right">
          <h4 className="fw-bold mb-3 mt-0" style={{ fontSize: "15px" }}>세부사항</h4>
          <div>
            {[
              { label: "담당자", value: todo.assigneeMemberName },
              {
                label: "중요도",
                value: (
                  <span style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    padding: "5px", borderRadius: "100%", fontSize: "12px", fontWeight: 600, lineHeight: 1,
                    background: todo.todoPriority === "HIGH" ? "#FFD4D4" : todo.todoPriority === "MID" ? "#FFF0B2" : "#E1FF9F",
                    color: todo.todoPriority === "HIGH" ? "#EE0000" : todo.todoPriority === "MID" ? "#FF8036" : "#03C400",
                  }}>
                    {todo.todoPriority === "HIGH" ? "상" : todo.todoPriority === "MID" ? "중" : "하"}
                  </span>
                )
              },
              { label: "파트", value: todo.projectPartName },
              {
                label: "마감일",
                value: todo.todoDueAt
                  ? new Date(todo.todoDueAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })
                  : "-"
              },
              {
                label: "시작일",
                value: todo.todoCreateAt
                  ? new Date(todo.todoCreateAt).toLocaleDateString("ko-KR", { month: "2-digit", day: "2-digit" })
                  : "-"
              },
              { label: "생성자", value: todo.writerMemberName },
            ].map(({ label, value }) => (
              <div key={label} className="d-flex justify-content-between align-items-center py-3" style={{ borderBottom: "1px solid #eee" }}>
                <div className="text-muted" style={{ fontSize: "13px" }}>{label}</div>
                <div className="fw-bold" style={{ color: "#333", fontSize: "13px" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 첨부파일 */}
      <div className="mt-4">
        <label className="fw-bold d-block mb-2" style={{ fontSize: "16px" }}>첨부파일</label>
        {todo.files.length === 0 ? (
          <p className="text-muted" style={{ fontSize: "13px" }}>첨부파일이 없습니다.</p>
        ) : (
          todo.files.map((file) => (
            <div key={file.fileId} className="d-flex justify-content-between align-items-center gap-2 mb-2 px-3 py-2" style={{ border: "1px solid #ddd", borderRadius: "4px", fontSize: "13px" }}>
              <span className="file-name">
                <img src={todoFileIcon} alt="파일" className="todo-icon" />
                {file.originalFileName}
              </span>
              <button className="file-btn" onClick={() => handleDownload(file.fileId, file.originalFileName)}>
                다운로드
              </button>
            </div>
          ))
        )}
      </div>

      {isEditModalOpen && (
        <TodoEditModal
          projectId={Number(projectId)}
          username={loginUsername}
          isLeader={isLeader}
          members={modalMembers}
          parts={modalParts}
          todo={todo}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={loadDetail}
        />
      )}

      {isConfirmOpen && (
        <ConfirmModal
          message="정말 삭제하시겠습니까?"
          onCancel={() => setIsConfirmOpen(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  );
};

export default TodoDetail;