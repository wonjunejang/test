import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Feedback from "../components/common/Feedback";
import { EMAIL_PATTERN, isValidMemberInput, USERNAME_PATTERN } from "../memberValidator";
import { useNavigate } from "react-router-dom";
import { memberPostRequest } from "../../../lib/memberApi";
import { useLoading } from "../../../components/useLoading";
import Loading from "../../../components/Loading";
import useAlertStore from "../store/useAlertStore";
import AlertModal from "../../../components/AlertModal";


export default function FindMemberPassword() {
const nav = useNavigate();
const [email, setEmail] = useState("");
const [username, setUsername] = useState("");
const [emailStatus, setEmailStatus] = useState<string | null>(null);
const [usernameStatus, setusernameStatus] = useState<string | null>(null);
    // 로딩 상태
const {isLoading, withLoading }= useLoading();

const validateEmail = (value: string) => {
if (!value) {
    setEmailStatus(null);
    return;
}

const isValid = isValidMemberInput(EMAIL_PATTERN, value)
setEmailStatus(isValid ? "ok" : "올바른 이메일 형식을 입력해주세요.");
};

const validateUsername = (value: string) => {
if (!value) {
    setusernameStatus(null);
    return;
}

const isValid2 = isValidMemberInput(USERNAME_PATTERN, value)
setusernameStatus(isValid2 ? "ok" : "올바른 아이디 형식을 입력해주세요.");
};

const handleIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setUsername(e.target.value);
validateUsername(e.target.value);
};

const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
setEmail(e.target.value);
validateEmail(e.target.value);
};

const handleFind = async () => {

    if (!email.trim()) {
        setEmailStatus("이메일을 입력해주세요.");
        return;
    }

    if (emailStatus !== "ok") return;

    // 아이디 정보 주는 로직
    // 1. 해당 이메일에 해당하는 아이디를 찾는 api 호출 /member/find-userpassword
    // 2. 200 -> 모달로 해당 이메일에 바뀐 비밀번호 보내주기
    // 3. 404 -> 해당 이메일 또는 아이디가 일치하지 않음을 알려주기

    const payLoad = { "memberEmail" : email, "username" : username}
    const path = "/member/find-password";
    withLoading( async () => {
        try {
        const response = await memberPostRequest(payLoad, path, null); 

        if(response.status == 200) {
            openAlert(`해당 이메일에 비밀번호를 전송했습니다.`);
        }

    } catch {
        openAlert("이메일또는 아이디가 존재하지 않습니다.");
    }
    })
    

};

const handleLogin = () => {
nav("/");
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
<div className="container" style={{ maxWidth: "600px" }}>
    {isLoading && <Loading />}
    <h1 className="text-center fw-bold mb-5" style={{ color: "#444", fontSize: "2rem" }}>
    비밀번호 찾기
    </h1>

    <div className="mb-3">
    <label className="form-label fw-medium">아이디</label>
    <input
        type="text"
        className="form-control form-control-lg"
        placeholder="아이디를 입력하세요."
        value={username}
        onChange={handleIdChange}
    />
    <Feedback status={usernameStatus} okMsg="사용 가능한 아이디 형식 입니다." />
    </div>

        <div className="mb-3">
    <label className="form-label fw-medium">이메일</label>
    <input
        type="email"
        className="form-control form-control-lg"
        placeholder="이메일을 입력하세요."
        value={email}
        onChange={handleEmailChange}
    />
    <Feedback status={emailStatus} okMsg="사용 가능한 이메일 형식 입니다." />
    </div>

    <div className="mt-5 d-grid gap-3">
    <button
        className="btn btn-dark btn-lg"
        style={{ borderRadius: "14px", padding: "18px", fontSize: "17px", fontWeight: 700 }}
        onClick={handleFind}
        disabled={emailStatus !== "ok"}
    >
        비밀번호 찾기
    </button>
    <button
        className="btn btn-secondary btn-lg"
        style={{ borderRadius: "14px", padding: "18px", fontSize: "17px" }}
        onClick={handleLogin}
    >
        로그인
    </button>
    </div>
</div>
</>
);
}