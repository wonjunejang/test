import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./master.css";
import "../features/notification/notifications.css";
import mainLogo from "../assets/flowmate-logo.png";
import chat from "../assets/chat.png";
import alarm from "../assets/alarm.png";
import useChatStore from "../features/chat/store/chatStore";
import AlertModal from "./AlertModal";
import useMemberStore from "../features/member/store/useMemberStore";
import { getMyProjects } from "../lib/projectApi";
import Sidebar from "./Sidebar";
import useProjectMemberStore from "../features/member/store/useProjectMemberStore";
import { useProjectStore } from "../features/project";

// notification
import useNotificationStore from "../features/notification/store/useNotificationStore";
import { fetchUnreadNotificationCount } from "../lib/notificationApi";
import { NotificationList } from "../features/notification";

export default function Header() {
  const navigate = useNavigate();
  const [alertMessage, setAlertMessage] = useState(null);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const clearMemberInfo = useMemberStore((state) => state.clearMemberInfo);


  // stores
  const memberInfo = useMemberStore((state) => state.memberInfo);
  const isLoggedIn = useMemberStore((state) => state.isLoggedIn);
  const _hasHydrated = useMemberStore((state) => state._hasHydrated);
  // chat
  const { togglePanel, isChatDisabled } = useChatStore();
  // notification
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const setUnreadCount = useNotificationStore((state) => state.setUnreadCount);
  // admin
  const isAdmin = memberInfo?.memberStatus === "MADMIN";
  // logout
  const clearProjectMemberInfo = useProjectMemberStore((state) => state.clearProjectMembers);
  const { reset } = useProjectStore();

  




  // 로그인 되어있지 않다면 헤더로고를 클릭했을 때 로그인창으로 이동
  // const handleLogoClick = async () => {
  //   // async 추가
  //   // 3. 로그인 안 된 상태
  //   if (!memberInfo) {
  //     navigate("/");
  //     return;
  //   }

  //   const currentPath = window.location.pathname;

  //   // 1. 현재 프로젝트 메인페이지면 반응하지 않음
  //   // /projects/숫자 형태이고 그 뒤에 아무것도 없을 때
  //   const isProjectMain = /^\/projects\/\d+$/.test(currentPath);
  //   if (isProjectMain) return;

  //   // 2. 다른 화면에서 누르면 현재 프로젝트 메인페이지로 이동
  //   // URL에서 projectId 추출 (예: /projects/41/settings -> 41)
  //   const match = currentPath.match(/\/projects\/(\d+)/);
  //   if (match) {
  //     navigate(`/projects/${match[1]}`);
  //     return;
  //   }

  //   // projectId가 없는 페이지(로그인, 회원가입 등)에서 누르면
  //   const res = await getMyProjects();
  //   const projects = res.data;

  //   if (!projects || projects.length === 0) {
  //     navigate("/projects/0");
  //   } else {
  //     const maxProjectId = Math.max(...projects.map((p) => p.projectId));
  //     navigate(`/projects/${maxProjectId}`);
  //   }

  //   if (!projects || projects.length === 0) {
  //     navigate("/projects/0");
  //   } else {
  //     const maxProjectId = Math.max(...projects.map((p) => p.projectId));
  //     navigate(`/projects/${maxProjectId}`);
  //   }
  // };

  // useCallback으로 메모이제이션 + 중복 navigate 블록 제거
  const handleLogoClick = useCallback(async () => {
    if (!memberInfo) {
      navigate("/");
      return;
    }

    const currentPath = window.location.pathname;

    if (/^\/projects\/\d+$/.test(currentPath)) return;

    const match = currentPath.match(/\/projects\/(\d+)/);
    if (match) {
      navigate(`/projects/${match[1]}`);
      return;
    }

    try {
      const res = await getMyProjects();
      const projects = res.data;
      const targetId =
        projects?.length > 0
          ? Math.max(...projects.map((p) => p.projectId))
          : 0;
      navigate(`/projects/${targetId}`);
    } catch (e) {
      console.error("프로젝트 목록 조회 실패", e);
      navigate("/projects/0");
    }
  }, [memberInfo, navigate]);


  const handleChatOpen = useCallback(() => {
    if (!memberInfo?.username) {
      setAlertMessage("로그인이 필요한 서비스입니다.");
      return;
    }
    if (isChatDisabled) {
      setAlertMessage("채팅은 1024px 이상에서 사용 가능합니다.");
      return;
    }
    togglePanel();
  }, [memberInfo, isChatDisabled, togglePanel]);

  const toggleNotification = useCallback(() => {
    if (!memberInfo?.username) {
      setAlertMessage("로그인이 필요한 서비스입니다.");
      return;
    }
    setIsNotificationOpen((prev) => !prev);
  }, [memberInfo, setAlertMessage]);

  const handleSidebarOpen = useCallback(() => {
    if (!memberInfo?.username) {
      setAlertMessage("로그인이 필요한 서비스입니다.");
      return;
    }
    setIsSidebarOpen(true);
  }, [memberInfo, setAlertMessage]);

    // 읽지 않은 알림 개수
  const loadUnreadCount = async () => {
    if (!isLoggedIn) return;

    try {
      const res = await fetchUnreadNotificationCount();
      setUnreadCount(res.data);
    } catch (e) {
      console.error("알림 개수 조회 실패", e);
    }
  };

  // 로그아웃 시 즉시 초기화
  useEffect(() => {
    if (!isLoggedIn) {
      setUnreadCount(0);
    }
  }, [isLoggedIn]);

  // 로그인 됐을 때만 api 호출하기
  useEffect(() => {
    if (!_hasHydrated) return;

    // 로그인 안 되어 있으면 호출 x
    if (!isLoggedIn) {
      setUnreadCount(0);
      return;
    }

    loadUnreadCount();
  }, [isLoggedIn, _hasHydrated]);


  return (
    <>
      <header>
        <div className="header-inner">

          {/* 마이페이지 */}
          <div className="header-left">
            {!isAdmin ? (
              <button 
                className="mypage-btn" 
                onClick={handleSidebarOpen}
              />
            ) : (
              /* 관리자 로그아웃 버튼 */
              <button
                style={{ fontSize: "13px", color: "#555", background: "#fff", border: "none", cursor: "pointer", borderRadius:"5px", padding:"5px 10px" }}
                onClick={async () => {
                  try {
                    const payLoad = {};
                    const path = "/member/logout";
                    const auth = { withCredentials: true };
                    
                    await memberPostRequest(payLoad, path, auth);
                  } catch (error) {
                    console.warn("서버 로그아웃 처리 중 오류 발생:", error);
                  } finally {
                    clearMemberInfo();
                    clearProjectMemberInfo?.();
                    reset?.();
                    sessionStorage.clear();
                    
                    navigate("/");
                  }
                }}
              >
                로그아웃
              </button>
            )}
          </div>

          {/* 로고 */}
          <div className="header-logo">
            <img 
              src={mainLogo}
              alt="FlowMate" 
              width={100} 
              onClick={handleLogoClick} 
            />
          </div>

          <nav className="header-nav">
            {!isAdmin ? (
              <>
                {/* 채팅 */}
                <button onClick={handleChatOpen}>
                  <img src={chat} alt="채팅" width={28} />
                </button>

                {/* 알림 */}
                <button
                  className="notification-wrapper"
                  onClick={toggleNotification}
                >
                  <img src={alarm} alt="알림" width={28} />
                  
                  {/* 안읽은 알림이 1개 이상일 때만 */}
                  {unreadCount > 0 && (
                    <span className="notification-badge">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>
              </>
            ):(
              <div className="header-nav"></div>
            )}
          </nav>
        </div>

        {alertMessage && (
          <AlertModal 
            message={alertMessage} 
            onConfirm={() => setAlertMessage(null)}
          />
        )}
      </header>

      {/* 사이드바 */}
      <Sidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        projects={[]} // 나중에 프로젝트 목록 API 연결
      />

      {/* 알림 슬라이드 패널 */}
      <div className={`notification-panel ${isNotificationOpen ? "open" : ""}`}>
        <div
          className="notification-overlay" 
          onClick={() => setIsNotificationOpen(false)}
        />

        <div className="notification-drawer">
          <NotificationList 
            onClose={() => setIsNotificationOpen(false)} 
            isOpen={isNotificationOpen}
          />
        </div>
      </div>
    </>
  );
}
