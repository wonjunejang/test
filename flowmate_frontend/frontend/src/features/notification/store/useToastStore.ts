import { create } from 'zustand';

interface ToastState {
  isVisible: boolean;
  message: string;
  projectName?: string;
  type: string;
  action: string;
  showToast: (message: string, projectName?: string, type?: string, action?: string) => void;
  hideToast: () => void;
}

const useToastStore = create<ToastState>((set) => ({
  isVisible: false,
  message: '',
  projectName: '',
  type: '',
  action: '',
  showToast: (message, projectName='', type = '', action = '') => {
    set({ isVisible: true, message, projectName, type, action });
    // 3초 후 자동으로 닫힘
    setTimeout(() => set({ isVisible: false }), 3000);
  },
  hideToast: () => set({ isVisible: false }),
}));

export default useToastStore;