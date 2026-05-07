import useChatStore from "../store/chatStore";
import ChatRoomList from "./ChatRoomList";
import ChatRoom from "./ChatRoom";
import "../ChatPanel.css";

const PANEL_WIDTH = 300;

export default function ChatPanel() {
  const { isPanelOpen, currentRoomId } = useChatStore();

  if (!isPanelOpen) return null;

  return (
    <aside className="chat-panel" style={{ width: "300px" }}>
      <div className="chat-panel-inner">{currentRoomId ? <ChatRoom /> : <ChatRoomList />}</div>
    </aside>
  );
}
