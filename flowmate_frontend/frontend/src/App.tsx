import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import useSocketStore from "./store/useSocketStore.ts";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Router from "./router.tsx";
import ChatPanel from "./features/chat/components/ChatPanel";
import useChatGuard from "./features/chat/hooks/useChatGuard";
import useMemberStore from "./features/member/store/useMemberStore.ts";
import "./App.css";
// 실시간 알림 구현
import { useNotification } from "./components/useNotification.ts";
import NotificationToast from "./features/notification/components/NotificationToast.tsx";

function App() {
  const { connect, disconnect } = useSocketStore();
  const username = useMemberStore((state) => state.memberInfo?.username ?? ""); // 로그인한 유저 정보
  useChatGuard();

  // 실시간 알림 웹소켓 연결
  useNotification(username);

  useEffect(() => {
    if (!username) return;
    connect(username);
    return () => disconnect();
  }, [username]);

  return (
    <>
      <NotificationToast />
      <BrowserRouter>
        <Header />
        <main className="app-main">
          <div className="app-content">
            <Router />
          </div>
          <ChatPanel />
        </main>
        <Footer />
      </BrowserRouter>
    </>
    
  );
}

export default App;
