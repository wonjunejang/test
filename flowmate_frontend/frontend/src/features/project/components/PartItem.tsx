import { useState } from "react";
import type { ProjectPart } from "../types";

interface Props {
  part: ProjectPart;
  isLeader: boolean;
  onUpdate: (partId: number, partName: string) => void;
  onDelete: (partId: number) => void;
}

const PartItem = ({ part, isLeader, onUpdate, onDelete }: Props) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(part.partName);

  const handleSave = () => {
    if (!editName.trim()) return;
    onUpdate(part.partId, editName);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditName(part.partName); // 원래 값으로 복원
    setIsEditing(false);
  };

  return (
    <div className="d-flex justify-content-between align-items-center py-2 border-bottom">
      {isEditing ? (
        // 수정 모드
        <div className="d-flex gap-2 flex-grow-1">
          <input
            type="text"
            className="form-control form-control-sm"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <button
            className="btn btn-primary btn-sm"
            onClick={handleSave}
          >
            저장
          </button>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCancel}
          >
            취소
          </button>
        </div>
      ) : (
        // 일반 모드
        <>
          <span>{part.partName}</span>
          {isLeader && (
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setIsEditing(true)}
              >
                수정
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={() => onDelete(part.partId)}
              >
                삭제
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default PartItem;