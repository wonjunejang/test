import React, { useState, useMemo } from 'react';
import { AGREEMENT_LIST } from '../terms';
import { USERNAME_PATTERN, EMAIL_PATTERN, PASSWORD_PATTERN,isValidMemberInput } from '../memberValidator';
import ShowPassword from '../components/ShowPassword';
import { usePasswordToggle } from '../hooks/usePasswordToggle';
import Feedback from '../components/common/Feedback';
import { memberPostRequest } from '../../../lib/memberApi';
import { useLoading } from '../../../components/useLoading';
import Loading from '../../../components/Loading';
import { Link, useNavigate } from 'react-router-dom';
import "../member.css";
import AlertModal from '../../../components/AlertModal';
import useAlertStore from '../store/useAlertStore';

export default function SignPage() {
    const nav = useNavigate();
    // 로딩 상태
    const {isLoading, withLoading }= useLoading();

    // ── 폼 상태 ───────────────────────────────────────────────────
    const [username,        setUsername]        = useState("");
    const [memberName,      setMemberName]      = useState("");
    const [memberEmail,     setMemberEmail]     = useState("");
    const [password,        setPassword]        = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
 
    const [isIdChecked,    setIsIdChecked]    = useState(false);
    const [isEmailChecked, setIsEmailChecked] = useState(false); // 중복확인 통과 여부
 
    const [isVisible,  toggle]  = usePasswordToggle();
    const [isVisible2, toggle2] = usePasswordToggle();
 
    // ── 이메일 인증 상태 ──────────────────────────────────────────
    const [showEmailVerify, setShowEmailVerify] = useState(false); // 인증번호 입력칸 표시
    const [emailVerifyCode, setEmailVerifyCode] = useState("");
    const [isEmailVerified, setIsEmailVerified] = useState(false); // 인증 최종 완료
    const [verifyStatus,    setVerifyStatus]    = useState<string | null>(null);
 
    // ── 약관 상태 ─────────────────────────────────────────────────
    const [checks,     setChecks]     = useState(
        Object.fromEntries(AGREEMENT_LIST.map((item) => [item.id, false]))
    );
    const [expandedId, setExpandedId] = useState<string | null>(null);
 
    // ── 실시간 유효성 ─────────────────────────────────────────────
    const usernameStatus = !username
        ? null
        : isValidMemberInput(USERNAME_PATTERN, username)
        ? "ok"
        : "소문자·숫자 조합 6~20자, 소문자 필수";
 
    const emailStatus = !memberEmail
        ? null
        : isValidMemberInput(EMAIL_PATTERN, memberEmail)
        ? "ok"
        : "올바른 이메일 형식이 아닙니다.";
 
    const passwordStatus = !password
        ? null
        : isValidMemberInput(PASSWORD_PATTERN, password)
        ? "ok"
        : "대소문자·숫자·특수문자(@$!%*?&) 조합 8~20자";
 
    const passwordMatch = !passwordConfirm
        ? null
        : password === passwordConfirm
        ? "ok"
        : "비밀번호가 일치하지 않습니다.";
 
    // ── 핸들러 ────────────────────────────────────────────────────
    const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUsername(e.target.value);
        setIsIdChecked(false);
    };
 
    // 이메일 변경 시 중복확인 + 인증 전부 초기화
    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMemberEmail(e.target.value);
        setIsEmailChecked(false);
        setIsEmailVerified(false);
        setShowEmailVerify(false);
        setEmailVerifyCode("");
        setVerifyStatus(null);
    };
 
    // 아이디 중복 체크 (테스트 o, alert -> 모달 바꾸기 x)
    const handleIdCheck = async () => {
        if (usernameStatus !== "ok") return;
        const payLoad = { username : username }
        const path = "/member/check-username"
 
        try {
            const response = await memberPostRequest(payLoad, path, null);
            if(response.status == 200) {
                setIsIdChecked(true);
                openAlert(`"${username}" 사용 가능한 아이디입니다.`);
            }
        } catch {
            openAlert(`"${username}" 이미 사용중인 아이디입니다.`);
        }
    };
 
    // 1단계: 이메일 중복확인 → 통과 시 인증번호 발송 버튼 표시 (테스트 o, alert -> 모달 바꾸기 x)
    const handleEmailDupCheck = async () => {
        if (emailStatus !== "ok") return;
        withLoading(async () => {
            // TODO: API 호출로 중복확인 , username, memberEmail
            const payLoad = { memberEmail : memberEmail }
            const path = "/member/check-email";
            let response = null;

            try {
                response = await memberPostRequest(payLoad, path, null);
                
                if(response.status == 200) {
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
        })
        

    };
 

    const handleSendVerifyCode =  async () => {
        withLoading(async () => {
            const payLoad = { memberEmail : memberEmail , subject : "[인증번호] 회원가입을 위한 인증번호입니다"};
            const path = "/member/auth-email";
            let response = null;
            try {
                response = await memberPostRequest(payLoad, path, null);
                if(response.status == 200) {
                    setShowEmailVerify(true);
                    setEmailVerifyCode("");
                    setVerifyStatus(null);
                    openAlert("해당 이메일에 인증번호가 성공적으로 보내졌습니다!");
                }
            } catch {
            }
        });

    };
 
    const handleVerifyConfirm = async () => {
        if (!emailVerifyCode) return;
        withLoading(async () => {
            const payLoad = { memberEmail : memberEmail , code : emailVerifyCode };
            const path = "/member/auth-code";
            let response = null;
            try {
                response = await memberPostRequest(payLoad, path, null);
                if(response.status == 200) {
                    setIsEmailVerified(true);
                    openAlert("인증 성공");
                }
            } catch {
                openAlert("인증 코드가 다릅니다!");
            }
        });

    };
 
    // ─ 약관 핸들러 ─
    const allChecked = useMemo(
        () => AGREEMENT_LIST.every((item) => checks[item.id]), [checks]
    );
    const allRequiredChecked = useMemo(
        () => AGREEMENT_LIST.filter((i) => i.required).every((i) => checks[i.id]), [checks]
    );
    const handleAllChange = () => {
        const next = !allChecked;
        setChecks(Object.fromEntries(AGREEMENT_LIST.map((i) => [i.id, next])));
    };
    const handleCheck  = (id: string) => setChecks((prev) => ({ ...prev, [id]: !prev[id] }));
    const handleToggle = (id: string) => setExpandedId((prev) => (prev === id ? null : id));
 
    // ─ 제출 가능 여부 ─
    const canSubmit =
        isIdChecked &&
        memberName.trim() !== "" &&
        isEmailVerified &&
        passwordStatus === "ok" &&
        passwordMatch  === "ok" &&
        allRequiredChecked;
 
    const handleSubmit = () => {
        withLoading(async () => {
            const payLoad = {
            username,
            password,
            memberName,
            memberEmail,
            marketingAgreeYN: checks["marketing-term"] ? "Y" : "N",
            memberStatus : "MACT"
            };
            const path = "/member/sign"
            let response = null;

            try {
                response = await memberPostRequest(payLoad, path, null);
                if(response.status == 200) {
                    openAlert("가입 완료!");
                    nav("/");
                }
            } catch {
                openAlert("회원가입 에러?");
            }


        })
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
            {isLoading && <Loading />}
            <div className="container d-flex justify-content-center align-items-start">
                <div className="w-100" style={{ maxWidth: '400px' }}>
                    <h1 className="fw-bold text-center mb-5" style={{ color: '#333'}}>회원가입</h1>
                    {/* 아이디 */}
                    <div className="mb-3">
                        <div className="position-relative">
                            <input
                                type="text"
                                className={`form-control form-control-lg py-3 ${
                                    isIdChecked ? "is-valid" : usernameStatus === "ok" ? "" : usernameStatus ? "is-invalid" : ""
                                }`}
                                placeholder="아이디"
                                value={username}
                                onChange={handleUsernameChange}
                                style={{ fontSize: '1rem', borderRadius: '10px' }}
                            />
                            <button
                                className="btn fw-bold position-absolute top-50 end-0 translate-middle-y me-2"
                                type="button"
                                disabled={usernameStatus !== "ok"}
                                onClick={handleIdCheck}
                                style={{ fontSize: '0.8rem', backgroundColor: '#eaeaea', color: '#333', border: 'none', borderRadius: '8px' }}
                            >
                                중복확인
                            </button>
                        </div>
                        <Feedback
                            status={isIdChecked ? "ok" : usernameStatus}
                            okMsg={isIdChecked ? "사용 가능한 아이디 입니다." : "사용 가능한 형식입니다."}
                        />
                    </div>
 
                    {/* 이름 */}
                     <div className="mb-3">
                        <input
                            type="text"
                            className="form-control form-control-lg py-3"
                            placeholder="이름"
                            style={{ fontSize: '1rem', borderRadius: '10px' }}
                            value={memberName}
                            onChange={(e) => setMemberName(e.target.value)}
                        />
                    </div>
 
                    {/* 이메일 */}
                    <div className="mb-3"> 
                        {/* 1단계: 이메일 입력 + 중복확인 */}
                        <div className="position-relative">
                            <input
                                type="email"
                                className={`form-control form-control-lg py-3 ${
                                    isEmailVerified ? "is-valid" : emailStatus === "ok" ? "" : emailStatus ? "is-invalid" : ""
                                }`}
                                placeholder="이메일"
                                value={memberEmail}
                                onChange={handleEmailChange}
                                disabled={isEmailChecked} // 중복확인 후 수정 못하게
                                style={{ fontSize: '1rem', borderRadius: '10px' }}
                            />
                            <button
                                className="btn fw-bold position-absolute top-50 end-0 translate-middle-y me-2"
                                type="button"
                                disabled={emailStatus !== "ok" || isEmailChecked}
                                onClick={handleEmailDupCheck}
                                style={{ fontSize: '0.8rem', backgroundColor: '#eaeaea', color: '#333', border: 'none', borderRadius: '8px' }}
                            >
                                중복확인
                            </button>
                        </div>
                        <Feedback
                            status={isEmailVerified ? "ok" : emailStatus}
                            okMsg="사용 가능한 이메일 입니다."
                        />
 
                        {/* 인증번호 발송 버튼 */}
                        {isEmailChecked && !isEmailVerified && (
                            <button
                                className="btn py-3 fw-bold w-100 mt-2"
                                type="button"
                                onClick={handleSendVerifyCode}
                                style={{ backgroundColor: '#eaeaea', color: '#333', borderRadius: '12px', border: 'none' }}
                            >
                                {showEmailVerify ? "인증번호 재발송" : "이메일 인증번호 발송"}
                            </button>
                        )}
 
                        {/* 인증번호 입력칸 */}
                        {showEmailVerify && !isEmailVerified && (
                            <div className="input-group mt-2">
                                <input
                                    type="text"
                                    className={`form-control form-control-lg py-3 ${
                                        verifyStatus === "ok" ? "is-valid" : verifyStatus ? "is-invalid" : ""
                                    }`}
                                    placeholder="인증번호 입력"
                                    value={emailVerifyCode}
                                    onChange={(e) => { setEmailVerifyCode(e.target.value); setVerifyStatus(null); }}
                                    maxLength={6}
                                    style={{ fontSize: '1rem', borderRadius: '10px' }}
                                />
                                <button
                                    className="btn fw-bold"
                                    type="button"
                                    disabled={!emailVerifyCode}
                                    onClick={handleVerifyConfirm}
                                    style={{ backgroundColor: '#333', color: '#fff', border: 'none' }}
                                >
                                    확인
                                </button>
                            </div>
                        )}
                        {showEmailVerify && (
                            <Feedback status={verifyStatus} okMsg="인증이 완료되었습니다." />
                        )}
                    </div>
 
                    {/* 비밀번호 */}
                    <div className="mb-3">
                        <div className="position-relative">
                            <input
                                type={isVisible ? "text" : "password"}
                                className={`form-control form-control-lg py-3 pe-5 ${
                                    passwordStatus === "ok" ? "is-valid" : passwordStatus ? "is-invalid" : ""
                                }`}
                                placeholder="비밀번호(영문, 특수문자, 숫자 2개 조합 8자 이상)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ fontSize: '1rem', borderRadius: '10px' }}
                            />
                            <ShowPassword isVisible={isVisible} toggleVisible={toggle} />
                        </div>
                        <Feedback status={passwordStatus} okMsg="사용 가능한 비밀번호 입니다." />
                    </div>
 
                    {/* 비밀번호 확인 */}
                    <div className="mb-4">
                        <div className="position-relative">
                            <input
                                type={isVisible2 ? "text" : "password"}
                                className={`form-control form-control-lg py-3 pe-5 ${
                                    passwordMatch === "ok" ? "is-valid" : passwordMatch ? "is-invalid" : ""
                                }`}
                                placeholder="비밀번호 확인"
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                style={{ fontSize: '1rem', borderRadius: '10px' }}
                            />
                            <ShowPassword isVisible={isVisible2} toggleVisible={toggle2} />
                        </div>
                        <Feedback status={passwordMatch} okMsg="비밀번호가 일치합니다." />
                    </div>
 
                    {/* 전체 동의 */}
                    <div className={`form-check rounded p-3 mb-2 border ${allChecked ? "bg-primary bg-opacity-10 border-primary" : "bg-light"}`}>
                        <input className="form-check-input" type="checkbox" id="agree-all" checked={allChecked} onChange={handleAllChange} />
                        <label className="form-check-label fw-semibold small" htmlFor="agree-all">전체 동의하기</label>
                    </div>
 
                    {/* 약관 항목 */}
                    <div className="ps-1" style={{marginBottom: "50px"}}>
                        {AGREEMENT_LIST.map((item) => (
                            <div key={item.id} className="border-bottom">
                                <div className="d-flex justify-content-between align-items-center p-2">
                                    <div className="form-check mb-0">
                                        <input
                                            className="form-check-input"
                                            type="checkbox"
                                            id={item.id}
                                            checked={checks[item.id]}
                                            onChange={() => handleCheck(item.id)}
                                        />
                                        <label className="form-check-label small text-muted" htmlFor={item.id}>
                                            {item.title}
                                            {item.required && <span className="text-danger ms-1" style={{ fontSize: "10px" }}>*</span>}
                                        </label>
                                    </div>
                                    <button
                                        type="button"
                                        className="btn btn-link btn-sm text-decoration-none text-secondary p-0"
                                        style={{ fontSize: "11px" }}
                                        onClick={(e) => { e.stopPropagation(); handleToggle(item.id); }}
                                    >
                                        {expandedId === item.id ? "접기 ▲" : "자세히 보기 ▼"}
                                    </button>
                                </div>
                                {expandedId === item.id && (
                                    <div
                                        className="bg-light rounded p-3 mb-2 text-muted small"
                                        style={{ whiteSpace: "pre-line", lineHeight: "1.7", maxHeight: "150px", overflowY: "auto" }}
                                    >
                                        {item.content}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
 
                    {/* 가입 버튼 */}
                    <div className="d-grid gap-3">
                        <button
                            type="button"
                            className="btn py-3 fw-bold action"
                            disabled={!canSubmit}
                            onClick={handleSubmit}
                            style={{ backgroundColor: canSubmit ? '#333' : '#ccc', color: '#fff', borderRadius: '12px', border: 'none' }}
                        >
                            가입하기
                        </button>
                        <Link
                            to="/"
                            className="btn py-3 fw-bold action"
                            style={{ backgroundColor: '#eaeaea', color: '#333', borderRadius: '12px', border: 'none' }}
                        >
                            로그인
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}