import type { ChatMessage as ChatMessageType } from "../store/chatStore";

interface Props {
  message: ChatMessageType;
}

function formatTime(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function ChatMessage({ message }: Props) {
  const isWhisper = message.type === "WHISPER";
  const isMine = message.isMine;

  return (
    <div className={`chat-message ${isMine ? "mine" : "other"} ${isWhisper ? "whisper" : ""}`}>
      {!isMine && (
        <span className="sender">{message.senderMemberName ?? message.senderUsername}</span>
      )}
      <div className="bubble">{message.chatMessageContent}</div>
      {message.chatMessageSentAt && (
        <span className="time">{formatTime(message.chatMessageSentAt)}</span>
      )}
    </div>
  );
}
