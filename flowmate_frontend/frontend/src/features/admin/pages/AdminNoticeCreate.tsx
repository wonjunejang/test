import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createAdminNotice } from "../../../lib/adminNoticeApi";
import "../adminStyle.css";
import ConfirmModal from "../../../components/ConfirmModal";
import AlertModal from "../../../components/AlertModal";

const AdminNoticeCreate = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [showConfirm, setShowConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

 const handleRegisterClick = () => {
    if (!title.trim()) {
      setAlertMessage("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setAlertMessage("내용을 입력해주세요.");
      return;
    }
    setShowConfirm(true); // 검증 통과 시 컨펌 모달
  };

  const executeCreate = async () => {
    setShowConfirm(false);
    setIsLoading(true);
    try {
      await createAdminNotice({ adminNoticeTitle: title, adminNoticeContent: content });
      setAlertMessage("등록되었습니다."); // 성공 메시지 설정 (이동은 AlertModal에서)
    } catch (e) {
      console.error("공지 등록 실패", e);
      setAlertMessage("등록에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container admin-container">
      <div className="container-header">
        <button
          type="button" className="back-btn"
          onClick={() => navigate(-1)}
        />
        <h1 className="fw-bold">공지 등록</h1>
      </div>

      <div className="content-box">
        <div className="tit-area">
          <label className="fw-semibold mb-1 d-block">제목</label>
          <input
            type="text"
            className="form-control"
            placeholder="공지 제목을 입력하세요"
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <div className="text-end text-muted" style={{ fontSize: "0.78rem" }}>
            {title.length} / 200
          </div>
        </div>

        <div>
          <label className="fw-semibold">내용</label>
          <textarea
            className="form-control"
            rows={12}
            placeholder="공지 내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

      </div>
      <div className="container-bottom">
        <button
          type="button"
          className="cancle-button"
          onClick={() => navigate(-1)}
        >
          취소
        </button>
        <button
          type="button"
          className="action-button"
          onClick={handleRegisterClick}
          disabled={isLoading}
        >
          {isLoading ? "처리 중..." : "등록"}
        </button>
      </div>
      
      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => {
            setAlertMessage(null);
            if (alertMessage === "등록되었습니다.") {
              navigate("/admin/notices");
            }
          }}
        />
      )}

      {showConfirm && (
        <ConfirmModal
          message="공지를 등록하시겠습니까?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={executeCreate}
        />
      )}

    </div>
  );
};

export default AdminNoticeCreate;
