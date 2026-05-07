import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { axiosInstance } from "../../../lib/axios";
import type { AdminNotice } from "../types";
import "../adminStyle.css";

const AdminNoticeDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [notice, setNotice] = useState<AdminNotice | null>(null);
  const [allIds, setAllIds] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // 상세 조회
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    axiosInstance
      .get<AdminNotice>(`/admin-notices/${id}`)
      .then((res) => setNotice(res.data))
      .catch((e) => {
        console.error("공지 상세 조회 실패", e);
        alert("공지를 불러오는데 실패했습니다.");
      })
      .finally(() => setIsLoading(false));
  }, [id]);

  // 전체 id 목록
  useEffect(() => {
    axiosInstance
      .get<AdminNotice[]>("/admin-notices")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const ids = data
          .sort((a, b) => b.id - a.id)
          .map((n) => n.id);
        setAllIds(ids);
      })
      .catch((e) => console.error("목록 조회 실패", e));
  }, []);

  const currentIndex = allIds.indexOf(Number(id));
  const prevId = currentIndex < allIds.length - 1 ? allIds[currentIndex + 1] : null;
  const nextId = currentIndex > 0 ? allIds[currentIndex - 1] : null;

  if (isLoading) return <div className="text-center py-5 text-muted">불러오는 중...</div>;
  if (!notice) return null;

  return (
    <div className="container admin-container">
      <div className="container-header">
        <button
          type="button"
          className="back-btn"
          onClick={() => navigate("/admin/notices")}
        />
        <h1 className="fw-bold">공지사항</h1>
        {notice.delYn === "N" && (
        <div className="ms-auto">
          <button
            type="button"
            className="edit-btn"
            onClick={() => navigate(`/admin/notices/${id}/edit`)}
          >
            수정
          </button>
        </div>
        )}
      </div>

      <div className="content-box">
        <div style={{ borderBottom: "1px solid #dee2e6", paddingBottom: "1rem", marginBottom: "1rem" }}>
          <h2 className="fw-bold">{notice.adminNoticeTitle}</h2>
          <div className="date-status">
            <div style={{ fontSize: "0.82rem", color: "#6c757d" }}>
              작성일: {notice.adminNoticeCreatedAt?.toString().slice(0, 10)}
            </div>
            <div className={`badge ${notice.delYn === "N" ? "status-suc" : "status-del"}`}>
              {notice.delYn === "N" ? "공개" : "삭제"}
            </div>
          </div>
        </div>

        <div
          style={{
            fontSize: "0.95rem",
            lineHeight: "1.8",
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            minHeight: "200px",
          }}
        >
          {notice.adminNoticeContent}
        </div>
      </div>

      <div className="container-bottom move-btn">
        <button
          type="button"
          className="prev-btn"
          disabled={!prevId}
          onClick={() => prevId && navigate(`/admin/notices/${prevId}`)}
        >
          이전
        </button>
        <button
          type="button"
          className="next-btn"
          disabled={!nextId}
          onClick={() => nextId && navigate(`/admin/notices/${nextId}`)}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default AdminNoticeDetail;
