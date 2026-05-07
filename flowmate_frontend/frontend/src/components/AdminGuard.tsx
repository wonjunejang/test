import { Navigate } from "react-router-dom";
import useMemberStore from "../features/member/store/useMemberStore";

const AdminGuard = ({ children }: { children: React.ReactNode }) => {
  const memberInfo = useMemberStore((state) => state.memberInfo);
  
  if (memberInfo?.memberStatus !== "MADMIN") {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export default AdminGuard;