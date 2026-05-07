import { axiosInstance } from "./axios";
import type {
  NotificationPayload
} from "../features/notification/types";

/**
 * 1. 알림 목록 조회
 * GET /api/notifications
 */
export const fetchNotificationList = () =>
  axiosInstance.get<NotificationPayload[]>(`/api/notifications`);

/**
 * 2. 알림 읽음 처리
 * PATCH /api/notifications/{notificationId}/read
 */
export const markNotificationAsRead = (notificationId: number | string) =>
  axiosInstance.patch(`/api/notifications/${notificationId}/read`);

/**
 * 3. 읽지 않은 알림 개수
 * GET /api/notifications/unread-count
 */
export const fetchUnreadNotificationCount = () =>
  axiosInstance.get<number>(`/api/notifications/unread-count`);

/**
 * 4. 알림 삭제
 * DELETE /api/notifications/{notificationId}
 */
export const deleteNotification = (notificationId: number | string) =>
  axiosInstance.delete(`/api/notifications/${notificationId}`);