import { axiosInstance } from "./axios";
import type {
    AdminNotice,
    AdminNoticeReadDto,
    AdminNoticeRequest
} from "../features/admin/types";


const BASE = "/admin-notices";

// 사용자용
export const fetchUserNotices = (username: string) =>
  axiosInstance.get<AdminNoticeReadDto[]>(`${BASE}/users`, { params: { username } });

export const fetchUserNoticeDetail = (id: number, username: string) =>
  axiosInstance.get<AdminNoticeReadDto>(`${BASE}/users/${id}`, { params: { username } });

// 관리자용
export const fetchAdminNotices = () =>
  axiosInstance.get<AdminNotice[]>(BASE);

export const createAdminNotice = (data: AdminNoticeRequest) =>
  axiosInstance.post<AdminNotice>(BASE, data);

export const updateAdminNotice = (id: number, data: AdminNoticeRequest) =>
  axiosInstance.put<AdminNotice>(`${BASE}/${id}`, data);

export const deleteAdminNotice = (id: number) =>
  axiosInstance.delete(`${BASE}/${id}`);

export const restoreAdminNotice = (id: number) =>
  axiosInstance.put(`/admin-notices/${id}/restore`);