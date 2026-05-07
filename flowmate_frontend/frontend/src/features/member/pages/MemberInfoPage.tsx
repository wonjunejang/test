import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import useMemberStore from "../store/useMemberStore";
import { memberPostRequest, memberPostRequestInstance } from "../../../lib/memberApi";
import useProjectMemberStore from "../store/useProjectMemberStore";
import type { Member } from "../memberType";
import useAlertStore from "../store/useAlertStore";
import AlertModal from "../../../components/AlertModal";
import { useLoading } from "../../../components/useLoading";
import Loading from "../../../components/Loading";
import { useProjectStore } from "../../project";

export default function MemberInfo() {
  const memberInfo = useMemberStore((state) => state.memberInfo);
  const clearMemberInfo = useMemberStore((state) => state.clearMemberInfo);
  const clearProjectMemberInfo = useProjectMemberStore((state) => state.clearProjectMembers);
  const projectMembers = useProjectMemberStore(state => state.projectMembers);
  const {reset} = useProjectStore();
  const nav = useNavigate();
  const { isLoading, withLoading } = useLoading();

  const onLogout = async () => {
    const payLoad = {};
    const path = "/member/logout";
    const auth = { withCredentials: true };
    
    withLoading(async() => {
      await memberPostRequestInstance( payLoad, path, auth);

      clearMemberInfo();
      clearProjectMemberInfo();
      reset(); // useProjectsStore clear
      sessionStorage.clear();

      nav("/");
    })
  }

  const deactivate = async () => {
    const payLoad = {username : memberInfo?.username};
    const path = "/member/deactivate";
    withLoading( async () => {
      try {
      if(projectMembers.length != 0) {
        openAlert("모든 프로젝트 탈퇴를 진행해주세요!");
        return;
      }

      const response = await memberPostRequestInstance(payLoad as Member, path , null);

      if(response.status == 200) {
        openAlert("계정 삭제 완료!");

      clearMemberInfo();
      clearProjectMemberInfo();
      reset(); // useProjectStore 리셋
      sessionStorage.clear();

        nav("/");
      }
    } catch {
      openAlert("계정 삭제 실패!");
    }
    })
  }
  // 모달
const { isOpen, message, onConfirm, close, openAlert } = useAlertStore();
  return (
    <>
    {isLoading && <Loading />}
    {isOpen && (
        <AlertModal
            message={message}
            onConfirm={() => {
                onConfirm?.();
                close();
            }}
        />
    )}
    <div className="container" style={{ maxWidth: "600px" }}>

      {/* 타이틀 */}
      <h1 className="text-center fw-bold mb-5" style={{ color: "#333", fontSize: "2.2rem" }}>
        회원정보
      </h1>

      {/* 정보 카드 */}
      <div className="rounded-4 py-2 px-4 mb-4" style={{ border: "1.5px solid #ddd" }}>

        {/* 이름 */}
        <div className="d-flex align-items-center py-3 border-bottom">
          <span className="fw-bold" style={{ minWidth: "70px", color: "#333" }}>이름</span>
          <span style={{ color: "#333" }}>{memberInfo?.memberName}</span>
        </div>

        {/* 아이디 */}
        <div className="d-flex align-items-center py-3 border-bottom">
          <span className="fw-bold" style={{ minWidth: "70px", color: "#333" }}>아이디</span>
          <span style={{ color: "#333" }}>{memberInfo?.username}</span>
        </div>

        {/* 이메일 */}
        <div className="d-flex align-items-center py-3">
          <span className="fw-bold" style={{ minWidth: "70px", color: "#333" }}>이메일</span>
          <span className="fw-bold me-auto" style={{ color: "#333" }}>{memberInfo?.memberEmail}</span>
          <Link
            to="/changeemail"
            className="btn btn-sm btn-outline-secondary ms-auto"
            style={{ borderRadius: "8px", fontSize: "13px" }}
          >
            이메일 변경
          </Link>
        </div>
      </div>

      {/* 정보 수정 */}
      <div className="mt-4">
        <div className="d-flex align-items-center mb-2">
          <span className="me-2">⚙️</span>
          <span className="fw-bold" style={{ color: "#333", fontSize: "16px" }}>정보 수정</span>
        </div>
        <div className="d-flex flex-column ms-4 gap-2">
          <Link
            to="/changepassword"
            className="text-muted"
            style={{ fontSize: "14px", cursor: "pointer" }}
          >
            비밀번호 변경
          </Link>
          <span
            className="text-muted"
            style={{ fontSize: "14px", cursor: "pointer" }}
            onClick={() => onLogout()}
          >
            로그아웃
          </span>
          <span
            className="text-muted"
            style={{ fontSize: "14px", cursor: "pointer" }}
            onClick={() => deactivate()}
          >
            회원탈퇴
          </span>
        </div>
      </div>
    </div>
    </>
  );
}