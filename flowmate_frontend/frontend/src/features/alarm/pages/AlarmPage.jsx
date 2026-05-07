import useAlarmStore from '../../../store/useAlarmStore';
import './AlarmPage.css';

export default function AlarmPage() {
  const { alarms, markRead, markAllRead, deleteOne, deleteAll } = useAlarmStore();

  return (
    <div className="alarm-page">
      <p className="alarm-page-label">알림 목록</p>

      <div className="alarm-modal">
        <div className="alarm-modal-header">
          <span className="alarm-modal-title">알림</span>
          <div className="alarm-modal-actions">
            <button className="alarm-btn" onClick={markAllRead}>전체 읽음</button>
            <button className="alarm-btn alarm-btn-delete" onClick={deleteAll}>전체 삭제</button>
          </div>
        </div>

        <div className="alarm-list">
          {alarms.length === 0 && (
            <p className="alarm-empty">알림이 없습니다.</p>
          )}
          {alarms.map(alarm => (
            <div
              key={alarm.id}
              className={`alarm-item ${alarm.read ? 'read' : 'unread'}`}
              onClick={() => markRead(alarm.id)}
            >
              <div className="alarm-item-body">
                <span className="alarm-item-title">{alarm.title}</span>
                <span className="alarm-item-desc">{alarm.desc}</span>
              </div>
              <div className="alarm-item-side">
                <span className="alarm-item-time">{alarm.time}</span>
                <button
                  className="alarm-item-close"
                  onClick={(e) => { e.stopPropagation(); deleteOne(alarm.id); }}
                >×</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
