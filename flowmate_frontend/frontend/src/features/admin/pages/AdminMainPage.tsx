import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchAdminNotices } from "../../../lib/adminNoticeApi";
import { fetchSchedulerList } from "../../../lib/adminSchedulerApi";
import type { AdminNotice, AdminSchedulerDto } from "../types";
import "../adminStyle.css";

const TYPE_LABEL: Record<string, string> = {
  MEMBER: "멤버",
  TODO: "투두",
  DISCUSSION: "회의록",
  PROJECT: "프로젝트",
};

const TYPE_COLOR: Record<string, string> = {
  MEMBER: "#28a9ff",
  TODO: "#ff9810",
  DISCUSSION: "#00be3f",
  PROJECT: "#9b00d8",
};

const getDday = (scheduledAt: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(scheduledAt);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
};

const AdminMainPage = () => {
  const navigate = useNavigate();
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [schedulerList, setSchedulerList] = useState<AdminSchedulerDto[]>([]);

  useEffect(() => {
    fetchAdminNotices()
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const filtered = data
          .sort((a, b) => b.id - a.id)
          .slice(0, 5);
        setNotices(filtered);
      })
      .catch((e) => console.error("공지 조회 실패", e));

    fetchSchedulerList("ALL")
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        const sorted = data
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())
          .slice(0, 5);
        setSchedulerList(sorted);
      })
      .catch((e) => console.error("스케줄러 조회 실패", e));
  }, []);

  return (
    <div className="container admin-container">
      <div className="container-header">
        <h1 className="fw-bold">관리자 페이지</h1>
      </div>

      <div className="first-table">
        <div className="d-flex preview-list">
          <h2 className="fw-bold">공지사항</h2>
          <button
            type="button"
            className="more-btn"
            onClick={() => navigate("/admin/notices")}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th className="num" style={{ width: "12%" }}>번호</th>
              <th className="tit">제목</th>
              <th className="status" style={{ width: "15%" }}>상태</th>
              <th className="date" style={{ width: "20%" }}>작성일</th>
            </tr>
          </thead>
          <tbody>
            {notices.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted" style={{ padding: "15px" }}>
                  등록된 공지가 없습니다.
                </td>
              </tr>
            ) : (
              notices.map((notice, index) => (
                <tr>
                  <td className="num">{notices.length - index}</td>
                  <td
                      className="tit"
                      style={{
                        cursor: "pointer",
                      }}
                      onClick={() => navigate(`/admin/notices/${notice.id}`)}
                      title={notice.adminNoticeTitle}
                    >
                      {notice.adminNoticeTitle.length > 22
                        ? notice.adminNoticeTitle.substring(0, 22) + "..."
                        : notice.adminNoticeTitle}
                    </td>
                  <td className="status">
                    <span className={`${notice.delYn === "N" ? "status-suc" : "status-del"}`}>
                      {notice.delYn === "N" ? "공개" : "삭제"}
                    </span>
                  </td>
                  <td className="date">
                    {notice.adminNoticeCreatedAt?.toString().slice(0, 10)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div>
        <div className="d-flex preview-list">
          <h2 className="fw-bold">삭제 임박 데이터</h2>
          <button
            type="button"
            className="more-btn"
            onClick={() => navigate("/admin/scheduler")}
          />
        </div>
        <table>
          <thead>
            <tr>
              <th className="num" style={{ width: "13%" }}>번호</th>
              <th className="type" style={{ width: "13%" }}>타입</th>
              <th className="tit">제목/이름</th>
              <th className="pending-delete" style={{ width: "20%" }}>삭제 예정일</th>
            </tr>
          </thead>
          <tbody>
            {schedulerList.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-muted" style={{ padding: "15px" }}>
                  삭제 대기 중인 데이터가 없습니다.
                </td>
              </tr>
            ) : (
              schedulerList.map((item, index) => {
                const dday = getDday(item.scheduledAt);
                return (
                  <tr key={`${item.type}-${item.id}`}>
                    <td className="num">{index + 1}</td>
                    <td className="type">
                      <span className="type"
                        style={{ background: TYPE_COLOR[item.type] }}
                      >
                        {TYPE_LABEL[item.type] ?? item.type}
                      </span>
                    </td>
                    <td className="tit d-flex"
                      title={item.title}
                    >
                      {item.title}
                      <span
                        className="dday"
                        style={{ background: dday <= 3 ? "#dc3545" : "#aaaaaa" }}
                      >
                        D-{dday}
                      </span>
                    </td>
                    <td className="pending-delete" style={{ color: "#dc3545", fontWeight: 600 }}>
                      {item.scheduledAt?.toString().slice(0, 10)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminMainPage;