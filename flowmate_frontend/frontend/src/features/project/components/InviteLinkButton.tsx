import { useState } from "react";
import { useParams } from "react-router-dom";

interface Props {
  tokenUrl?: string;
}

const InviteLinkButton = ({ tokenUrl }: Props) => {
  const { projectId } = useParams<{ projectId: string }>();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const token = tokenUrl || projectId; // tokenUrl 없으면 projectId 사용
    const link = `${window.location.origin}/projects/invite/${tokenUrl}`;
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      // 2초 후 원래 텍스트로 복원
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      className="btn btn-outline-secondary btn-sm"
      onClick={handleCopy}
    >
      {copied ? "✓ 복사됨" : "초대링크 복사"}
    </button>
  );
};

export default InviteLinkButton;