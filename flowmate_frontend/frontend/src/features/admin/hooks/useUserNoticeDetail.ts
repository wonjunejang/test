import { useState, useEffect } from "react";
import { fetchUserNoticeDetail } from "../../../lib/adminNoticeApi";
import type { AdminNoticeReadDto } from "../types";

export const useUserNoticeDetail = (id: number, username: string) => {
  const [notice, setNotice] = useState<AdminNoticeReadDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
      if (!id || !username) return;
      setIsLoading(true);
      fetchUserNoticeDetail(id, username)
        .then((res) => setNotice(res.data))
        .catch((e) => console.error("상세 조회 실패", e))
        .finally(() => setIsLoading(false));
    }, [id, username]);

  return { notice, isLoading };
};