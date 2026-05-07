import { useParams, useNavigate } from "react-router-dom";
import { useProjectDetail } from "../hooks/useProjectDetail";
import InviteLinkButton from "../components/InviteLinkButton";
import { useProjectDelete } from "../hooks/useProjectDelete";
import { useMembers } from "../hooks/useMembers";
import useMemberStore from "../../member/store/useMemberStore";
import useConfirmStore from "../../member/store/useConfirmStore"; // 전역 스토어 추가
import ConfirmModal from "../../../components/ConfirmModal";
import { useEffect } from "react";
import useAlertStore from "../../member/store/useAlertStore";
import AlertModal from "../../../components/AlertModal";

const ProjectSettingsPage = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const id = Number(projectId);

  // 데이터 및 권한 관련 훅
  const { 
    currentProject, 
    isLoading, 
    showKickedModal, 
    handleKickedConfirm, 
    showUnauthorizedModal, 
    handleUnauthorizedConfirm 
  } = useProjectDetail(id);
  
  const { handleLeave } = useMembers(id);
  const { handleDeleteConfirm, isLoading: deleteLoading } = useProjectDelete(id);

  // 전역 컨펌 스토어 추출
  const { isOpen, message, subMessage, onConfirm, onCancel, close, openConfirm } = useConfirmStore();
    // 모달
  const { 
  isOpen: isAlertOpen, 
  message: alertMessage, 
  onConfirm: onAlertConfirm, 
  close: closeAlert, 
} = useAlertStore();

  const loginUsername = useMemberStore((state) => state.memberInfo?.username ?? "");
  const isLeader = currentProject?.leaderUsername === loginUsername;

  /**
   * [프로젝트 삭제] - 스토어 순서: (message, onConfirm, onCancel, subMessage)
   */
  const onClickDelete = () => {
    openConfirm(
      "프로젝트 삭제", // message
      () => { handleDeleteConfirm(); }, // onConfirm
      undefined, // onCancel
      "정말로 프로젝트를 삭제하시겠습니까? 삭제된 데이터는 복구할 수 없습니다." // subMessage
    );
  };

  /**
   * [프로젝트 퇴장]
   */
  const onClickLeave = () => {
    openConfirm(
      "프로젝트 퇴장", // message
      () => { handleLeave(); }, // onConfirm
      undefined, // onCancel
      "정말로 프로젝트를 퇴장하시겠습니까?" // subMessage
    );
  };

    useEffect(() => {
    if (showKickedModal) {
      openConfirm(
        "프로젝트 퇴출",
        handleKickedConfirm,
        handleKickedConfirm, // 취소 버튼 눌러도 확인과 동일하게 처리
        "프로젝트에서 퇴출당했습니다."
      );
    }
  }, [showKickedModal]);

  useEffect(() => {
    if (showUnauthorizedModal) {
      openConfirm(
        "접근 불가",
        handleUnauthorizedConfirm,
        handleUnauthorizedConfirm,
        "허가되지 않은 사용자입니다."
      );
    }
}, [showUnauthorizedModal]);

  if (isLoading || !currentProject || currentProject.projectId !== id) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="spinner-border text-secondary" role="status" />
      </div>
    );
  }

  return (
    <>
      {/* 1. 전역 스토어용 컨펌 모달 (중심 안전장치) */}
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

      {isAlertOpen && (<AlertModal message={alertMessage} onConfirm={() => { onAlertConfirm?.(); closeAlert(); }} /> )}

      <div className="d-flex flex-column align-items-center justify-content-center" style={{ paddingTop: "100px" }}>
        <h3 className="fw-bold mb-4">프로젝트 설정</h3>

        <div style={{ width: "300px" }}>
          {isLeader ? (
            <>
              <button className="btn btn-outline-secondary p-2 w-100 mb-3" onClick={() => navigate(`/projects/${id}/edit`)}>
                프로젝트 수정
              </button>
              <button className="btn btn-outline-secondary p-2 w-100 mb-3" onClick={() => navigate(`/projects/${id}/members`)}>
                팀원 관리
              </button>
              
              <div className="d-flex align-items-center justify-content-between mb-5">
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>프로젝트 초대 링크</span>
                <InviteLinkButton tokenUrl={currentProject.projectTokenUrl} />
              </div>

              <button className="btn btn-secondary p-2 w-100 mb-2" onClick={() => navigate(`/projects/${id}`)}>
                돌아가기
              </button>
              <button className="btn btn-danger p-2 w-100" onClick={onClickDelete} disabled={deleteLoading}>
                {deleteLoading ? "삭제 중..." : "프로젝트 삭제"}
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-outline-secondary p-2 w-100 mb-3" onClick={() => navigate(`/projects/${id}/members`)}>
                팀원 목록
              </button>
              
              <div className="d-flex align-items-center justify-content-between mb-5">
                <span className="text-muted" style={{ fontSize: "0.9rem" }}>프로젝트 초대 링크</span>
                <InviteLinkButton tokenUrl={currentProject.projectTokenUrl} />
              </div>

              <button className="btn btn-secondary p-2 w-100 mb-2" onClick={() => navigate(`/projects/${id}`)}>
                돌아가기
              </button>
              <button className="btn btn-danger p-2 w-100" onClick={onClickLeave}>
                프로젝트 퇴장
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default ProjectSettingsPage;