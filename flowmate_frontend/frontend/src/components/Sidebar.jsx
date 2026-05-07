import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import useMemberStore from "../features/member/store/useMemberStore";
import { getMyProjects, joinProject } from '../lib/projectApi';
import { InviteLinkButton, useProjectStore } from "../features/project";
import ProjectJoinModal from "../features/project/components/ProjectJoinModal";
import { memberPostRequest } from "../lib/memberApi";
import useProjectMemberStore from "../features/member/store/useProjectMemberStore";
import { useLoading } from "./useLoading";
import Loading from "./Loading";

const Sidebar = ({ isOpen, onClose = [] }) => {
  const navigate = useNavigate();
  const memberInfo = useMemberStore((state) => state.memberInfo);
  const clearMemberInfo = useMemberStore((state) => state.clearMemberInfo);
  const clearProjectMemberInfo = useProjectMemberStore((state) => state.clearProjectMembers);
  const {reset} = useProjectStore();
  const { isLoading, withLoading } = useLoading();

  const [isMemberOpen, setIsMemberOpen] = useState(false);
  const [isProjectOpen, setIsProjectOpen] = useState(false);

  const [projectList, setProjectList] = useState([]);
  // const [projectTokenUrl, setProjectTokenUrl] = useState('');

  const [modalShow, setModalShow] = useState(false);
  const [modalType, setModalType] = useState("join");

  const handleJoinProject = async (link) => {
    // 링크가 비어있으면 실행하지 않음
    if (!link) return;

    try {
      // 1. 초대 링크 URL에서 토큰만 추출 
      // (예: http://domain.com/invite/abc-123 -> abc-123 추출)
      const token = link.split("/").pop() || link;

      // 백엔드 API 호출
      await joinProject(token);
      await fetchMyProject();
      setModalType("success"); // alert 대신 성공 모달로 변경
            
      // 필요 시 목록을 다시 불러오는 함수를 여기서 호출하세요 (예: fetchProjects())
    } catch (error) {
      // 2. 에러 핸들링
      // 서버의 응답 구조에 따라 error.response.data 혹은 error.response.data.message를 확인합니다.
      const errorMessage = error.response?.data?.message || "";

      // 백엔드 로직: 이미 참여 중인 경우 IllegalStateException 발생 시 처리
      if (errorMessage.includes("이미 참여 중") || error.response?.status === 400) {
        // 모달의 본문을 "이미 참여 중인 프로젝트입니다."로 바꾸기 위해 타입을 변경
        setModalType("unavailable");
      } else {
        // 그 외 토큰 만료나 잘못된 링크인 경우
        setModalType("wrong");
      }
    }
  };
 
  const handleSuccessConfirm = async () => {
    setModalShow(false);
    onClose();
    const res = await getMyProjects();
    const projects = res.data;
    if(!projects || projects.length === 0){
      navigate("/projects/0");
    } else {
      const maxProjectId = Math.max(...projects.map(p => p.projectId));
      navigate(`/projects/${maxProjectId}`);
    }
  };

  const openModal = (type) => {
    setModalType(type);
    setModalShow(true);
  };
 

  const fetchMyProject = async () => {
    try {
      const res = await getMyProjects();
      setProjectList(res.data);
    } catch (error) {
      console.error("내 프로젝트 조회 실패:", error);

      // 서버에서 내려준 메시지 있으면 출력
      if (error.response) {
        console.error("서버 에러:", error.response.data);
      }

    }
  };

  const handleLogout = async () => {
    withLoading( async () => {
      onClose();

      const payLoad = {};
      const path = "/member/logout";
      const auth = { withCredentials: true };

      await memberPostRequest( payLoad, path, auth);

      clearMemberInfo();
      clearProjectMemberInfo();
      reset(); // useProjectStore clear
      sessionStorage.clear();

      navigate("/");
    });
  };

  const handleCreateProject = () => {
    onClose();
    navigate(`/projects/create`);
  }

  const handleProjectClick = (projectId) => {
    onClose();
    navigate(`/projects/${projectId}`);
  };

  // 로그인 후 프로젝트 목록 바로 로딩 안되는 문제
  useEffect(() => {
    if (memberInfo?.username) {
      fetchMyProject();
    }
  }, [memberInfo?.username]);

  return (
    <>
      {isLoading && <Loading />}
      {/* 오버레이 */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
            zIndex: 998,
          }}
        />
      )}

      {/* 사이드바 본체 */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "380px",
          height: "100vh",
          background: "#f0f0f0",
          zIndex: 999,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
          display: "flex",
          flexDirection: "column",
          boxShadow: isOpen ? "4px 0 16px rgba(0,0,0,0.15)" : "none",
        }}
      >

        {/* 내용 영역 */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 16px" }}>

          {/* 회원 정보 섹션 */}
          <div
            onClick={() => setIsMemberOpen((prev) => !prev)}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              padding: "16px 0 12px",
              cursor: "pointer",
              borderBottom: "1px solid #ddd",
            }}
          >
            <div>
              <div style={{ fontSize: "16px", fontWeight: 700 }}>
                {memberInfo?.memberName ?? "사용자"}({memberInfo?.username ?? ""}) 님
              </div>
              <div style={{ fontSize: "13px", color: "#666", marginTop: "2px" }}>
                {memberInfo?.memberEmail ?? ""}
              </div>
              {isMemberOpen && (
                <div
                  onClick={(e) => { e.stopPropagation(); navigate("/mypage"); onClose(); }}
                  style={{ fontSize: "13px", color: "#333", marginTop: "10px", cursor: "pointer" }}
                >
                  회원정보
                </div>
              )}
            </div>
            <span style={{ fontSize: "12px", marginTop: "4px" }}>
              {isMemberOpen ? "▲" : "▼"}
            </span>
          </div>

          {/* 프로젝트 목록 섹션 */}
          <div style={{ marginTop: "8px" }}>
            <div
              onClick={() => setIsProjectOpen((prev) => !prev)}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
              }}
            >
              <span>프로젝트 목록</span>
              <span style={{ fontSize: "12px" }}>{isProjectOpen ? "▲" : "▼"}</span>
            </div>

            {/* 프로젝트 드롭다운 */}
            {isProjectOpen && (
              <div
                style={{
                  background: "#fff",
                  borderRadius: "8px",
                  padding: "3px 12px",
                  marginBottom: "4px",
                }}
              >
                {projectList.length === 0 ? (
                  <div style={{ fontSize: "13px", color: "#aaa", padding: "8px 0" }}>
                    참여 중인 프로젝트가 없습니다.
                  </div>
                ) : (
                  projectList.map((project, index) => (
                    <div
                      key={project.projectId}
                      onClick={() => handleProjectClick(project.projectId)}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "8px 0",
                        fontSize: "13px",
                        cursor: "pointer",
                        borderBottom: index === projectList.length - 1 ? "none" : "1px solid #f0f0f0"
                      }}
                    >
                      <span>{project.projectTitle}</span>

                      <div onClick={(e) => e.stopPropagation()}>
                        <InviteLinkButton tokenUrl={project.projectTokenUrl} />
                      </div>
                      
                    </div>
                  ))
                )}
              </div>
            )}

            {/* 프로젝트 만들기 */}
            <div
              onClick={() => handleCreateProject()}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                borderTop: "1px solid #e8e8e8",
              }}
            >
              <span>프로젝트 만들기</span>
              <span style={{ fontSize: "18px", color: "#555" }}>+</span>
            </div>

            {/* 프로젝트 참여하기 */}
            <div
              onClick={() => openModal("join")}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 0",
                cursor: "pointer",
                fontWeight: 600,
                fontSize: "14px",
                borderTop: "1px solid #e8e8e8",
              }}
            >
              <span>프로젝트 참여하기</span>
              <span style={{ fontSize: "18px", color: "#555" }}>+</span>
            </div>
          </div>
        </div>

        {/* 로그아웃 - 하단 고정 */}
        <div
          style={{
            padding: "16px 20px",
            textAlign: "right",
            borderTop: "1px solid #ddd",
          }}
        >
          <span
            onClick={handleLogout}
            style={{ fontSize: "13px", color: "#555", cursor: "pointer" }}
          >
            로그아웃
          </span>
        </div>
      </div>

      <ProjectJoinModal
        show={modalShow}
        type={modalType}
        onConfirm={modalType === "join" ? handleJoinProject : modalType === "success" ? handleSuccessConfirm : () => setModalShow(false)}
        onClose={() => setModalShow(false)}
      />

    </>
  );
};

export default Sidebar;