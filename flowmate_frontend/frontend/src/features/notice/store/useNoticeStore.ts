import { create } from "zustand";

type Reaction = "heart" | "thumbsUp" | "thumbsDown" | "clap" | "surprise" | "laugh";

interface NoticeStore {
  readNoticeIds: Set<number>;
  myReactions: Record<number, Reaction | null>;

  setRead: (id: number) => void;
  removeRead: (id: number) => void;

  setReaction: (id: number, reaction: Reaction | null) => void;

  setInitialReadIds: (ids: number[]) => void;
}

export const useNoticeStore = create<NoticeStore>((set) => ({
  readNoticeIds: new Set(),
  myReactions: {},

  setRead: (id) =>
    set((state) => ({
      readNoticeIds: new Set(state.readNoticeIds).add(id),
    })),

  removeRead: (id) =>
    set((state) => {
      const next = new Set(state.readNoticeIds);
      next.delete(id);
      return { readNoticeIds: next };
    }),

  setReaction: (id, reaction) =>
    set((state) => ({
      myReactions: {
        ...state.myReactions,
        [id]: reaction,
      },
    })),

  setInitialReadIds: (ids) =>
    set(() => ({
      readNoticeIds: new Set(ids),
    })),
}));