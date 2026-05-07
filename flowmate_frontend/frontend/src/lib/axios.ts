// NOTE - axios, baseURL goes here
// 건드리지 마세요.
import axios, { type InternalAxiosRequestConfig, type AxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import useMemberStore from "../features/member/store/useMemberStore";
import useProjectMemberStore from "../features/member/store/useProjectMemberStore";
import { useProjectStore } from "../features/project";

const BASE_URL = import.meta.env.VITE_API_URL;

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const nav = useNavigate();

    const memberClear = useMemberStore.getState().clearMemberInfo;
    const projectMembersClear = useProjectMemberStore.getState().clearProjectMembers;
    const projectsReset = useProjectStore.getState().reset;

    if (error.response && error.response.status === 401) {
      sessionStorage.clear();
      memberClear();
      projectMembersClear();
      projectsReset();
      window.location.href = "/"; // 현재 파일 구조에서 useNavigate 호출이 불가합니다.
    }
    return Promise.reject(error);
  },
);
