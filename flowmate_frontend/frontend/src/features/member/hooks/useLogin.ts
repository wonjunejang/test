// useLogin.ts
import { type Member } from "../memberType";
import { memberPostRequest, memberGetRequest } from "../../../lib/memberApi";
import { useNavigate } from "react-router-dom";
import useMemberStore from "../store/useMemberStore";
import { getMyProjects } from "../../../lib/projectApi";
import useProjectMemberStore from "../store/useProjectMemberStore";
import useAlertStore from "../store/useAlertStore";
import { useProjectStore } from "../../project";

export const useLogin = () => {
    const nav = useNavigate();
    const setMemberInfo = useMemberStore((state) => state.setMemberInfo);
    const { setProjectMembers } = useProjectMemberStore();
    const { setMyProjects } = useProjectStore();
    const { openAlert } = useAlertStore();

    const login = async (payLoad: Member) => {
        const path = "/member/login";
        const auth = { withCredentials: true };

        try {
            const response = await memberPostRequest(payLoad, path, auth);
            const getProjectMemberList = await memberGetRequest(
                `/projects/getProjectMemberList?username=${payLoad.username}`
            );
            const getProjectList = await getMyProjects();

            if (response.status == 200 && getProjectMemberList.status == 200, getProjectList.status == 200 ) {
                console.log(response.data.memberStatus);
                if (response.data.memberStatus == "MLEAV") {
                    openAlert("회원 탈퇴처리된 계정입니다.");
                    return;
                }

                // 관리자면 바로 관리자 페이지로 이동
                if (response.data.memberStatus == "MADMIN") {
                    setMemberInfo(response.data);
                    nav("/admin");
                    return;
                }

                setMemberInfo(response.data);
                setProjectMembers(getProjectMemberList.data);
                setMyProjects(getProjectList.data);

                const res = await getMyProjects();
                const projects = res.data;

                if (!projects || projects.length === 0) {
                    nav(`/projects/0`);
                } else {
                    const maxProjectId = Math.max(...projects.map((p) => p.projectId));
                    nav(`/projects/${maxProjectId}`);
                }
            }
        } catch {
            openAlert("아이디 또는 비밀번호가 잘못되었습니다.");
        }
    };

    return { login };
};