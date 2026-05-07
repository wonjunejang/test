import { Navigate, Outlet } from "react-router-dom";
import useMemberStore from "../features/member/store/useMemberStore";

const LoginGuard = () => {
const memberInfo = useMemberStore((state) => state.memberInfo);

if (memberInfo?.memberStatus !== "MACT") {
return <Navigate to="/" replace />;
}

return <Outlet />;
};

export default LoginGuard;