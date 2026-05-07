import { create } from "zustand";

interface ConfirmStore {
    isOpen: boolean;
    message: string;
    subMessage?: string;
    onConfirm?: () => void;
    onCancel?: () => void;
    openConfirm: (message: string, onConfirm?: () => void, onCancel?: () => void, subMessage?: string) => void;
    close: () => void;
}

const useConfirmStore = create<ConfirmStore>((set) => ({
    isOpen: false,
    message: "",
    openConfirm: (message, onConfirm, onCancel, subMessage) => {
        const next: Partial<ConfirmStore> = { isOpen: true, message };
        if (onConfirm) next.onConfirm = onConfirm;
        if (onCancel) next.onCancel = onCancel;
        if (subMessage) next.subMessage = subMessage;
        set(next);
    },
    close: () => set({ isOpen: false, message: "" }),
}));

export default useConfirmStore;