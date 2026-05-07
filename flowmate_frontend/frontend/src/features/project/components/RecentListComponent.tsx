// components/RecentListCard.tsx

interface ListItem {
  id: number;
  title: string;
  createdAt: string;
}

interface RecentListComponentProps {
  title: string;
  items: ListItem[];
  isLoading: boolean;
  emptyMessage: string;
  onTitleClick: () => void;       // 우측 바로가기 버튼
  onItemClick: (id: number) => void;
}

const RecentListComponent = ({
  title,
  items,
  isLoading,
  emptyMessage,
  onTitleClick,
  onItemClick,
}: RecentListComponentProps) => {
  return (
    <div className="col-md-4 mt-4 mt-md-0">
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h6 className="fw-bold mb-0">{title}</h6>
        <button className="btn direct-btn" onClick={onTitleClick} />
      </div>
      <div className="border rounded px-3 py-1 mb-3" style={{ fontSize: '0.85rem' }}>
        {isLoading ? (
          <div className="text-muted text-center py-3">불러오는 중...</div>
        ) : items.length === 0 ? (
          <div className="text-muted text-center py-3">{emptyMessage}</div>
        ) : (
          <ul className="list-unstyled mb-0">
            {items.map((item, index) => (
              <li
                key={item.id}
                className="d-flex justify-content-between align-items-center py-2"
                style={{
                  cursor: 'pointer',
                  borderBottom: index === items.length - 1 ? "none" : "1px solid #dee2e6"
                }}
                onClick={() => onItemClick(item.id)}
              >
                <span className="text-truncate" style={{ maxWidth: '70%' }}>
                  {item.title}
                </span>
                <span className="text-muted" style={{ fontSize: '0.75rem', whiteSpace: 'nowrap' }}>
                  {item.createdAt?.toString().slice(0, 10)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RecentListComponent;