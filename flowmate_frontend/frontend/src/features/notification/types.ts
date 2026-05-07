export interface NotificationPayload {
  notificationId: number;

  projectName: string;
  projectId: number;

  type: NotificationType;
  action: NotificationAction;

  targetId: number;

  content: string;

  readYn: "Y" | "N";
  createdAt: string;
}

export type NotificationType = "notice" | "todo" | "discussion" | "adminNotice";
export type NotificationAction = "create" | "update" | "delete" | "complete" | "late";

