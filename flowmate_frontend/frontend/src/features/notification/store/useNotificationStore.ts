import { create } from "zustand";

interface NotificationState {
  unreadCount: number;
  setUnreadCount: (count: number) => void;
  increaseUnread: (count?: number) => void;
  decreaseUnread: () => void;

  refreshTrigger: number;
  triggerRefresh: () => void;
}

const useNotificationStore = create<NotificationState>((set) => ({
  unreadCount: 0,

  setUnreadCount: (count) => set({ unreadCount: count }),

  increaseUnread: (count = 1) =>
    set((state) => ({
      unreadCount: state.unreadCount + count,
    })),

  decreaseUnread: () =>
    set((state) => ({
      unreadCount: Math.max(0, state.unreadCount - 1),
    })),

  refreshTrigger: 0,
  triggerRefresh: () =>
    set((state) => ({
      refreshTrigger: state.refreshTrigger + 1,
    })),
}));

export default useNotificationStore;