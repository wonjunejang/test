import { useState, useEffect } from "react";
import { fetchUserNotices } from "../../../lib/adminNoticeApi";
import type { AdminNoticeReadDto } from "../types";

export const useUserNoticeList = (username: string) => {
  const [notices, setNotices] = useState<AdminNoticeReadDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!username) return;
    setIsLoading(true);
    fetchUserNotices(username)
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setNotices(data.sort((a, b) => b.id - a.id)); // ← 여기에 추가
      })
      .catch((e) => console.error("공지 조회 실패", e))
      .finally(() => setIsLoading(false));
  }, [username]);

  return { notices, isLoading };
};