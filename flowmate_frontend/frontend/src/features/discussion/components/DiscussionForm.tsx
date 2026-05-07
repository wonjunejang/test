import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MemberCheckbox from "./MemberCheckbox";
import TodoInputList from "./TodoInputList";
import AlertModal from "../../../components/AlertModal";
import ConfirmModal from "../../../components/ConfirmModal";
import type {
  DiscussionFormData,
  DiscussionResponse,
  DiscussionMember,
  TodoCreateRequest,
} from "../types";
import "../discussion.css";
import useMemberStore from "../../member/store/useMemberStore";

interface Props {
  mode?: "create" | "edit";
  initialData?: (DiscussionResponse & { members: DiscussionMember[] }) | null;
  onSubmit: (data: DiscussionFormData) => void;
  isLoading?: boolean;
}

const DiscussionForm = ({
  mode = "create",
  initialData = null,
  onSubmit,
  isLoading = false,
}: Props) => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const currentUsername = useMemberStore((s) => s.memberInfo?.username);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [todos, setTodos] = useState<TodoCreateRequest[]>([]);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmConfig, setConfirmConfig] = useState<{
    message: string;
    onConfirm: () => void;
  } | null>(null);

  useEffect(() => {
    if (mode === "edit" && initialData) {
      setTitle(initialData.discussionTitle || "");
      setContent(initialData.discussionContent || "");
      setSelectedMembers(initialData.members?.map((m) => m.username) || []);
    }
  }, [mode, initialData]);

  const handleBack = () => {
    setConfirmConfig({
      message: "작성 중인 내용이 사라집니다. 이전으로 돌아가시겠습니까?",
      onConfirm: () => navigate(-1),
    });
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      setAlertMessage("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setAlertMessage("회의 내용을 입력해주세요.");
      return;
    }

    setConfirmConfig({
      message: mode === "create" ? "회의록을 등록하시겠습니까?" : "회의록을 수정하시겠습니까?",
      onConfirm: () => onSubmit({ title, content, members: selectedMembers, todos }),
    });
  };

  const isEdit = mode === "edit";

  return (
    <div className="container">
      <div className="d-flex align-items-center gap-3 mb-4">
        <button type="button" className="btn btn-outline-secondary btn-sm" onClick={handleBack}>
          ←
        </button>
        <h1 className="discussion-title">{isEdit ? "회의록 수정" : "회의록 작성"}</h1>
      </div>

      <div className="discussion-form-card">
        <div className="mb-3">
          <label className="discussion-form-label">제목</label>
          <input
            type="text"
            className="form-control"
            placeholder="회의록 제목을 입력하세요"
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="text-end text-muted" style={{ fontSize: "0.78rem" }}>
            {title.length} / 200
          </div>
        </div>

        <div className="mb-3">
          <label className="discussion-form-label">참여자</label>
          <MemberCheckbox
            projectId={projectId!}
            selected={selectedMembers}
            onChange={setSelectedMembers}
            excludeUsername={currentUsername ?? undefined}
          />
        </div>

        <div className="mb-3">
          <label className="discussion-form-label">회의 내용</label>
          <textarea
            className="form-control"
            rows={8}
            placeholder="회의 중 토의한 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        {!isEdit && (
          <div className="mb-4">
            <label className="discussion-form-label">Todo 추가</label>
            <TodoInputList todos={todos} onChange={setTodos} />
          </div>
        )}

        <div className="text-center mt-3">
          <button
            type="button"
            className="btn btn-dark px-5"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "처리 중..." : "등록"}
          </button>
        </div>
      </div>

      {alertMessage && (
        <AlertModal message={alertMessage} onConfirm={() => setAlertMessage(null)} />
      )}
      {confirmConfig && (
        <ConfirmModal
          message={confirmConfig.message}
          onCancel={() => setConfirmConfig(null)}
          onConfirm={() => {
            confirmConfig.onConfirm();
            setConfirmConfig(null);
          }}
        />
      )}
    </div>
  );
};

export default DiscussionForm;
