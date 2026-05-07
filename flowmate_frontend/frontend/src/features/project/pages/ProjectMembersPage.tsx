import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useMembers } from "../hooks/useMembers";
import { useProjectDetail } from "../hooks/useProjectDetail";
import useMemberStore from '../../member/store/useMemberStore';
import useConfirmStore from "../../member/store/useConfirmStore";
import ConfirmModal from "../../../components/ConfirmModal";

const ProjectMembersPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const id = Number(projectId);

  // 데이터 로딩 훅
  const { isLoading } = useProjectDetail(id);
  const { members, handleKick, handleDelegate } = useMembers(id);

  // 로그인 유저 및 권한 확인
  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");
  const isLeader = members.find(m => m.username === loginUsername)?.memberRole === "LEADER";

  // 팀장 위임 선택값 상태
  const [selectedDelegate, setSelectedDelegate] = useState("");

  // 전역 컨펌 스토어 (구조 분해 할당)
  const { isOpen, message, subMessage, onConfirm, onCancel, close, openConfirm } = useConfirmStore();

  /**
   * [퇴출] 버튼 클릭 핸들러
   * 스토어 순서: (message, onConfirm, onCancel, subMessage)
   */
  const onClickKick = (username: string, memberName: string) => {
    openConfirm(
      `${memberName}님을 퇴출하시겠습니까?`, // 1. message
      () => { handleKick(username); },       // 2. onConfirm
      undefined,                             // 3. onCancel
      "퇴출된 팀원은 초대 링크를 통해 다시 참여해야 합니다." // 4. subMessage
    );
  };

  /**
   * [팀장 위임] 확인 버튼 클릭 핸들러
   */
  const handleDelegateConfirm = () => {
    if (!selectedDelegate) return;
    
    const targetMember = members.find((m) => m.username === selectedDelegate);

    openConfirm(
      `${targetMember?.memberName}님에게 팀장을 위임하시겠습니까?`, // 1. message
      () => {                                                   // 2. onConfirm
        handleDelegate(selectedDelegate);
        setSelectedDelegate("");
      },
      undefined,                                                // 3. onCancel
      "위임 후에는 팀원 관리 권한이 상실됩니다."                     // 4. subMessage
    );
  };

  if (isLoading) return <div className="text-center mt-5">로딩 중...</div>;

  return (
    <>
      {/* 전역 컨펌 모달: 스토어 상태에 따라 렌더링 */}
      {isOpen && (
        <ConfirmModal
          message={message as string}
          subMessage={subMessage as string}
          onConfirm={() => {
            onConfirm?.();
            close();
          }}
          onCancel={() => {
            onCancel?.();
            close();
          }}
        />
      )}

      <div className="d-flex flex-column align-items-center container">
        <h3 className="fw-bold mb-4">
          {isLeader ? "팀원 관리" : "팀원 목록"}
        </h3>

        <div style={{ width: "380px" }}>
          {/* 팀원 목록 */}
          <div className="mb-4">
            <div className="text-muted small mb-2">팀원 목록</div>
            <table className="table text-center mb-0 border">
              <thead className="table-light">
                <tr>
                  <th>이름</th>
                  <th>역할</th>
                  {isLeader && <th>작업</th>}
                </tr>
              </thead>
              <tbody>
                {[...members]
                  .sort((a, b) => {
                    if (a.username === loginUsername) return -1;
                    if (b.username === loginUsername) return 1;
                    return 0;
                  })
                  .map((member) => (
                    <tr key={member.username} className="align-middle">
                      <td className="text-start ps-3">
                        {member.memberName}
                        <span className="text-muted small ms-1">(#{member.username})</span>
                        {member.username === loginUsername && <span className="text-muted small ms-1 text-primary">[나]</span>}
                      </td>
                      <td>
                        <span className={`badge ${member.memberRole === "LEADER" ? "bg-dark" : "bg-secondary"}`}>
                          {member.memberRole === "LEADER" ? "팀장" : "팀원"}
                        </span>
                      </td>
                      {isLeader && (
                        <td>
                          {member.username !== loginUsername && (
                            <button
                              className="btn btn-outline-danger btn-sm"
                              onClick={() => onClickKick(member.username, member.memberName)}
                            >
                              퇴출
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* 팀장 위임 섹션 (팀장 전용) */}
          {isLeader && (
            <div className="card p-3 mb-4 shadow-sm">
              <div className="text-muted small mb-2 fw-bold">팀장 권한 위임</div>
              <select
                className="form-select mb-3"
                value={selectedDelegate}
                onChange={(e) => setSelectedDelegate(e.target.value)}
              >
                <option value="">위임할 팀원 선택</option>
                {members
                  .filter((m) => m.memberRole === "TEAMMATE" && m.username !== loginUsername)
                  .map((m) => (
                    <option key={m.username} value={m.username}>
                      {m.memberName} (#{m.username})
                    </option>
                  ))}
              </select>

              <button
                className="btn btn-dark w-100"
                onClick={handleDelegateConfirm}
                disabled={!selectedDelegate}
              >
                위임 확인
              </button>
            </div>
          )}

          {/* 하단 이동 버튼 */}
          <button
            className="btn btn-outline-dark w-100 mt-4 p-2"
            onClick={() => navigate(`/projects/${id}/settings`)}
          >
            뒤로가기
          </button>
        </div>
      </div>
    </>
  );
};

export default ProjectMembersPage;