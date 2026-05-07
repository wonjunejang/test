import "./master.css";
import { useEffect } from "react";

interface ConfirmModalProps {
  message: string;
  subMessage?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmModal = ({ message, subMessage, onCancel, onConfirm }: ConfirmModalProps) => {
  
  // 엔터 눌러도 "예"
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        onConfirm();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopPropagation();
        onCancel();
      }
    };
    window.addEventListener("keydown", handleKeyDown, true); // capture 단계에서 먼저 잡기
    return () => window.removeEventListener("keydown", handleKeyDown, true);
  }, [onConfirm, onCancel]);
  
  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <p className="modal-message">{message}</p>
        {subMessage && <p className="modal-sub-message">{subMessage}</p>}
        <div className="modal-btn-group">
          <button className="modal-btn modal-btn--gray" onClick={onCancel}>
            아니요
          </button>
          <button className="modal-btn modal-btn--dark" onClick={onConfirm}>
            예
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
