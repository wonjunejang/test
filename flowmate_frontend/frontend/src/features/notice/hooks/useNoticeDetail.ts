import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import useNoticeList from "../hooks/useNoticeList";
import { 
    deleteNotice, 
    fetchNotice,
} from "../../../lib/noticeApi";
import type { NoticeDetailResponse, MemberResponse, Reaction } from "../types";

export default function useNoticeDetail(projectId: number | string, noticeId: number | string) {
    const navigate = useNavigate();

    // 데이터 상태 관리
    const [notice, setNotice] = useState<NoticeDetailResponse | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<Error | null>(null);
    const [allIds, setAllIds] = useState<number[]>([]); // 페이징
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string | null>(null);

    const { notices } = useNoticeList(projectId!);

    /**
     * 공지 상세 조회
     */
    const loadNotice = async () => {
        setIsLoading(true);
        try {
            const res = await fetchNotice(projectId, noticeId);
            setNotice(res.data);
        } catch (e: any) {
            console.error("공지 상세 로드 실패", e);
            console.error("응답 데이터:", e.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * 공지 삭제
     */
    // confirm 확인 시 실제 삭제 실행
     const handleDeleteConfirmed = async () => {
        setConfirmMessage(null);
        try {
        await deleteNotice(projectId, noticeId);
        setAlertMessage("삭제되었습니다."); // 삭제 완료 후 alert
        } catch (err) {
        setAlertMessage("삭제에 실패했습니다.");
        }
    };

    // 삭제 버튼 클릭 시 → confirm 모달 띄우기
    const removeNotice = () => {
        setConfirmMessage("공지를 삭제하시겠습니까?");
    };

    // alert 확인 시 → 삭제 성공이었으면 목록으로 이동
    const handleAlertConfirm = () => {
        const wasSuccess = alertMessage === "삭제되었습니다.";
        setAlertMessage(null);
        if (wasSuccess) navigate(`/projects/${projectId}/notices`);
    };

    // 공지 상세 페이징용 (notices가 들어온 다음에 계산)
    useEffect(() => {
        if (notices && notices.length > 0) {
            setAllIds(notices.map((n) => n.noticeId));
        }
    }, [notices]);

    useEffect(() => {
        if (projectId && noticeId) {
            loadNotice();
        }
    }, [projectId, noticeId]);

    return {
        notice,
        allIds,
        isLoading,
        error,
        removeNotice,
        refetch: loadNotice,
        alertMessage,         
        confirmMessage,       
        handleAlertConfirm,   
        handleDeleteConfirmed, 
        closeConfirm: () => setConfirmMessage(null),
    };


}