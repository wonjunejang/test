import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { EMAIL_PATTERN, isValidMemberInput } from "../memberValidator";
import Feedback from "../components/common/Feedback";
import { memberPostRequest, memberPostRequestInstance } from "../../../lib/memberApi";
import { useLoading } from "../../../components/useLoading";
import Loading from "../../../components/Loading";
import { useNavigate } from "react-router-dom";
import useMemberStore from "../store/useMemberStore";
import { type Member } from "../memberType";
import useAlertStore from "../store/useAlertStore";
import AlertModal from "../../../components/AlertModal";


export default function ChangeEmailPage() {
const nav = useNavigate();
const setmemberInfo = useMemberStore((state) => state.setMemberInfo); 
const memberInfo = useMemberStore((state) => state.memberInfo); 
const { isLoading, withLoading } = useLoading();

const [memberEmail, setMemberEmail] = useState("");
const [isEmailChecked, setIsEmailChecked] = useState(false);
const [showEmailVerify, setShowEmailVerify] = useState(false);
const [emailVerifyCode, setEmailVerifyCode] = useState("");
const [isEmailVerified, setIsEmailVerified] = useState(false);
const [verifyStatus, setVerifyStatus] = useState<string | null>(null);

// 실시간 이메일 유효성
const emailStatus = !memberEmail
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
};

// 이메일 중복확인
const handleEmailDupCheck = async () => {
if (emailStatus !== "ok") return;
withLoading(async () => {
    const payLoad = { memberEmail, message : "이메일 변경을" };
    const path = "/member/check-email";
    try {
    const response = await memberPostRequestInstance(payLoad, path, null);
    if (response.status === 200) {
        setIsEmailChecked(true);
        setIsEmailVerified(false);
        setShowEmailVerify(false);
        setEmailVerifyCode("");
        setVerifyStatus(null);
        openAlert("사용 가능한 이메일 입니다.");
    }
    } catch {
    openAlert("이미 사용중인 이메일 입니다.");
    }
});
};

// 인증번호 발송
const handleSendVerifyCode = async () => {
withLoading(async () => {
    const payLoad = { memberEmail , message : "이메일 변경 인증 코드를", subject : "[인증번호] 이메일 변경을 위한 인증번호입니다"};
    const path = "/member/auth-email";
    try {
    const response = await memberPostRequestInstance(payLoad, path, null);
    if (response.status === 200) {
        setShowEmailVerify(true);
        setEmailVerifyCode("");
        setVerifyStatus(null);
        openAlert("해당 이메일에 인증번호가 성공적으로 보내졌습니다!");
    }
    } catch {
        openAlert("해당 이메일에 인증번호 보내기 실패!!");
    }
});
};

// 인증번호 확인
const handleVerifyConfirm = async () => {
if (!emailVerifyCode) return;
withLoading(async () => {
    const payLoad = { memberEmail, code: emailVerifyCode };
    const path = "/member/auth-code";
    try {
    const response = await memberPostRequestInstance(payLoad, path, null);
    if (response.status === 200) {
        setIsEmailVerified(true);
        openAlert("인증 성공");
    }
    } catch {
    openAlert("인증 코드가 다릅니다!");
    }
});
};

// 최종 이메일 변경
const handleSubmit = async () => {
if (!isEmailVerified) return;
withLoading(async () => {
    const payLoad = { memberEmail, username : memberInfo?.username };
    const path = "/member/change-email";
    // console.log(memberInfo?.username, memberEmail);
    try {
    const response = await memberPostRequestInstance( payLoad as Member, path, null );
    if (response.status === 200) {
        openAlert("이메일이 변경되었습니다.");

        // 이메일 변경 로직 후 setmemberInfo도 바꿔줘야됨 (바뀐 멤버 리턴해줘야됨)
        setmemberInfo(response.data);

        nav("/mypage");
    }
    } catch {
    openAlert("이메일 변경에 실패했습니다.");
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
<div style={{ maxWidth: "520px", margin: "0 auto", padding: "3rem 2rem" }}>
    {isLoading && <Loading />}

    {/* 타이틀 */}
    <h1 className="text-center fw-bold mb-5" style={{ color: "#444", fontSize: "1.9rem" }}>
    이메일 변경
    </h1>

    {/* 이메일 입력 + 중복확인 */}
    <div className="mb-3">
    <label className="form-label fw-medium" style={{ fontSize: "14px" }}>
        새로운 이메일 주소
    </label>
    <div className="input-group">
        <input
        type="email"
        className={`form-control ${
            isEmailVerified ? "is-valid" : emailStatus === "ok" ? "" : emailStatus ? "is-invalid" : ""
        }`}
        placeholder="새 이메일 주소를 입력하세요."
        value={memberEmail}
        onChange={handleEmailChange}
        disabled={isEmailChecked}
        />
        <button
        className="btn btn-outline-secondary"
        type="button"
        disabled={emailStatus !== "ok" || isEmailChecked}
        onClick={handleEmailDupCheck}
        style={{ fontSize: "13px" }}
        >
        중복확인
        </button>
    </div>
    <Feedback
        status={isEmailVerified ? "ok" : emailStatus}
        okMsg="사용 가능한 이메일 형식 입니다."
    />

    {/* 인증번호 발송 버튼 */}
    {isEmailChecked && !isEmailVerified && (
        <button
        className="btn btn-outline-primary btn-sm w-100 mt-2"
        type="button"
        onClick={handleSendVerifyCode}
        >
        {showEmailVerify ? "인증번호 재발송" : "이메일 인증번호 발송"}
        </button>
    )}

    {/* 인증번호 입력 */}
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
            className="btn btn-outline-primary btn-sm"
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

    <div style={{ height: "60px" }} />

    {/* 버튼 */}
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
    <button
        onClick={handleSubmit}
        disabled={!isEmailVerified}
        style={{
        width: "100%",
        padding: "17px",
        background: "#2c2c2c",
        color: "#fff",
        fontSize: "17px",
        fontWeight: 700,
        border: "none",
        borderRadius: "12px",
        cursor: isEmailVerified ? "pointer" : "not-allowed",
        opacity: isEmailVerified ? 1 : 0.4,
        }}
    >
        이메일 변경
    </button>
    <button
        onClick={() => nav(-1)}
        style={{
        width: "100%",
        padding: "17px",
        background: "#ebebeb",
        color: "#aaa",
        fontSize: "17px",
        border: "none",
        borderRadius: "12px",
        cursor: "pointer",
        }}
    >
        취소
    </button>
    </div>
</div>
    </>
);
}