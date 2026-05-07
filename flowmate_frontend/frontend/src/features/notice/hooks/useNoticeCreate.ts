import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createNotice, updateNotice, readNotice } from "../../../lib/noticeApi";
import type { NoticeRequest } from "../types";

interface UseNoticeFormOptions {
  mode?: "create" | "edit";
  noticeId?: number;
  projectId?: string;       // 모달에서 직접 주입 가능하도록 optional 추가
  onSuccess?: () => void;   // 모달 닫기 or 목록 갱신 콜백
  redirectOnSuccess?: boolean; // 페이지 이동 여부 (기본 true)
}

export const useNoticeCreate = ({
  mode = "create",
  noticeId,
  projectId: propProjectId,
  onSuccess,
  redirectOnSuccess = true,
}: UseNoticeFormOptions) => {
  const { projectId: paramProjectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  // useParams가 없는 모달 환경에서는 props로 받은 projectId 사용
  const projectId = propProjectId ?? paramProjectId;

  const handleSubmit = async (data: NoticeRequest) => {
    if (!projectId) {
      setAlertMessage("프로젝트 ID를 찾을 수 없습니다.");
      return;
    }

    setIsLoading(true);

    try {
      if (mode === "create") {
        const res = await createNotice(projectId, data);
        const createdId = res.data.noticeId;

        try {
          await readNotice(projectId, createdId, "99");
        } catch {
          console.warn("읽음 처리 실패 (무시)");
        }
      } else {
        if (!noticeId) {
          setAlertMessage("공지 ID를 찾을 수 없습니다.");
          return;
        }
        await updateNotice(projectId, noticeId, data);
      }

      // 콜백이 있으면 실행 (모달 닫기, 목록 갱신 등)
      onSuccess?.();

      // 페이지 이동이 필요한 경우에만 navigate
      if (redirectOnSuccess) {
        navigate(`/projects/${projectId}/notices`);
      }
    } catch (e) {
      console.error("공지사항 저장 실패:", e);
      setAlertMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    handleSubmit,
    alertMessage,               // 추가
    clearAlert: () => setAlertMessage(null), // 추가
  };
};