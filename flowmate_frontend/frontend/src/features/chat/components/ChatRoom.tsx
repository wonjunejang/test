// ANCHOR: ChatRoom
// NOTE: 채팅방 UI 컴포넌트
// NOTE: API 로직은 useChatRoom 훅에 위임, 소켓은 useChatSocket 훅에 위임

import { useState, useRef, useEffect, useCallback } from "react";
import useChatStore from "../store/chatStore";
import useAuthStore from "../../../store/useAuthStore";
import useChatSocket from "../hooks/useChatSocket";
import useChatRoom from "../hooks/useChatRoom";
import ChatMessage from "./ChatMessage";
import ConfirmModal from "../../../components/ConfirmModal";
import AlertModal from "../../../components/AlertModal";

// SECTION: 모달 상태 타입
type ModalState =
  | { type: "none" }
  | { type: "leave" }
  | { type: "delete" }
  | { type: "alert"; message: string }
  | { type: "chatBan"; username: string; memberName: string; currentBanned: boolean };
// !SECTION

export default function ChatRoom() {
  const { currentRoomId, messages, exitRoom, isBanned, isEnvError, isAtBottom, setIsAtBottom } =
    useChatStore();
  const { username: currentUsername } = useAuthStore();

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // SECTION: 스크롤 유틸
  const scrollToBottom = () => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  };

  // NOTE: 스크롤 위치 감지 → isAtBottom 동기화
  // NOTE: 최신 채팅 10개 이상 + 스크롤이 하단에서 멀어지면 화살표 버튼 표시
  const SCROLL_THRESHOLD = 80;
  const handleScroll = useCallback(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    const distanceFromBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight;
    setIsAtBottom(distanceFromBottom <= SCROLL_THRESHOLD);
  }, [setIsAtBottom]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (!container) return;
    container.addEventListener("scroll", handleScroll);
    return () => container.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // NOTE: 메시지가 추가됐을 때 자동 스크롤 판단
  // NOTE: 마지막 메시지가 내 것이면 무조건 스크롤, 남의 것이면 하단에 있을 때만 스크롤
  useEffect(() => {
    const lastMessage = messages.at(-1);
    if (lastMessage?.isMine || isAtBottom) {
      scrollToBottom();
    }
  }, [messages]);
  // !SECTION

  const {
    currentRoom,
    isLeader,
    chatRoomMembers,
    bannedUsernames,
    isInviteOpen,
    setIsInviteOpen,
    invitableMembers,
    selectedUsernames,
    isInviting,
    handleInvite,
    handleToggleInviteMember,
    handleChatBanToggle,
    handleLeave,
    handleDeleteRoom,
  } = useChatRoom(scrollToBottom);

  const { sendMessage } = useChatSocket(currentRoomId);

  const [input, setInput] = useState<string>("");
  const [isWhisper, setIsWhisper] = useState<boolean>(false);
  const [whisperTarget, setWhisperTarget] = useState<string>("");
  const [isBanPanelOpen, setIsBanPanelOpen] = useState<boolean>(false);
  const [modal, setModal] = useState<ModalState>({ type: "none" });

  // SECTION: 메시지 전송
  const handleSend = (): void => {
    if (!input.trim()) return;
    if (isWhisper && !whisperTarget) {
      setModal({ type: "alert", message: "귓속말 대상을 선택해주세요." });
      return;
    }
    sendMessage(input, isWhisper ? "WHISPER" : "GROUP", isWhisper ? whisperTarget : null);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.nativeEvent.isComposing && !isBanned) handleSend();
  };

  const handleWhisperToggle = (): void => {
    setIsWhisper((prev) => !prev);
    setWhisperTarget("");
  };
  // !SECTION

  // SECTION: 밴 처리 확인
  const handleChatBanConfirm = async (): Promise<void> => {
    if (modal.type !== "chatBan") return;
    const { username, memberName, currentBanned } = modal;
    setModal({ type: "none" });

    try {
      await handleChatBanToggle(username, currentBanned);
      setModal({
        type: "alert",
        message: currentBanned
          ? `${memberName}님의 채팅 금지가 해제되었습니다.`
          : `${memberName}님이 채팅 금지되었습니다.`,
      });
    } catch {
      setModal({ type: "alert", message: "처리 중 오류가 발생했습니다." });
    }
  };
  // !SECTION

  if (isEnvError) {
    return (
      <div className="chat-env-error">
        <p>채팅 서버 설정이 올바르지 않습니다.</p>
        <button onClick={exitRoom}>돌아가기</button>
      </div>
    );
  }

  return (
    <div className="chat-room">
      {/* SECTION: 모달 */}
      {modal.type === "leave" && (
        <ConfirmModal
          message="채팅방에서 나가시겠습니까?"
          onCancel={() => setModal({ type: "none" })}
          onConfirm={async () => {
            setModal({ type: "none" });
            await handleLeave();
          }}
        />
      )}
      {modal.type === "delete" && (
        <ConfirmModal
          message="채팅방을 삭제하시겠습니까?"
          subMessage="모든 멤버가 퇴장되고 채팅 내역이 삭제됩니다."
          onCancel={() => setModal({ type: "none" })}
          onConfirm={async () => {
            setModal({ type: "none" });
            await handleDeleteRoom();
          }}
        />
      )}
      {modal.type === "chatBan" && (
        <ConfirmModal
          message={
            modal.currentBanned
              ? `${modal.memberName}님의 채팅 금지를 해제하시겠습니까?`
              : `${modal.memberName}님을 채팅 금지하시겠습니까?`
          }
          onCancel={() => setModal({ type: "none" })}
          onConfirm={handleChatBanConfirm}
        />
      )}
      {modal.type === "alert" && (
        <AlertModal message={modal.message} onConfirm={() => setModal({ type: "none" })} />
      )}
      {/* !SECTION */}

      {/* SECTION: 헤더 */}
      <div className="chat-room-header">
        <button onClick={exitRoom}>←</button>
        <span>채팅방</span>
        {isLeader ? (
          <>
            <button
              className="chat-room-invite-btn"
              onClick={() => setIsInviteOpen(true)}
              title="멤버 초대"
            >
              👥
            </button>
            <button
              className="chat-room-ban-btn"
              onClick={() => setIsBanPanelOpen((prev) => !prev)}
              title="채팅 금지 관리"
            >
              🚫
            </button>
            <button className="chat-room-delete-btn" onClick={() => setModal({ type: "delete" })}>
              방 삭제
            </button>
          </>
        ) : (
          <button className="chat-room-leave-btn" onClick={() => setModal({ type: "leave" })}>
            나가기
          </button>
        )}
      </div>
      {/* !SECTION */}

      {/* SECTION: 밴 관리 패널 */}
      {isBanPanelOpen && isLeader && (
        <div className="chat-ban-panel">
          <div className="chat-ban-panel-header">
            <span>채팅 금지 관리</span>
            <button onClick={() => setIsBanPanelOpen(false)}>✕</button>
          </div>
          <div className="chat-ban-panel-body">
            {chatRoomMembers.length === 0 ? (
              <p className="chat-ban-empty">멤버가 없습니다.</p>
            ) : (
              chatRoomMembers.map((member) => (
                <div key={member.username} className="chat-ban-member-item">
                  <span className="chat-ban-member-name">
                    {member.memberName}
                    <span className="chat-ban-member-username"> @{member.username}</span>
                  </span>
                  <button
                    className={`chat-ban-toggle-btn ${bannedUsernames.has(member.username) ? "banned" : ""}`}
                    onClick={() =>
                      setModal({
                        type: "chatBan",
                        username: member.username,
                        memberName: member.memberName,
                        currentBanned: bannedUsernames.has(member.username),
                      })
                    }
                  >
                    {bannedUsernames.has(member.username) ? "금지 해제" : "채팅 금지"}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
      {/* !SECTION */}

      {/* SECTION: 초대 모달 */}
      {isInviteOpen && isLeader && (
        <div className="chat-invite-modal">
          <div className="chat-invite-modal-header">
            <span>멤버 초대</span>
            <button
              onClick={() => {
                setIsInviteOpen(false);
              }}
            >
              ✕
            </button>
          </div>
          <div className="chat-invite-modal-body">
            {invitableMembers.length === 0 ? (
              <p className="chat-invite-empty">초대할 수 있는 팀원이 없습니다.</p>
            ) : (
              invitableMembers.map((member) => (
                <label key={member.username} className="chat-invite-member-item">
                  <input
                    type="checkbox"
                    checked={selectedUsernames.includes(member.username)}
                    onChange={() => handleToggleInviteMember(member.username)}
                  />
                  {member.memberName}
                  <span className="chat-invite-username">@{member.username}</span>
                </label>
              ))
            )}
          </div>
          <button
            className="chat-invite-confirm-btn"
            onClick={handleInvite}
            disabled={selectedUsernames.length === 0 || isInviting}
          >
            {isInviting ? "초대 중..." : `초대 (${selectedUsernames.length}명)`}
          </button>
        </div>
      )}
      {/* !SECTION */}

      {/* SECTION: 메시지 영역 */}
      <div className="chat-messages-wrapper">
        <div className="chat-room-messages" ref={messagesContainerRef}>
          {messages.map((msg, idx) => (
            <ChatMessage key={idx} message={msg} />
          ))}
        </div>
        {/* NOTE: 최신 채팅 10개 이상 & 하단이 아닐 때만 화살표 버튼 표시 */}
        {messages.length >= 10 && !isAtBottom && (
          <button
            className="chat-scroll-to-bottom-btn"
            onClick={scrollToBottom}
            title="최신 메시지로 이동"
          >
            ↓
          </button>
        )}
      </div>
      {/* !SECTION */}

      {/* SECTION: 입력 영역 */}
      {isBanned ? (
        <div className="chat-banned-input-area">
          <span>🚫 채팅이 금지된 상태입니다.</span>
        </div>
      ) : (
        <div className="chat-room-input">
          {isWhisper ? (
            <>
              <div className="chat-whisper-row">
                <button
                  className="chat-whisper-btn active"
                  onClick={handleWhisperToggle}
                  title="귓속말 모드 OFF"
                >
                  귓말
                </button>
                <select
                  className="chat-whisper-target"
                  value={whisperTarget}
                  onChange={(e) => setWhisperTarget(e.target.value)}
                >
                  <option value="">대상 선택</option>
                  {chatRoomMembers.map((member) => (
                    <option key={member.username} value={member.username}>
                      {member.memberName} (@{member.username})
                    </option>
                  ))}
                </select>
              </div>
              <div className="chat-input-row">
                <input
                  className="chat-message-input"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    whisperTarget
                      ? `${chatRoomMembers.find((m) => m.username === whisperTarget)?.memberName ?? ""}에게 귓속말`
                      : "대상을 선택해주세요"
                  }
                />
                <button onClick={handleSend}>▶</button>
              </div>
            </>
          ) : (
            <>
              <button
                className="chat-whisper-btn"
                onClick={handleWhisperToggle}
                title="귓속말 모드 ON"
              >
                단체
              </button>
              <input
                className="chat-message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지 입력"
              />
              <button onClick={handleSend}>▶</button>
            </>
          )}
        </div>
      )}
      {/* !SECTION */}
    </div>
  );
}
// ANCHOR: ChatRoom-end
