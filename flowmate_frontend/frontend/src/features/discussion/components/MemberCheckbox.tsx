import { useEffect, useState } from "react";
import { fetchTeamMembers } from "../../../lib/discussionApi";
import type { TeamMember } from "../types";

interface Props {
  projectId: string;
  selected: string[];
  onChange: (usernames: string[]) => void;
  excludeUsername?: string | undefined; // NOTE: 체크박스 목록에서 제외할 유저 (작성자 본인)
}

const MemberCheckbox = ({ projectId, selected = [], onChange, excludeUsername }: Props) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);

  useEffect(() => {
    fetchTeamMembers(projectId).then((res) => {
      // NOTE: 작성자 본인은 체크박스 목록에서 제외
      const filtered = excludeUsername
        ? res.data.filter((m) => m.username !== excludeUsername)
        : res.data;
      setTeamMembers(filtered);
    });
  }, [projectId, excludeUsername]);

  const allUsernames = teamMembers.map((m) => m.username);
  const isAllSelected = allUsernames.length > 0 && allUsernames.every((u) => selected.includes(u));

  const handleToggleAll = () => {
    if (isAllSelected) {
      // NOTE: 전체 해제 - 현재 목록에 있는 멤버만 제거 (excludeUsername으로 제외된 멤버는 건드리지 않음)
      onChange(selected.filter((u) => !allUsernames.includes(u)));
    } else {
      // NOTE: 전체 선택 - 중복 없이 합산
      onChange([...new Set([...selected, ...allUsernames])]);
    }
  };

  const handleToggle = (username: string) => {
    const next = selected.includes(username)
      ? selected.filter((u) => u !== username)
      : [...selected, username];
    onChange(next);
  };

  return (
    <div>
      <div className="mb-2">
        <div className="form-check form-check-inline">
          <input
            className="form-check-input"
            type="checkbox"
            id="member-select-all"
            checked={isAllSelected}
            onChange={handleToggleAll}
          />
          <label className="form-check-label fw-semibold" htmlFor="member-select-all">
            전체 선택
          </label>
        </div>
      </div>
      <div className="d-flex flex-wrap gap-2">
        {teamMembers.map((member) => (
          <div key={member.username} className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="checkbox"
              id={`member-${member.username}`}
              checked={selected.includes(member.username)}
              onChange={() => handleToggle(member.username)}
            />
            <label className="form-check-label" htmlFor={`member-${member.username}`}>
              {member.memberName}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MemberCheckbox;
