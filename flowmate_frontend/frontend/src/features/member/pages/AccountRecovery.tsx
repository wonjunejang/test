import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { EMAIL_PATTERN, isValidMemberInput } from "../memberValidator";
import Feedback from "../components/common/Feedback";
import { memberPostRequest } from "../../../lib/memberApi";
import { useLoading } from "../../../components/useLoading";
import Loading from "../../../components/Loading";
import { useNavigate } from "react-router-dom";
import useAlertStore from "../store/useAlertStore";
import AlertModal from "../../../components/AlertModal";


export default function AccountRecoveryPage() {
const nav = useNavigate();
const { isLoading, withLoading } = useLoading();

const [memberEmail, setMemberEmail] = useState("");
const [isEmailChecked, setIsEmailChecked] = useState(false);
const [showEmailVerify, setShowEmailVerify] = useState(false);
const [emailVerifyCode, setEmailVerifyCode] = useState("");
const [isEmailVerified, setIsEmailVerified] = useState(false);
const [verifyStatus, setVerifyStatus] = useState<string | null>(null);
const [emailStatus, setEmailStatus] = useState<string | null>(null);

// 재검토 모달
const [showReCheckModal, setShowReCheckModal] = useState(false);
// 완료 모달
const [showSuccessModal, setShowSuccessModal] = useState(false);

// 실시간 이메일 유효성
const emailFormatStatus = !memberEmail
? null
: isValidMemberInput(EMAIL_PATTERN, memberEmail)
? "ok"
: "올바른 이메일 형식이 아닙니다.";

// 이메일 변경 시 전부 초기화
const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setMemberEmail(e.target.value);
setIsEmailChecked(false);
setIsEmailVerified(false);
setShowEmailVerify(false);
setEmailVerifyCode("");
setVerifyStatus(null);
setEmailStatus(null);
};

// 모달
const { isOpen, message, onConfirm, close, openAlert } = useAlertStore();

// 1단계: 이메일 상태 확인 (탈퇴 계정 여부)
const handleEmailCheck = async () => {
if (emailFormatStatus !== "ok") return;
withLoading(async () => {
    const payLoad = { memberEmail };
    const path = "/member/find-userId";
    try {
    const response = await memberPostRequest(payLoad, path, null);

    console.log(response.data);

    if(response.data.memberStatus == "MACT") {
        return setShowReCheckModal(true);
    }

    if (response.status === 200) {
        setIsEmailChecked(true);
        setEmailStatus("탈퇴 처리된 계정입니다. 인증을 진행해주세요.");
    }
    } catch {
    // 탈퇴 계정이 아닌 경우 재검토 모달
    setShowReCheckModal(true);
    }
});
};

// 2단계: 인증번호 발송
const handleSendVerifyCode = async () => {
withLoading(async () => {
    const payLoad = { memberEmail, message : "계정 복구를", subject : "[인증번호] 계정복구를 위한 인증번호입니다" };
    const path = "/member/auth-email";
    try {
    const response = await memberPostRequest(payLoad, path, null);
    if (response.status === 200) {
        setShowEmailVerify(true);
        setEmailVerifyCode("");
        setVerifyStatus(null);
        // 모달 값 수정
        openAlert("해당 이메일에 인증번호가 성공적으로 보내졌습니다!");
    }
    } catch {}
});
};

// 3단계: 인증번호 확인
const handleVerifyConfirm = async () => {
if (!emailVerifyCode) return;
withLoading(async () => {
    const payLoad = { memberEmail, code: emailVerifyCode };
    const path = "/member/auth-code";
    try {
    const response = await memberPostRequest(payLoad, path, null);
    if (response.status === 200) {
        setIsEmailVerified(true);
        setVerifyStatus("ok");
    }
    } catch {
    setVerifyStatus("인증 코드가 다릅니다.");
    }
});
};

// 최종: 계정 복구
const handleSubmit = async () => {
if (!isEmailVerified) return;
withLoading(async () => {
    const payLoad = { memberEmail };
    const path = "/member/account-recovery";
    try {
    const response = await memberPostRequest(payLoad, path, null);
    if (response.status === 200) {
        setShowSuccessModal(true);
    }
    } catch {
        openAlert("계정 복구에 실패했습니다.");
    }
});
};

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
    <h1 className="text-center fw-bold mb-2" style={{ color: "#444", fontSize: "1.9rem" }}>
    계정 복구
    </h1>
    <p className="text-center text-muted mb-5" style={{ fontSize: "14px" }}>
    탈퇴한 계정의 이메일을 입력하여 복구를 진행하세요.
    </p>

    {/* 이메일 입력 + 상태 확인 */}
    <div className="mb-3">
    <label className="form-label fw-medium" style={{ fontSize: "14px" }}>이메일</label>
    <div className="input-group">
        <input
        type="email"
        className={`form-control ${
            isEmailChecked ? "is-valid" : emailFormatStatus === "ok" ? "" : emailFormatStatus ? "is-invalid" : ""
        }`}
        placeholder="이메일을 입력하세요."
        value={memberEmail}
        onChange={handleEmailChange}
        disabled={isEmailChecked}
        />
        <button
        className="btn btn-dark"
        type="button"
        disabled={emailFormatStatus !== "ok" || isEmailChecked}
        onClick={handleEmailCheck}
        style={{ fontSize: "13px" }}
        >
        상태 확인
        </button>
    </div>
    {isEmailChecked && (
        <Feedback status="ok" okMsg={emailStatus ?? ""} />
    )}
    {!isEmailChecked && (
        <Feedback status={emailFormatStatus} okMsg="올바른 이메일 형식입니다." />
    )}

    {/* 2단계: 인증번호 발송 버튼 */}
    {isEmailChecked && !isEmailVerified && (
        <button
        className="btn btn-outline-dark btn-sm w-100 mt-2"
        type="button"
        onClick={handleSendVerifyCode}
        >
        {showEmailVerify ? "인증번호 재발송" : "이메일 인증번호 발송"}
        </button>
    )}

    {/* 3단계: 인증번호 입력 */}
    {showEmailVerify && !isEmailVerified && (
        <div className="input-group mt-2">
        <input
            type="text"
            className={`form-control form-control-sm ${
            verifyStatus === "ok" ? "is-valid" : verifyStatus ? "is-invalid" : ""
            }`}
            placeholder="인증번호 입력"
            value={emailVerifyCode}
            onChange={(e) => { setEmailVerifyCode(e.target.value); setVerifyStatus(null); }}
            maxLength={6}
        />
        <button
            className="btn btn-outline-dark btn-sm"
            type="button"
            disabled={!emailVerifyCode}
            onClick={handleVerifyConfirm}
        >
            확인
        </button>
        </div>
    )}
    {showEmailVerify && (
        <Feedback status={verifyStatus} okMsg="인증이 완료되었습니다." />
    )}
    </div>

    <div className="my-5" />

    {/* 버튼 */}
    <div className="d-grid gap-3">
    <button
        className="btn btn-dark btn-lg fw-bold"
        onClick={handleSubmit}
        disabled={!isEmailVerified}
        style={{ borderRadius: "12px", padding: "17px", fontSize: "17px" }}
    >
        계정 복구
    </button>
    <button
        className="btn btn-lg"
        onClick={() => nav("/")}
        style={{ borderRadius: "12px", padding: "17px", fontSize: "17px", background: "#ebebeb", color: "#aaa", border: "none" }}
    >
        취소
    </button>
    </div>

    {/* 재검토 모달 */}
    {showReCheckModal && (
    <div
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center" }}
    >
        <div className="bg-white rounded-4 p-4 text-center" style={{ maxWidth: "360px", width: "90%" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⚠️</div>
        <h5 className="fw-bold mb-2" style={{ color: "#333" }}>계정 상태 확인 필요</h5>
        <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
            입력하신 이메일은 탈퇴 처리된 계정이 아닙니다.<br />이메일을 다시 확인해주세요.
        </p>
        <button
            className="btn btn-dark w-100"
            style={{ borderRadius: "10px", padding: "12px" }}
            onClick={() => setShowReCheckModal(false)}
        >
            확인
        </button>
        </div>
    </div>
    )}

    {/* 완료 모달 */}
    {showSuccessModal && (
    <div
        style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.5)", zIndex: 999, display: "flex", justifyContent: "center", alignItems: "center" }}
    >
        <div className="bg-white rounded-4 p-4 text-center" style={{ maxWidth: "360px", width: "90%" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>✅</div>
        <h5 className="fw-bold mb-2" style={{ color: "#333" }}>계정 복구 완료</h5>
        <p className="text-muted mb-4" style={{ fontSize: "14px" }}>
            계정이 성공적으로 복구되었습니다.<br />로그인 페이지로 이동합니다.
        </p>
        <button
            className="btn btn-dark w-100"
            style={{ borderRadius: "10px", padding: "12px" }}
            onClick={() => nav("/")}
        >
            로그인 하러 가기
        </button>
        </div>
    </div>
    )}
</div>
    </>
);
}