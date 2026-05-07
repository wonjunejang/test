import type { ProjectMember } from "../types";

interface Props {
  member: ProjectMember;
  isLeader: boolean;          // 현재 로그인 유저가 팀장인지
  loginUsername: string;      // 현재 로그인 유저
  onKick: (username: string) => void;
  onDelegate: (username: string) => void;
  onChatBan: (username: string, ban: boolean) => void;
}

const MemberItem = ({
  member,
  isLeader,
  loginUsername,
  onKick,
  onDelegate,
  onChatBan,
}: Props) => {
  const isMyself = member.username === loginUsername;

  return (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
      {/* 팀원 정보 */}
      <div>
        <span className="fw-bold">{member.memberName}</span>
        <span className="text-muted small ms-2">({member.username})</span>
        {member.memberRole === "LEADER" && (
          <span className="badge bg-warning text-dark ms-2">팀장</span>
        )}
        {member.memberChatBannedYn === "Y" && (
          <span className="badge bg-danger ms-2">채팅정지</span>
        )}
      </div>

      {/* 팀장만, 자기 자신 제외 */}
      {isLeader && !isMyself && (
        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm"
            onClick={() => onDelegate(member.username)}
          >
            팀장 위임
          </button>
          <button
            className="btn btn-outline-warning btn-sm"
            onClick={() =>
              onChatBan(member.username, member.memberChatBannedYn === "N")
            }
          >
            {member.memberChatBannedYn === "Y" ? "채팅 해제" : "채팅 정지"}
          </button>
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => onKick(member.username)}
          >
            퇴출
          </button>
        </div>
      )}
    </div>
  );
};

export default MemberItem;