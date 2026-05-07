import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { PASSWORD_PATTERN, isValidMemberInput } from "../memberValidator";
import Feedback from "../components/common/Feedback";
import ShowPassword from "../components/ShowPassword";
import { usePasswordToggle } from "../hooks/usePasswordToggle";
import { memberPostRequest, memberPostRequestInstance } from "../../../lib/memberApi";
import { useLoading } from "../../../components/useLoading";
import Loading from "../../../components/Loading";
import { useNavigate } from "react-router-dom";
import useMemberStore from "../store/useMemberStore";
import { type Member } from "../memberType";
import useAlertStore from "../store/useAlertStore";
import AlertModal from "../../../components/AlertModal";


export default function ChangePasswordPage() {
const memberInfo = useMemberStore((state) => state.memberInfo);

    const nav = useNavigate();
const { isLoading, withLoading } = useLoading();

const [currentPassword, setCurrentPassword] = useState("");
const [newPassword, setNewPassword] = useState("");
const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

const [isVisible1, toggle1] = usePasswordToggle();
const [isVisible2, toggle2] = usePasswordToggle();
const [isVisible3, toggle3] = usePasswordToggle();

// 실시간 유효성
const newPasswordStatus = !newPassword
? null
: isValidMemberInput(PASSWORD_PATTERN, newPassword)
? "ok"
: "대소문자·숫자·특수문자(@$!%*?&) 조합 8~20자";

const passwordMatch = !newPasswordConfirm
? null
: newPassword === newPasswordConfirm
? "ok"
: "비밀번호가 일치하지 않습니다.";

const canSubmit =
currentPassword.trim() !== "" &&
newPasswordStatus === "ok" &&
passwordMatch === "ok";

const handleSubmit = async () => {
if (!canSubmit) return;
withLoading(async () => {
    // 로직
    // 1. 입력 받은 현재 비밀번호와 username을 넘겨서 해당 비밀번호가 맞는지 확인한다.
    // 2. 맞다면 비밀번호 변경 진행
    // 3. 틀리면 틀리지 않음 모달 보여주기
    const checkPasswordPayLoad = { username : memberInfo?.username , password : currentPassword }
    const checkPasswordPath = "/member/check-password";
    const payLoad = { username : memberInfo?.username ,password : newPassword };
    const path = "/member/change-password";
    try {
        const checkPasswordResponse = await memberPostRequestInstance(checkPasswordPayLoad as Member, checkPasswordPath, null);
    if (checkPasswordResponse.status === 200) {
        openAlert("비밀번호가 변경되었습니다.");

        await memberPostRequestInstance(payLoad as Member, path, null);

        nav("/mypage");
    }
    } catch {
    openAlert("현재 비밀번호가 올바르지 않습니다.");
    }
});
};

// 모달
const { isOpen, message, onConfirm, close, openAlert } = useAlertStore();

return (
    <>
    {isOpen && (
                <AlertModal
                    message={message}
                    onConfirm={() => {
                        onConfirm?.();
                        close();
                    }}
                />
            )}
<div className="container" style={{ maxWidth: "520px" }}>
    {isLoading && <Loading />}

    {/* 타이틀 */}
    <h1 className="text-center fw-bold mb-5" style={{ color: "#444", fontSize: "1.9rem" }}>
    비밀번호 변경
    </h1>

    {/* 현재 비밀번호 */}
    <div className="mb-3">
    <label className="form-label fw-medium" style={{ fontSize: "14px" }}>
        현재 비밀번호
    </label>
    <div className="position-relative">
        <input
        type={isVisible1 ? "text" : "password"}
        className="form-control pe-5"
        placeholder="현재 비밀번호를 입력하세요."
        value={currentPassword}
        onChange={(e) => setCurrentPassword(e.target.value)}
        />
        <ShowPassword isVisible={isVisible1} toggleVisible={toggle1} />
    </div>
    </div>

    {/* 새 비밀번호 */}
    <div className="mb-3">
    <label className="form-label fw-medium" style={{ fontSize: "14px" }}>
        새 비밀번호
    </label>
    <div className="position-relative">
        <input
        type={isVisible2 ? "text" : "password"}
        className={`form-control pe-5 ${
            newPasswordStatus === "ok" ? "is-valid" : newPasswordStatus ? "is-invalid" : ""
        }`}
        placeholder="새 비밀번호를 입력하세요."
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}
        />
        <ShowPassword isVisible={isVisible2} toggleVisible={toggle2} />
    </div>
    <Feedback status={newPasswordStatus} okMsg="사용 가능한 비밀번호 형식 입니다." />
    </div>

    {/* 새 비밀번호 확인 */}
    <div className="mb-3">
    <label className="form-label fw-medium" style={{ fontSize: "14px" }}>
        새 비밀번호 확인
    </label>
    <div className="position-relative">
        <input
        type={isVisible3 ? "text" : "password"}
        className={`form-control pe-5 ${
            passwordMatch === "ok" ? "is-valid" : passwordMatch ? "is-invalid" : ""
        }`}
        placeholder="새 비밀번호를 입력하세요."
        value={newPasswordConfirm}
        onChange={(e) => setNewPasswordConfirm(e.target.value)}
        />
        <ShowPassword isVisible={isVisible3} toggleVisible={toggle3} />
    </div>
    <Feedback status={passwordMatch} okMsg="비밀번호가 일치합니다." />
    </div>

    <div className="my-5" />

    {/* 버튼 */}
    <div className="d-grid gap-3">
    <button
        className="btn btn-dark btn-lg fw-bold"
        onClick={handleSubmit}
        disabled={!canSubmit}
        style={{ borderRadius: "12px", padding: "17px", fontSize: "17px" }}
    >
        비밀번호 변경
    </button>
    <button
        className="btn btn-lg"
        onClick={() => nav(-1)}
        style={{ borderRadius: "12px", padding: "17px", fontSize: "17px", background: "#ebebeb", color: "#aaa", border: "none" }}
    >
        취소
    </button>
    </div>
</div>
</>
);
}