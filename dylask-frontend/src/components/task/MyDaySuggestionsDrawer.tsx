import React from 'react';
import { Sparkles, Plus } from 'lucide-react';
import type { MyDaySuggestion } from '@/types/task';

interface MyDaySuggestionsDrawerProps {
  suggestions: MyDaySuggestion[];
  onAdd: (taskId: number) => void;
}

/**
 * Ngăn gợi ý thông minh (Smart Suggestions) đề xuất các công việc quá hạn,
 * hạn hôm nay, ưu tiên cao hoặc chưa xong từ hôm qua.
 */
export const MyDaySuggestionsDrawer: React.FC<MyDaySuggestionsDrawerProps> = ({
  suggestions,
  onAdd,
}) => {
  return (
    <section className="suggestions-card" aria-label="Gợi ý cho hôm nay">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
          <Sparkles size={16} color="var(--color-warning)" />
          <span>Gợi ý thông minh</span>
        </div>
        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
          {suggestions.length} việc
        </span>
      </div>

      {suggestions.length === 0 ? (
        <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', padding: 'var(--space-4) 0', textAlign: 'center' }}>
          Không có đề xuất tồn đọng nào. Bạn đang kiểm soát tốt tiến độ!
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', overflowY: 'auto' }}>
          {suggestions.map((item) => {
            const isOverdue = item.reason.includes('quá hạn');
            const isToday = item.reason.includes('hôm nay');
            const badgeColor = isOverdue
              ? 'var(--color-danger)'
              : isToday
              ? 'var(--color-primary)'
              : 'var(--color-warning)';

            return (
              <div key={item.id} className="suggestion-item">
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      fontWeight: 600,
                      color: 'var(--color-text)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.title}
                  </div>
                  <span
                    className="suggestion-reason"
                    style={{
                      color: badgeColor,
                      backgroundColor: 'var(--color-surface-subtle)',
                      padding: '1px 7px',
                      borderRadius: '9999px',
                    }}
                  >
                    {item.reason}
                  </span>
                </div>

                <button
                  type="button"
                  className="myday-icon-btn"
                  onClick={() => onAdd(item.id)}
                  title="Thêm vào Kế hoạch hôm nay"
                >
                  <Plus size={13} />
                  <span>Thêm</span>
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
};
