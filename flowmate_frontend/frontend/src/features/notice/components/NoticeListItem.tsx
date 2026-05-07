import { useMemo } from "react";
import type { NoticeListResponse } from "../types";

interface Props {
    notice: NoticeListResponse;
    index: number;
    onClick: (noticeId: number | string) => void;
    isRead: boolean;
}

// date포맷
const formatDate = (date: Date): string =>
  date.toISOString().slice(0, 10);

export default function NoticeListItem( {notice, index, onClick, isRead}: Props ) {
    const { noticeId, noticeTitle, noticeCreatedAt, noticeUpdatedAt, writerName } = notice;

    // 수정일 / 작성일
    const { displayDate, isUpdated } = useMemo(() => {
        const created = new Date(noticeCreatedAt);
        const updated = new Date(noticeUpdatedAt);
        const isUpdated = updated > created;
        return {
        isUpdated,
        displayDate: formatDate(isUpdated ? updated : created),
        };
    }, [noticeCreatedAt, noticeUpdatedAt]);

    return (
        <tr
            onClick={() => onClick(notice.noticeId)}
            className={!isRead ? "unread-notice" : ""}
        >
            <td className="nd-index">{index}</td>
            <td className="text-left">
                {notice.noticeTitle}
                {isUpdated && <span className="nd-updated-label">(수정됨)</span>}
            </td>
            <td>{writerName}</td>
            <td>{displayDate}</td>
        </tr>
    );
}
