import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { deleteNotice, fetchNoticeList, readNotice } from "../../../lib/noticeApi";
import type { NoticeListResponse } from "../types";
import AlertModal from "../../../components/AlertModal";

export default function useNoticeList(projectId: number | string, searchKeyword?: string) {
  const [notices, setNotices] = useState<NoticeListResponse[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [forcedReadIds, setForcedReadIds] = useState<Set<number | string>>(new Set()); // 추가
  const [alertMessage, setAlertMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  // 최신 3개만 추출 (notices가 변경될 때마다 계산)
  const recentNotices = useMemo(() => {
    return notices.slice(0, 3);
  }, [notices]);

  const loadList = async () => {
    setIsLoading(true);
    try {
      const res = await fetchNoticeList(projectId, searchKeyword);
      setNotices(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error("공지 목록 조회 실패", e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveToNotice = async (noticeId: number | string) => {
    try {
      navigate(`/projects/${projectId}/notices/${noticeId}`);
    } catch (error) {
      console.error("공지 상세 이동 실패:", error);
    }
  };

  const handleDelete = async (noticeId: number) => {
    try {
      await deleteNotice(projectId, noticeId);
      setNotices((prev) => prev.filter((n) => n.noticeId !== noticeId));
    } catch (e) {
      console.error("삭제 실패", e);
      setAlertMessage("삭제에 실패했습니다.");
    }
  };

  // 특정 공지를 클라이언트에서 즉시 읽음 처리 (추가)
  const markAsRead = (noticeId: number | string) => {
    setForcedReadIds((prev) => new Set(prev).add(noticeId));
  };

  useEffect(() => {
    loadList();
  }, [projectId, searchKeyword]);

  return {
    notices,
    recentNotices,
    isLoading,
    forcedReadIds,
    loadList,
    markAsRead,
    handleDelete,
    handleMoveToNotice,
    refetch: loadList,
    alertMessage,                         
    clearAlert: () => setAlertMessage(null),
  };
}