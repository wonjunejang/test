import useToastStore from '../store/useToastStore';

const TYPE_LABEL: Record<string, string> = {
  todo: "Todo", notice: "공지", discussion: "회의록", adminNotice: "관리자 공지",
};

const ACTION_CONFIG: Record<string, { label: string; bg: string; text: string; border: string }> = {
  create:   { label: '생성', bg: '#D1FAE5', text: '#065F46',  border: '#6EE7B7' },
  update:   { label: '수정', bg: '#DBEAFE', text: '#1E40AF',  border: '#93C5FD' },
  delete:   { label: '삭제', bg: '#FEF3C7', text: '#92400E',  border: '#FCD34D' },
  complete: { label: '완료', bg: '#EDE9FE', text: '#5B21B6',  border: '#C4B5FD' },
  late:     { label: '지연', bg: '#FFE4E6', text: '#9F1239',  border: '#FCA5A5' },
};

export default function NotificationToast() {
  const { isVisible, message, projectName, type, action, hideToast } = useToastStore();

  if (!isVisible) return null;

  const separatorIndex = message.indexOf(' - ');
  const actionText = separatorIndex !== -1 ? message.slice(0, separatorIndex) : message;
  const titleText  = separatorIndex !== -1 ? message.slice(separatorIndex + 3) : null;

  const actionCfg = action ? ACTION_CONFIG[action] : null;
  const typeLabel = type ? (TYPE_LABEL[type] ?? type) : '알림';
  const badgeLabel = actionCfg ? `${typeLabel} ${actionCfg.label}` : typeLabel;

  return (
    <div
      className="position-fixed top-0 start-50 translate-middle-x mt-3 bg-white rounded-3 border"
      style={{ zIndex: 9999, width: '300px', cursor: 'pointer', padding: '14px 16px', position: 'relative' }}
      onClick={hideToast}
    >

      {/* 뱃지 + 프로젝트명 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '6px' }}>
        {actionCfg && (
          <span style={{ fontSize: '10px', fontWeight: 600, padding: '2px 8px', borderRadius: '99px', background: actionCfg.bg, color: actionCfg.text, border: `1px solid ${actionCfg.border}` }}>
            {badgeLabel}
          </span>
        )}
        {projectName && (
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{projectName}</span>
        )}
      </div>

      {/* 제목 또는 액션 메시지 */}
      <div style={{ fontSize: titleText ? '15px' : '14px', fontWeight: titleText ? 500 : 400, color: titleText ? '#141413' : '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
        {titleText ?? actionText}
      </div>
    </div>
  );
}