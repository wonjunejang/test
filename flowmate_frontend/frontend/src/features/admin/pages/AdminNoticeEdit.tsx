import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fetchAdminNotices, updateAdminNotice } from "../../../lib/adminNoticeApi";
import type { AdminNotice } from "../types";
import "../adminStyle.css";
import ConfirmModal from "../../../components/ConfirmModal";
import AlertModal from "../../../components/AlertModal";

const AdminNoticeEdit = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [showConfirm, setShowConfirm] = useState(false);
  const [alertMessage, setAlertMessage] = useState<string | null>(null);

  const [initialData, setInitialData] = useState<AdminNotice | null>(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchAdminNotices()
      .then((res) => {
        const found = res.data.find((n) => n.id === Number(id));
        if (!found) {
          setAlertMessage("공지를 찾을 수 없습니다.");
          return;
        }
        setInitialData(found);
        setTitle(found.adminNoticeTitle);
        setContent(found.adminNoticeContent);
      })
      .catch((e) => {
        console.error("공지 불러오기 실패", e);
        setAlertMessage("공지를 불러오는데 실패했습니다.");
      });
  }, [id]);

  const handleSaveClick = () => {
    if (!title.trim()) {
      setAlertMessage("제목을 입력해주세요.");
      return;
    }
    if (!content.trim()) {
      setAlertMessage("내용을 입력해주세요.");
      return;
    }
    setShowConfirm(true);
  };

  const executeUpdate = async () => {
  setShowConfirm(false);
  setIsLoading(true);
  try {
    await updateAdminNotice(Number(id), {
      adminNoticeTitle: title,
      adminNoticeContent: content,
    });
      setAlertMessage("수정되었습니다."); 
    } catch (e) {
      setAlertMessage("수정에 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!initialData && !alertMessage) {
    return <div className="text-center py-5 text-muted">불러오는 중...</div>;
  }

  return (
    <div className="container admin-container">
      <div className="container-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate(-1)}
        />
        <h1 className="fw-bold">공지 수정</h1>
      </div>

      <div className="content-box">
        <div className="tit-area">
          <label className="fw-semibold">제목</label>
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
          onClick={handleSaveClick}
          disabled={isLoading}
        >
          {isLoading ? "처리 중..." : "수정"}
        </button>
      </div>

      {alertMessage && (
        <AlertModal
          message={alertMessage}
          onConfirm={() => {
            setAlertMessage(null);

            if (alertMessage === "수정되었습니다.") {
              navigate("/admin/notices");
            } else if (!initialData) {
              navigate(-1);
            }
          }}
        />
      )}
      
      {showConfirm && (
        <ConfirmModal
          message="공지를 수정하시겠습니까?"
          onCancel={() => setShowConfirm(false)}
          onConfirm={executeUpdate}
        />
      )}
      
    </div>
  );
};

export default AdminNoticeEdit;