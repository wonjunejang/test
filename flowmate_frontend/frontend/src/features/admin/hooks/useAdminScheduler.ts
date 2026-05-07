import { useState, useEffect } from "react";
import { fetchSchedulerList, runSchedulerManually } from "../../../lib/adminSchedulerApi";
import type { AdminSchedulerDto, FilterType } from "../types";

export const PAGE_SIZE = 10;

export const useAdminScheduler = () => {
  const [list, setList] = useState<AdminSchedulerDto[]>([]);
  const [filter, setFilter] = useState<FilterType>("ALL");
  const [page, setPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const loadList = async (f: FilterType = filter) => {
    setIsLoading(true);
    try {
      const res = await fetchSchedulerList(f);
      const data = Array.isArray(res.data) ? res.data : [];
      // 삭제 임박한 게 위로
      const sorted = data.sort(
        (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
      );
      setList(sorted);
    } catch (e) {
      console.error("스케줄러 목록 조회 실패", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    setPage(0);
    loadList(f);
  };

  const handleManualRun = async () => {
    setIsRunning(true);
    try {
      await runSchedulerManually();
      alert("스케줄러 실행 완료!");
      setPage(0);
      loadList(filter);
    } catch (e) {
      console.error("수동 실행 실패", e);
      alert("실행에 실패했습니다.");
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  return {
    list,
    filter,
    page,
    setPage,
    isLoading,
    isRunning,
    handleFilterChange,
    handleManualRun,
  };
};