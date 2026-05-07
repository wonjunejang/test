import { useEffect } from "react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../../../store/useAuthStore";

const WS_URL = import.meta.env.VITE_WEBSOCKET_URL as string | undefined;
const API_URL = import.meta.env.VITE_API_URL as string | undefined;

const BREAKPOINT = 1024;

export default function useChatGuard() {
  const { closePanel, exitRoom, setEnvError, setChatDisabled } = useChatStore();
  const { username } = useAuthStore();

  // 로그인 체크
  useEffect(() => {
    if (username === null) {
      const timer = setTimeout(() => {
        if (!useAuthStore.getState().username) {
          closePanel();
          exitRoom();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [username]);

  // env 검증
  useEffect(() => {
    if (!WS_URL || !API_URL) {
      setEnvError(true);
    } else {
      setEnvError(false);
    }
  }, []);

  // 1024px 미만 차단
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < BREAKPOINT) {
        closePanel();
        exitRoom();
        setChatDisabled(true);
      } else {
        setChatDisabled(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, [closePanel, exitRoom]);
}
