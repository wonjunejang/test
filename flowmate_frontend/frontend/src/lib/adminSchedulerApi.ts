import { axiosInstance } from "./axios";
import type { AdminSchedulerDto, FilterType } from "../features/admin/types";

const BASE = "/admin/scheduler";

export const fetchSchedulerList = (filter: FilterType) =>
  axiosInstance.get<AdminSchedulerDto[]>(`${BASE}/list`, {
    params: { filter, page: 0, size: 9999 },
  });

export const runSchedulerManually = () =>
  axiosInstance.get<string>(`${BASE}/test`);