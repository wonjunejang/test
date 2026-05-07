import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import ProjectJoinModal from "../components/ProjectJoinModal";
import { joinProject } from "../../../lib/projectApi";
import { useProjectDetail } from "../hooks/useProjectDetail";
import InviteLinkButton from "../components/InviteLinkButton";
import TodoProgress from "../../todo/components/TodoProgress";
import useTodo from "../../todo/hooks/useTodo";
import TodoSection from "../../todo/components/TodoSection";
import useMemberStore from "../../member/store/useMemberStore";
import settingIcon from "../../../assets/setting.png";
import calendarIcon from "../../../assets/calendar.png";
import leaderIcon from "../../../assets/crown.png";

// 회의록 목록
import { useRecentDiscussions } from "../../discussion/hooks/useRecentDiscussions";
// 공지 목록
import useNoticeList from '../../notice/hooks/useNoticeList';
// 관리자 공지 목록
import { useUserNoticeList } from "../../admin/hooks/useUserNoticeList";
import "../project.css"
// 최신 게시물 컴포넌트
import RecentListComponent from "../components/RecentListComponent";
import ConfirmModal from "../components/ConfirmModal";
import useAlertStore from "../../member/store/useAlertStore";
import AlertModal from "../../../components/AlertModal";

const ProjectDetailPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const id = Number(projectId);

  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState<"join" | "unavailable">("join");

  const { currentProject, isLoading, error, showKickedModal, handleKickedConfirm, showUnauthorizedModal, handleUnauthorizedConfirm } = useProjectDetail(id);
  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");
  const { progress, refresh: refreshProgress } = useTodo({
    projectId: id,
    username: loginUsername,
  });

  const handleJoinProject = async (link?: string) => {
    if(!link) return;
    try{
      const token = link.split("/").pop() || link;
      await joinProject(token);
      openAlert("프로젝트에 성공적으로 참여했습니다!");
      setModalShow(false);
    } catch (error : any) {
      openAlert("유효하지 않은 링크입니다.");
      const errorMessage = error.response?.data?.message || "";
      if (errorMessage.includes("이미 참여 중") || error.response?.status === 400) {
        setModalType("unavailable");
      } else {
        openAlert(errorMessage || "유효하지 않은 링크입니다.");
        setModalShow(false);
      }
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    return dateStr.slice(0, 10).replace(/-/g, ".");
  };

  const isLeader = currentProject?.leaderUsername === loginUsername;

  // discussions 추가
  const { discussions, isLoading: isDiscussionLoading } = useRecentDiscussions(id);

  // 공지 추가
  const { recentNotices, handleMoveToNotice } = useNoticeList(id);

  // 관리자 공지 추가
  const { notices: adminNotices, isLoading: isAdminNoticeLoading } = useUserNoticeList(loginUsername);

  // 모달
    const { isOpen, message, onConfirm, close, openAlert } = useAlertStore();

  // 프로젝트 없을 때 화면
  if (id === 0) {
    return (
      <>
        {isOpen && (<AlertModal message={message} onConfirm={() => { onConfirm?.(); close(); }} /> )}
        <div
          className="d-flex flex-column justify-content-center align-items-center gap-3"
          style={{ height: "calc(100vh - 80px)" }}
        >
          <button
            className="btn btn-dark fw-bold"
            style={{ width: "300px", height: "60px", fontSize: "1.1rem" }}
            onClick={() => navigate("/projects/create")}
          >
            프로젝트 만들기
          </button>
          <button
            className="btn btn-outline-secondary fw-bold"
            style={{ width: "300px", height: "60px", fontSize: "1.1rem" }}
            onClick={() => {setModalType("join"); setModalShow(true)}}
          >
            프로젝트 참여하기
          </button>

          <ProjectJoinModal
            show={modalShow}
            type={modalType}
            onConfirm={handleJoinProject}
            onClose={() => setModalShow(false)}
          />
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 mt-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-danger m-4">{error}</div>;
  }

  if (!currentProject) return null;

  return (
    <>
    <div>
      {/* 퇴출 모달 추가 */}
      <ConfirmModal
        show={showKickedModal}
        title="프로젝트 퇴출"
        message="프로젝트에서 퇴출당했습니다."
        confirmText="확인"
        onConfirm={handleKickedConfirm}
        onCancel={handleKickedConfirm}
      />

      <ConfirmModal
        show={showUnauthorizedModal}
        title="접근 불가"
        message="허가되지 않은 사용자입니다."
        confirmText="확인"
        onConfirm={handleUnauthorizedConfirm}
        onCancel={handleUnauthorizedConfirm}
      />
      <div key={id}>
        <div style={{
          padding: "2rem 1rem",
          background: "#F0F0F0",
          paddingTop: '0px !important'
        }}>
          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div className="d-flex justify-content-between flex-column flex-md-row align-items-start mb-5 mb-md-4">
              <div>
                <h2 className="fw-bold mb-1">{currentProject.projectTitle}</h2>

                <div className="d-flex align-items-center gap-2 mb-1 mt-2" style={{ fontSize: "13.5px", color: "#888" }}>
                  <span className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "13px", opacity: 0.7, display: "flex", alignItems: "center" }}>
                      <img alt="기간" src={calendarIcon} width={"15px"} />
                    </span>
                    {formatDate(currentProject.projectStartDate)} ~ {formatDate(currentProject.projectEndDate)}
                  </span>
                  <span style={{ width: "1px", height: "12px", background: "#ccc", display: "inline-block" }} />
                  <span className="d-flex align-items-center gap-2">
                    <span style={{ fontSize: "13px", opacity: 0.7, display: "flex", alignItems: "center" }}>
                      <img alt="팀장" src={leaderIcon} width={"17px"} />
                    </span>
                    {currentProject.leaderName} ({currentProject.leaderUsername})
                  </span>
                </div>


                <div className="text-muted" style={{ fontSize: "0.85rem" }}>
                  {currentProject.projectContent}
                </div>
              </div>
              <div className="d-flex gap-2 align-items-center mt-2 mt-md-0">
                <div onClick={(e) => e.stopPropagation()}>
                  <InviteLinkButton tokenUrl={currentProject.projectTokenUrl} />
                </div>
                  <button
                    className="btn btn-outline-secondary btn-sm p-1 d-flex g-2 align-items-center"
                    onClick={() => navigate(`/projects/${id}/settings`)}
                  >
                    <img alt="설정" src={settingIcon} width={"13px"} style={{marginRight: "4px"}} />
                    설정
                  </button>
              </div>
            </div>

            <TodoProgress progress={progress} />
          </div>
        </div>
        
        <div style={{ maxWidth: "900px", margin: "0 auto", padding: "2rem 1rem 150px" }}>
          
            <div className="row" style={{ marginBottom: "4rem" }}>
              <RecentListComponent
                title="관리자 공지"
                isLoading={isAdminNoticeLoading}
                emptyMessage="등록된 관리자 공지가 없습니다."
                items={adminNotices.slice(0, 3).map((n) => ({
                  id: n.id,
                  title: n.adminNoticeTitle,
                  createdAt: n.adminNoticeCreatedAt,
                }))}
                onTitleClick={() => navigate('/notices', { state: { fromProjectId: projectId } })}
                onItemClick={(id) => navigate(`/notices/${id}`)}
              />

              <RecentListComponent
                title="공지"
                isLoading={isLoading}
                emptyMessage="등록된 공지사항이 없습니다."
                items={recentNotices.map((n) => ({
                  id: n.noticeId,
                  title: n.noticeTitle,
                  createdAt: n.noticeCreatedAt,
                }))}
                onTitleClick={() => navigate(`/projects/${id}/notices`)}
                onItemClick={(id) => handleMoveToNotice(id)}
              />

              <RecentListComponent
                title="회의록"
                isLoading={isDiscussionLoading}
                emptyMessage="등록된 회의록이 없습니다."
                items={discussions.map((d) => ({
                  id: d.discussionId,
                  title: d.discussionTitle,
                  createdAt: d.discussionCreatedAt,
                }))}
                onTitleClick={() => navigate(`/projects/${id}/discussions`)}
                onItemClick={(discussionId) => navigate(`/projects/${id}/discussions/${discussionId}`)}
              />
            </div>



















          <TodoSection onProgressRefresh={refreshProgress} />
        </div>
      </div>
    </div>
    </>
  );
};

export default ProjectDetailPage;
