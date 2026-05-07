import "./master.css";
import { useEffect } from "react";

interface AlertModalProps {
  message: string;
  onConfirm: () => void;
}

const AlertModal = ({ message, onConfirm }: AlertModalProps) => {

  // 엔터 눌러도 확인 처리되게
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter") onConfirm();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onConfirm]);

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <p className="modal-message">{message}</p>
        <button className="modal-btn modal-btn--dark" onClick={onConfirm}>
          확인
        </button>
      </div>
    </div>
  );
};

export default AlertModal;
