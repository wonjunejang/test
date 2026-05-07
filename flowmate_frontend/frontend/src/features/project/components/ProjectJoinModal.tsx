import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap"; 

// ─── Types ───────────────────────────────────────────────────────────────────
 
type ModalType = "join" | "unavailable" | "success" | "wrong";
 
interface ProjectJoinModalProps {
  show: boolean;
  type: ModalType;
  onConfirm: (link?: string) => void;
  onClose: () => void;
}
 
// ─── Modal Component ─────────────────────────────────────────────────────────
 
const ProjectJoinModal: React.FC<ProjectJoinModalProps> = ({
  show,
  type,
  onConfirm,
  onClose,
}) => {
  const [link, setLink] = useState("");
 
  const handleConfirm = () => {
    onConfirm(type === "join" ? link : undefined);
    setLink("");
  };
 
  const handleClose = () => {
    setLink("");
    onClose();
  };
 
  return (
    <Modal
      show={show}
      onHide={handleClose}
      centered
      contentClassName="border-0 shadow rounded-4 px-2 py-3"
    >
      <Modal.Header className="border-0 pb-0 justify-content-center">
        <Modal.Title
          className="fw-bold text-center w-100"
          style={{ fontSize: "1.25rem", color: "#1a1a1a" }}
        >
          {type === "join" 
          ? "프로젝트 참여 링크" : type ==="success" ? "참여 완료" : type === "wrong" ? "유효하지 않은 링크" : "프로젝트 참여 불가"}
        </Modal.Title>
      </Modal.Header>
 
      <Modal.Body className="pt-3 pb-2">
        {type === "join" ? (
          <Form.Control
            type="text"
            placeholder="프로젝트 링크를 입력하세요."
            value={link}
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            className="rounded-3 border"
            style={{
              fontSize: "0.9rem",
              padding: "0.6rem 0.9rem",
              color: "#555",
              backgroundColor: "#fff",
              borderColor: "#ccc",
            }}
          />
        ) : type === "success" ? (
          <p
            className ="text-center mb-0"
            style={{ color: '#888', fontSize:"0.9rem" }}
          >
            프로젝트에 성공적으로 참여했습니다!
          </p>
        ) : type === "wrong" ? (
          <p
            className ="text-center mb-0"
            style={{ color: '#888', fontSize:"0.9rem" }}
          >
            유효하지 않은 링크입니다.
          </p>
        ) : (
          <p
            className="text-center mb-0"
            style={{ color: "#888", fontSize: "0.9rem" }}
          >
            이미 참여 중인 프로젝트입니다.
          </p>
        )
      }
      </Modal.Body>
 
      <Modal.Footer className="border-0 pt-2">
        <Button
          onClick={handleConfirm}
          className="w-100 rounded-3 fw-semibold border-0"
          style={{
            backgroundColor: "#2c2c2c",
            color: "#fff",
            fontSize: "1rem",
            padding: "0.65rem",
            letterSpacing: "0.02em",
          }}
        >
          확인
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
 
export default ProjectJoinModal;