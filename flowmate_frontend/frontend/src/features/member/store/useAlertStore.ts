import { create } from "zustand";

interface AlertStore {
    isOpen: boolean;
    message: string;
    onConfirm?: () => void;
    openAlert: (message: string, onConfirm?: () => void) => void;
    close: () => void;
}

const useAlertStore = create<AlertStore>((set) => ({
    isOpen: false,
    message: "",
    openAlert: (message, onConfirm) => {
        if (onConfirm) {
            set({ isOpen: true, message, onConfirm });
        } else {
            set({ isOpen: true, message });
        }
    },
    close: () => set({ isOpen: false, message: "" }),
}));

export default useAlertStore;