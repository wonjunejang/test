import { create } from "zustand";

export interface Alarm {
  id: number;
  title: string;
  desc: string;
  time: string;
  read: boolean;
}

interface AlarmState {
  alarms: Alarm[];
  addAlarm: (alarm: Alarm) => void;
  markRead: (id: number) => void;
  markAllRead: () => void;
  deleteOne: (id: number) => void;
  deleteAll: () => void;
}

const useAlarmStore = create<AlarmState>((set) => ({
  alarms: [],

  addAlarm: (alarm) =>
    set((state) => ({ alarms: [alarm, ...state.alarms] })),

  markRead: (id) =>
    set((state) => ({
      alarms: state.alarms.map((a) => (a.id === id ? { ...a, read: true } : a)),
    })),

  markAllRead: () =>
    set((state) => ({
      alarms: state.alarms.map((a) => ({ ...a, read: true })),
    })),

  deleteOne: (id) =>
    set((state) => ({ alarms: state.alarms.filter((a) => a.id !== id) })),

  deleteAll: () => set({ alarms: [] }),
}));

export default useAlarmStore;
