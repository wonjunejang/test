// ANCHOR: ChatRoomList
// NOTE: 채팅방 목록 UI 컴포넌트
// NOTE: API 로직은 useChatRoomList 훅에 위임

import useChatStore from "../store/chatStore";
import useChatRoomList from "../hooks/useChatRoomList";

const API_URL = import.meta.env.VITE_API_URL as string | undefined;

// SECTION: 날짜 포맷 유틸
function formatDate(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  return date.toLocaleDateString("ko-KR", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// NOTE: 최근 채팅 순 내림차순 정렬, chatRoomLastChatAt이 null인 방(신규 방)은 맨 앞으로
function sortByLastChat<T extends { chatRoomLastChatAt: string | null }>(rooms: T[]): T[] {
  return [...rooms].sort((a, b) => {
    if (!a.chatRoomLastChatAt && !b.chatRoomLastChatAt) return 0;
    if (!a.chatRoomLastChatAt) return -1;
    if (!b.chatRoomLastChatAt) return 1;
    return new Date(b.chatRoomLastChatAt).getTime() - new Date(a.chatRoomLastChatAt).getTime();
  });
}
// !SECTION

export default function ChatRoomList() {
  const { rooms, setCurrentRoom, closePanel } = useChatStore();

  const {
    fetchError,
    isFormOpen,
    setIsFormOpen,
    roomName,
    setRoomName,
    projects,
    selectedProjectId,
    setSelectedProjectId,
    invitableTeamMembers,
    selectedUsernames,
    isSubmitting,
    handleCreateRoom,
    handleCancelForm,
    handleToggleMember,
  } = useChatRoomList();

  if (!API_URL) {
    return (
      <div className="chat-env-error">
        <p>채팅 서버 설정이 올바르지 않습니다.</p>
        <button onClick={closePanel}>닫기</button>
      </div>
    );
  }

  return (
    <div className="chat-room-list">
      {/* SECTION: 헤더 */}
      <div className="chat-room-list-header">
        <h2>채팅 목록</h2>
        <button onClick={closePanel}>✕</button>
      </div>
      {/* !SECTION */}

      {/* SECTION: 채팅방 생성 버튼 & 폼 */}
      {/* NOTE: 채팅방 없는 프로젝트가 1개 이상 있을 때만 생성 버튼 노출 */}
      {projects.length > 0 && !isFormOpen && (
        <button className="chat-room-create-btn" onClick={() => setIsFormOpen(true)}>
          + 채팅방 만들기
        </button>
      )}

      {isFormOpen && (
        <div className="chat-room-create-form">
          <input
            type="text"
            placeholder="채팅방 이름"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value) || "")}
          >
            <option value="">프로젝트 선택</option>
            {projects.length === 0 ? (
              <option disabled>팀장인 프로젝트가 없습니다.</option>
            ) : (
              projects.map((p) => (
                <option key={p.projectId} value={p.projectId}>
                  {p.projectTitle}
                </option>
              ))
            )}
          </select>

          {/* NOTE: 팀원 초대 체크박스 */}
          {invitableTeamMembers.length > 0 && (
            <div className="chat-room-member-list">
              <p>팀원 초대</p>
              {invitableTeamMembers.map((member) => (
                <label key={member.username} className="chat-room-member-item">
                  <input
                    type="checkbox"
                    checked={selectedUsernames.includes(member.username)}
                    onChange={() => handleToggleMember(member.username)}
                  />
                  {member.memberName}
                </label>
              ))}
            </div>
          )}

          <div className="chat-room-create-actions">
            <button
              onClick={handleCreateRoom}
              disabled={!roomName.trim() || !selectedProjectId || isSubmitting}
            >
              {isSubmitting ? "생성 중..." : "생성"}
            </button>
            <button onClick={handleCancelForm}>취소</button>
          </div>
        </div>
      )}
      {/* !SECTION */}

      {/* SECTION: 채팅방 목록 */}
      <ul>
        {fetchError === "unauthorized" ? (
          <li className="chat-room-empty">로그인이 되지 않았습니다. 로그인 해주세요.</li>
        ) : fetchError === "error" ? (
          <li className="chat-room-empty">채팅방 접속 오류가 발생했습니다.</li>
        ) : rooms.length === 0 ? (
          <li className="chat-room-empty">채팅방이 없습니다.</li>
        ) : (
          sortByLastChat(rooms).map((room) => (
            <li key={room.id} onClick={() => setCurrentRoom(room.id)}>
              <div className="room-name">{room.chatRoomName}</div>
              <div className="room-last-msg">{formatDate(room.chatRoomLastChatAt)}</div>
            </li>
          ))
        )}
      </ul>
      {/* !SECTION */}
    </div>
  );
}
// ANCHOR: ChatRoomList-end
