import { useNavigate } from "react-router-dom";
import { createPortal } from 'react-dom';
import type { NotificationType, NotificationAction } from '../types';
import closeBtn from '../../../assets/close-black.png';
import useMemberStore from "../../member/store/useMemberStore";
import { useState } from "react";
import { fetchNotice } from "../../../lib/noticeApi";
import { fetchDiscussion } from "../../../lib/discussionApi";
import { fetchUserNoticeDetail } from "../../../lib/adminNoticeApi";
import { fetchTodoDetail } from "../../../lib/todoApi";

export interface NotificationItemProps {
    notificationId: number;
    projectName: string;
    projectId: number;
    type: NotificationType; // "NOTICE" | "TODO" | "DISCUSSION"
    action: NotificationAction;
    targetId: number;
    content: string;
    createdAt: string;
    isRead?: boolean;
    onRead: (id: number) => Promise<void>;
    onDelete: (id: number) => void;
    onClose?: (() => void) | undefined;
}

// ────────────────────────────────────────────────
// Config
// ────────────────────────────────────────────────
 
/** type 별 색상*/
const TYPE_COLOR: Record<NotificationType, { accentColor: string }> = {
  todo:       { accentColor: '#60A5FA' },
  notice:     { accentColor: '#FBBF24' },
  discussion: { accentColor: '#34D399' },
  adminNotice: { accentColor: '#A78BFA' },
};
 
/** action 별 색상*/
const ACTION_CONFIG: Record<NotificationAction, { label: string; bg: string; text: string; border: string }> = {
  create:   { label: '생성', bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
  update:   { label: '수정', bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
  delete:   { label: '삭제', bg: '#FEF3C7', text: '#92400E', border: '#FCD34D' },
  complete: { label: '완료', bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
  late:  { label: '지연', bg: '#FFE4E6', text: '#9F1239', border: '#FCA5A5' },
};

// 어떤 알림인지
const TYPE_LABEL: Record<string, string> = {
  todo: "Todo",
  notice: "공지",
  discussion: "회의록",
  adminNotice: "관리자 공지",
};


/** ISO 문자열을 현재 시각과 비교해 "N분 전" 형태로 반환 */
function getTimeAgo(isoString: string): string {
  const created = new Date(isoString).getTime();
  const now = Date.now();
  const diffSec = Math.floor((now - created) / 1000);
 
  if (diffSec < 60)                        return '방금 전';
  if (diffSec < 3600)                      return `${Math.floor(diffSec / 60)}분 전`;
  if (diffSec < 86400)                     return `${Math.floor(diffSec / 3600)}시간 전`;
  if (diffSec < 86400 * 7)                 return `${Math.floor(diffSec / 86400)}일 전`;
  if (diffSec < 86400 * 30)               return `${Math.floor(diffSec / (86400 * 7))}주 전`;
  if (diffSec < 86400 * 365)              return `${Math.floor(diffSec / (86400 * 30))}개월 전`;
  return `${Math.floor(diffSec / (86400 * 365))}년 전`;
}

// ── 삭제된 항목 안내 모달 ──────────────────────────
function DeletedModal({ type, onClose }: { type: string; onClose: () => void }) {
    const label = TYPE_LABEL[type] ?? type;

    return createPortal(
        <div
            onClick={onClose}
            style={{
                position: 'fixed', inset: 0,
                background: 'rgba(0,0,0,0.35)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999,
            }}
        >
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    background: '#fff',
                    borderRadius: '14px',
                    padding: '28px 32px',
                    minWidth: '260px',
                    textAlign: 'center',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.15)',
                }}
            >
                {/* 아이콘 */}
                <div style={{ fontSize: '36px', marginBottom: '10px' }}>🗑️</div>

                {/* 메시지 */}
                <p style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '0 0 6px' }}>
                    삭제된 {label}입니다
                </p>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: '0 0 20px' }}>
                    해당 항목은 더 이상 존재하지 않아요.
                </p>

                <button
                    onClick={onClose}
                    style={{
                        background: '#111827', color: '#fff',
                        border: 'none', borderRadius: '8px',
                        padding: '9px 28px', fontSize: '13px', fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    확인
                </button>
            </div>
        </div>,
        document.body
    );
}

export default function NotificationItem({ 
    notificationId,
    projectName,
    projectId,
    type,
    action,
    targetId,
    content,
    createdAt,
    isRead = false,
    onRead,
    onDelete,
    onClose,
 }: NotificationItemProps) {

    const navigate = useNavigate();

    const { accentColor } = TYPE_COLOR[type];
    const { label, bg, text, border } = ACTION_CONFIG[action];

    // ex) 1분 전
    const timeAgo = getTimeAgo(createdAt);

    // content에서 메인 메시지와 변경 항목 파싱
    // const [mainText, ...rawDetails] = content.split('\n');
    const parts = content.split('\n');
    const mainText = parts[0] ?? '';
    const rawDetails = parts.slice(1);

    const parsedDetails = rawDetails.map((d) => {
        const colonIdx = d.indexOf(': ');
        const label = d.slice(0, colonIdx);
        const values = d.slice(colonIdx + 2);
        const [before, after] = values.split(' → ');
        return { label, before, after };
    });

    // " - " 기준으로 액션 메시지와 제목 분리
    const separatorIndex = mainText.indexOf(' - ');
    const noticeAction = separatorIndex !== -1 ? mainText.slice(0, separatorIndex) : mainText;
    const noticeTitle  = separatorIndex !== -1 ? mainText.slice(separatorIndex + 3) : null;


    // test
    const memberInfo = useMemberStore((state) => state.memberInfo);
    const username = memberInfo?.username ?? null;
    const [showDeletedModal, setShowDeletedModal] = useState(false);
    
    const handleClick = async () => {
        // 1. 읽지 않은 알림이면 읽음 처리
        if (!isRead) onRead(notificationId).catch(() => {});

        // delete 액션 알림은 대상이 이미 없으므로 바로 모달 표시
        if (action === 'delete') {
            setShowDeletedModal(true);
            return;
        }

        try {
            // 이동 전에 존재 여부 확인 (실제 API 경로에 맞게 수정)
            if (type === 'notice') {
                await fetchNotice(projectId, targetId);
            } else if (type === 'adminNotice') {
                await fetchUserNoticeDetail(targetId, username!);
            } else if (type === 'discussion') {
                await fetchDiscussion(projectId, targetId);
            } else if (type === 'todo') {
                await fetchTodoDetail(projectId, targetId, username!);
            }
            
            type === 'adminNotice'
              ? navigate(`/notices/${targetId}`)
              : navigate(`/projects/${projectId}/${type}s/${targetId}`);
            onClose?.();
        } catch (err: any) {
            setShowDeletedModal(true);
        }
    };

  return (
    <>

      {/* 삭제된 항목 모달 */}
        {showDeletedModal && (
            <DeletedModal
                type={type}
                onClose={() => setShowDeletedModal(false)}
            />
        )}
    
      <div
        onClick={handleClick}
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          borderBottom: '1px solid #E5E7EB',
          padding: '12px 14px',
          width: '100%',
          maxWidth: '480px',
          boxSizing: 'border-box',
          transition: 'background 0.2s',
          cursor: 'pointer',
          opacity: isRead ? 0.5 : 1,
        }}
      >
        {/* ── 본문 ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
  
          {/* 첫째 줄: type 제목 · 프로젝트명 · action 배지 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              gap: '5px',
              marginBottom: '3px',
              flexWrap: 'wrap',
            }}
          >
            {/* type (Todo / 공지 / 회의록) */}
            <span style={{ 
              fontSize: '16px', 
              fontWeight: 600,
            }}>
              {TYPE_LABEL[type] ?? type}
            </span>

            {/* action 배지 (생성 / 수정 / 삭제) */}
            <span style={{
              fontSize: '10px', fontWeight: 600, padding: '2px 7px',
              borderRadius: '99px',
              background: bg, color: text, border: `1px solid ${border}`,
              letterSpacing: '0.2px',
            }}>
              {label}
            </span>
  
            <span style={{ fontSize: '11px', color: '#9CA3AF' }}>·</span>
  
            {/* 프로젝트명 */}
            <span style={{ fontSize: '11px', fontWeight: 700 }}>
              {projectName}
            </span>
            
          </div>
  
          {/* 메인 메시지 */}
          {/* <p style={{ fontSize: '13px', color: 'var(--color-text-primary)', margin: '0', fontWeight: 500, lineHeight: 1.5 }}>
              {mainText}
          </p> */}
          <p style={{ fontSize: '13px', color: '#3D3D3A', margin: '0', lineHeight: 1.5 }}>
            {noticeTitle && (
                <>
                    <span style={{ fontWeight: 600 }}>{noticeAction}</span>
                    <span style={{ color: '#9CA3AF' }}> — </span>
                </>
            )}
            <span style={{ fontWeight: 500, color: '#9CA3AF' }}>{noticeTitle}</span>
          </p>

          {/* 변경 항목 칩 */}
          {parsedDetails.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '10px' }}>
                  {parsedDetails.map((item, i) => (
                      <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          background: '#F3F4F6',
                          border: '0.5px solid #E5E7EB',
                          borderRadius: '8px', padding: '4px 10px', fontSize: '11px',
                      }}>
                          <span style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>{item.label}</span>
                          <span style={{ color: '#9CA3AF', fontWeight: '900'}}>{item.before}</span>
                          <span style={{ color: '#9CA3AF', fontWeight: '900' }}>→</span>
                          <span style={{ color: accentColor, fontWeight: '900' }}>{item.after}</span>
                      </div>
                  ))}
              </div>
          )}
          
          
          
        </div>
  
        {/* ── 버튼 ── */}
        <div
          style={{
            display: 'flex',
            gap: '6px',
            alignItems: 'center',
            flexShrink: 0,
            marginLeft: '12px',
          }}
        >
          {/* 읽지 않은 알림 점 */}
          {!isRead && (
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#EF4444', display: 'inline-block', flexShrink: 0 }} />
          )}

          {/* 시간 */}
          <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{timeAgo}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(notificationId);
            }}
            aria-label="알림 삭제"
            className="btn btn-link p-0 text-secondary"
            style={{ 
              lineHeight: 1, 
              textDecoration: 'none',
              display: 'flex',       // ← 이미지 버튼 정렬
              alignItems: 'center',
              padding: 0,
            }}
          >
            <img
              src={closeBtn}
              alt="닫기"
              style={{
                width: '10px',
                height: '10px',
                opacity: 0.7,
                cursor: 'pointer'
                
              }}
              onMouseOver={(e) => (e.currentTarget.style.opacity = '1')}
              onMouseOut={(e) => (e.currentTarget.style.opacity = '0.7')}
            />
            
          </button>
        </div>
      </div>
    </>

  );
}