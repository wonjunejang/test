import { useState, useEffect, useCallback } from "react";
import { 
    fetchNotificationList,
    markNotificationAsRead,
    fetchUnreadNotificationCount,
    deleteNotification,
} from '../../../lib/notificationApi';
import type { NotificationPayload } from '../types';
import NotificationItem from '../components/NotificationItem';
import useNotificationStore from "../store/useNotificationStore";
import '../notifications.css';
import AlertModal from "../../../components/AlertModal";
import ConfirmModal from "../../../components/ConfirmModal";

// 창 닫는 함수 Header.jsx에서 받아옴
interface NotificationListProps {
  onClose?: () => void;
  isOpen?: boolean;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function NotificationList({ onClose, isOpen }: NotificationListProps) {
    const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<string | null>(null);
    const [confirmMessage, setConfirmMessage] = useState<string | null>(null);
    const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

    const decreaseUnread = useNotificationStore((s) => s.decreaseUnread);
    const unreadCount = useNotificationStore((s) => s.unreadCount);
    const setUnreadCount = useNotificationStore((s) => s.setUnreadCount);
    const triggerRefresh = useNotificationStore((s) => s.triggerRefresh);

    const refreshTrigger = useNotificationStore((s) => s.refreshTrigger); // 리스트 자동 새로고침

    // ── Load ──────────────────────────────────────────────────────────────────

    const loadNotifications = async (isSilent = false) => {
      if (!isSilent) setLoading(true); // 처음 진입 시에만 로딩 표시
      try {
          const [listRes, countRes] = await Promise.all([
              fetchNotificationList(),
              fetchUnreadNotificationCount(),
          ]);
          setNotifications(listRes.data);
          setUnreadCount(countRes.data);
      } catch (err) {
          setError("알림을 불러오는데 실패했습니다.");
      } finally {
          setLoading(false);
      }
    };

    // 2. 실시간 트리거 감지 (이때는 조용히 업데이트)
    useEffect(() => {
      if (refreshTrigger === 0) return; // 초기값 무시
      // 이미 로딩 중이 아닐 때만 실행
      loadNotifications(true); 
    }, [refreshTrigger]);

    // **로그인 후 알림 목록 바로 안뜨는 버그 해결1
    // useEffect(() => {
    //   loadNotifications();
    // }, []);

    useEffect(() => {
      if (!isOpen) return;
      loadNotifications();
    }, [isOpen]);

  // ── Handlers ──────────────────────────────────────────────────────────────

  // 읽음 여부
  const isUnread = (n: NotificationPayload) => n.readYn === "N";

  // 읽기 처리
  const handleRead = useCallback(async (id: number): Promise<void> => {
    await markNotificationAsRead(id);

    setNotifications(prev =>
        prev.map(n =>
        n.notificationId === id ? { ...n, readYn: "Y" } : n
        )
    );

    decreaseUnread();
  }, []);

    // 삭제 처리
    const handleDelete = useCallback(async (id: number) => {
        await deleteNotification(id);

        const removed = notifications.find(n => n.notificationId === id);

        if (removed && removed.readYn === "N") {
            decreaseUnread();
        }

        setNotifications(prev =>
            prev.filter(n => n.notificationId !== id)
        );

    }, [notifications]);

    // 전체 읽음 처리
    const handleReadAll = useCallback(async () => {
        const unreadIds = notifications
            .filter(isUnread)
            .map(n => n.notificationId);

        await Promise.all(unreadIds.map(id => markNotificationAsRead(id)));

        // UI 즉시 반영
        setNotifications(prev =>
            prev.map(n => ({ ...n, readYn: "Y" }))
        );

        // 전역 상태
        setUnreadCount(0);

        // 다른 곳 동기화
        triggerRefresh();

    }, [notifications]);

    // 전체 삭제 처리
    const handleDeleteAll = useCallback(async () => {
      setPendingAction(() => async () => {
        try {
            await Promise.all(notifications.map(n => deleteNotification(n.notificationId)));
            setNotifications([]);
            setUnreadCount(0);
        } catch (err) {
            setAlertMessage("삭제 중 오류가 발생했습니다.");
        }
      });
      setConfirmMessage("모든 알림을 삭제하시겠습니까?");
    }, [notifications]);

    const handleConfirm = useCallback(async () => {
      setConfirmMessage(null);
      if (pendingAction) {
          await pendingAction();
          setPendingAction(null);
      }
  }, [pendingAction]);

  const handleAlertConfirm = useCallback(() => {
      setAlertMessage(null);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {alertMessage && (
        <AlertModal message={alertMessage} onConfirm={handleAlertConfirm} />
      )}
      {confirmMessage && (
        <ConfirmModal
          message={confirmMessage}
          onConfirm={handleConfirm}
          onCancel={() => { setConfirmMessage(null); setPendingAction(null); }}
        />
      )}

      <div
        className="mx-auto bg-white"
        style={{
          maxWidth: "420px",
          height: "100vh",
          overflowY: "auto",
          fontFamily: "'Pretendard', 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
          borderLeft: "1px solid #f0f0f0",
          borderRight: "1px solid #f0f0f0",
        }}
      >
        {/* Header */}
        <div
          className="d-flex align-items-center justify-content-between px-3 py-3 bg-white border-bottom sticky-top"
          style={{ zIndex: 10 }}
        >
          <h1 className="mb-0 fw-bold" style={{ fontSize: "19px", letterSpacing: "-0.3px" }}>
            알림
          </h1>
          <div className="d-flex gap-2">
            <button
              onClick={handleReadAll}
              disabled={unreadCount === 0}
              className="btn btn-outline-secondary btn-sm rounded-pill"
              style={{ fontSize: "12px" }}
            >
              전체읽음
            </button>
            <button
              onClick={handleDeleteAll}
              disabled={notifications.length === 0}
              className="btn btn-danger btn-sm rounded-pill"
              style={{ fontSize: "12px" }}
            >
              전체삭제
            </button>
          </div>
        </div>

        {/* Body */}
        {loading ? (
          <div className="d-flex justify-content-center align-items-center py-5 text-muted" style={{ fontSize: "14px" }}>
            <span className="spinner-border spinner-border-sm me-2" role="status" />
            불러오는 중…
          </div>
        ) : error ? (
          <div className="alert alert-danger mx-3 mt-3 text-center" style={{ fontSize: "14px" }}>
            {error}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-muted py-5" style={{ fontSize: "14px" }}>
            알림이 없습니다.
          </div>
        ) : (
          <ul className="list-group list-group-flush">
            {notifications.map((n) => (
              <NotificationItem
                key={n.notificationId}
                notificationId={n.notificationId}
                projectName={n.projectName}
                projectId={n.projectId}
                type={n.type}
                action={n.action}
                targetId={n.targetId}
                content={n.content}
                createdAt={n.createdAt}
                isRead={n.readYn==="N" ? false : true}
                onRead={handleRead}
                onDelete={handleDelete}
                onClose={onClose}
              />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}