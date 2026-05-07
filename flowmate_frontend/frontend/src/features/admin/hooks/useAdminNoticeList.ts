import { useState, useEffect } from "react";
import { fetchAdminNotices, deleteAdminNotice, restoreAdminNotice } from "../../../lib/adminNoticeApi";
import type { AdminNotice } from "../types";

export const useAdminNoticeList = () => {
  const [notices, setNotices] = useState<AdminNotice[]>([]);
  const [deletedNotices, setDeletedNotices] = useState<AdminNotice[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadList = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAdminNotices();
      const data = Array.isArray(res.data) ? res.data : [];
      setNotices(data.filter((n) => n.delYn === "N").sort((a, b) => b.id - a.id));
      setDeletedNotices(data.filter((n) => n.delYn === "Y").sort((a, b) => b.id - a.id));
    } catch (e) {
      console.error("공지 목록 조회 실패", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteAdminNotice(id);
      await loadList(); // 목록 새로고침
    } catch (e) {
      console.error("삭제 실패", e);
      alert("삭제에 실패했습니다.");
    }
  };

  const handleRestore = async (id: number) => {
    try {
      await restoreAdminNotice(id);
      await loadList(); // 목록 새로고침
    } catch (e) {
      console.error("복원 실패", e);
      alert("복원에 실패했습니다.");
    }
  };

  useEffect(() => { loadList(); }, []);

  return { notices, deletedNotices, isLoading, handleDelete, handleRestore };
};