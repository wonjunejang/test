import { useState, useEffect } from "react";
import { createNotice, fetchNotice, updateNotice, readNotice } from "../../../lib/noticeApi";
import type { NoticeRequest } from "../types";
import useNotificationStore from "../../notification/store/useNotificationStore";
import AlertModal from "../../../components/AlertModal";
import ConfirmModal from "../../../components/ConfirmModal";

interface Props {
  projectId: string;
  noticeId?: string | undefined;        // 있으면 수정 모드, 없으면 등록 모드
  onClose: () => void;
  onSuccess: () => void;
}

export default function NoticeCreateModal({ projectId, noticeId, onClose, onSuccess }: Props) {
  const isEditMode = !!noticeId;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditMode);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

  // 작성 취소 확인을 위한 상태
  const [isCloseConfirm, setIsCloseConfirm] = useState(false);

  const [originalTitle, setOriginalTitle] = useState("");
  const [originalContent, setOriginalContent] = useState("");

  const increaseUnread = useNotificationStore((s) => s.increaseUnread);
  const triggerRefresh = useNotificationStore((s) => s.triggerRefresh);

  // 수정 모드일 경우 기존 공지 데이터 불러오기
  useEffect(() => {
    if (!isEditMode) return;

    const fetchEditNotice = async () => {
      try {
        const response = await fetchNotice(projectId, noticeId!);
        const { noticeTitle, noticeContent } = response.data;
        setTitle(noticeTitle);
        setContent(noticeContent);

        // 기존 내용
        setOriginalTitle(noticeTitle);  
        setOriginalContent(noticeContent);

      } catch (e) {
        console.error("공지 불러오기 실패", e);
        setAlertMessage("공지 정보를 불러오지 못했습니다.");
        // onClose();
      } finally {
        setIsFetching(false);
      }
    };

    fetchEditNotice();
  }, [isEditMode, projectId, noticeId]);

  
  // 변경 사항이 있는지 확인 (등록 모드일 땐 입력값이 있는지, 수정 모드일 땐 원본과 다른지)
  const isModified = isEditMode 
    ? (title !== originalTitle || content !== originalContent)
    : (title.trim() !== "" || content.trim() !== "");

  const isUnchanged = isEditMode && !isModified;

  // 닫기 시도 핸들러
  const handleCloseAttempt = () => {
    if (isModified) {
      setIsCloseConfirm(true); // 변경 내용이 있으면 확인 모달 표시
    } else {
      onClose(); // 내용 없으면 바로 닫기
    }
  };

  const handleConfirmed = async () => {
    setConfirmMessage(null);

    const actionLabel = isEditMode ? "수정" : "등록";
    const payload: NoticeRequest = {
      noticeTitle: title,
      noticeContent: content,
    };

    setIsLoading(true);
    try {
      if (isEditMode) {
        await updateNotice(projectId, noticeId!, payload);
        await readNotice(projectId, noticeId!, "99");
      } else {
        const response = await createNotice(projectId, payload);
        const newNoticeId = response?.data?.noticeId;
        await readNotice(projectId, newNoticeId, "99");
        increaseUnread();
      }

      triggerRefresh();
      onSuccess();
      onClose();
    } catch (e) {
      console.error(`공지 ${actionLabel} 실패`, e);
      setAlertMessage(`${actionLabel}에 실패했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = () => {
    if (!title.trim()) { setAlertMessage("제목을 입력해주세요."); return; }
    if (!content.trim()) { setAlertMessage("내용을 입력해주세요."); return; }

    const actionLabel = isEditMode ? "수정" : "등록";
    setConfirmMessage(`공지를 ${actionLabel}하시겠습니까?`); // confirm 모달 띄우기
  };

  // 불러오기 실패 시 모달 닫기 처리
  const handleAlertConfirm = () => {
    const wasFetchError = alertMessage === "공지 정보를 불러오지 못했습니다.";
    setAlertMessage(null);
    if (wasFetchError) onClose();
  };

  return (
    <>
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onConfirm={handleAlertConfirm}
        />
      )}

      {/* 등록/수정 실행 확인 모달 */}
      {confirmMessage && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={handleConfirmed}
          onCancel={() => setConfirmMessage(null)}
        />
      )}

      {/* 작성 취소 확인 모달 */}
      {isCloseConfirm && (
        <ConfirmModal
          message="입력된 내용이 사라집니다. 취소하시겠습니까?"
          onConfirm={onClose}
          onCancel={() => setIsCloseConfirm(false)}
        />
      )}

      <div
        className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
        style={{ background: "rgba(0, 0, 0, 0.4)", zIndex: 1000 }}
        onClick={(e) => { if (e.target === e.currentTarget) handleCloseAttempt(); }}
      >
        <div
          className="bg-white rounded-3 p-4"
          style={{ width: "520px", maxHeight: "90vh", overflowY: "auto" }}
        >
          {/* 헤더 */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h6 className="fw-semibold mb-0">공지 {isEditMode ? "수정" : "등록"}</h6>
            <button className="btn-close" onClick={handleCloseAttempt} disabled={isLoading} />
          </div>

          {/* 데이터 로딩 중 */}
          {isFetching ? (
            <div className="text-center py-5 text-muted">불러오는 중...</div>
          ) : (
            <>
              {/* 제목 */}
              <div className="mb-3">
                <label className="form-label fw-medium small">제목 *</label>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="공지 제목을 입력하세요."
                  maxLength={200}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <div className="text-end text-muted" style={{ fontSize: "0.78rem" }}>
                  {title.length} / 200
                </div>
              </div>

              {/* 내용 */}
              <div className="mb-4">
                <label className="form-label fw-medium small">내용 *</label>
                <textarea
                  className="form-control form-control-sm"
                  placeholder="공지 내용을 입력하세요."
                  rows={8}
                  style={{ resize: "vertical" }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              {/* 버튼 */}
              <div className="d-flex justify-content-end gap-2">
                <button
                  className="btn btn-dark btn-sm px-4"
                  onClick={handleSubmit}
                  disabled={isLoading || !title.trim() || !content.trim() || isUnchanged}
                >
                  {isLoading ? "처리 중..." : isEditMode ? "수정" : "등록"}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
    
  );
}