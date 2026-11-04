import React from 'react';
import { Check, CheckSquare, Calendar, Trash2 } from 'lucide-react';
import type { TaskSummary } from '@/types/task';

interface TaskItemRowProps {
  task: TaskSummary;
  onToggleStatus: (id: number) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
}

/**
 * Thẻ hiển thị một đầu việc trong danh sách (TaskItemRow).
 * Áp dụng hiệu ứng hover lift, focus-ring, và chuyển đổi trạng thái gạch ngang mượt mà.
 */
export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  onToggleStatus,
  onSelect,
  onDelete,
}) => {
  const isDone = task.status === 'done';

  // Định dạng ngày do date
  const formatDueDate = (dateStr?: string | null) => {
    if (!dateStr) return null;
    const date = new Date(dateStr);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    const isPast = date.getTime() < now.getTime() && !isToday;

    const formatted = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;

    return {
      text: isToday ? 'Hôm nay' : formatted,
      isOverdue: isPast && !isDone,
    };
  };

  const dueDateInfo = formatDueDate(task.dueDate);

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'high':
        return { color: '#DC2626', bg: '#FEF2F2', border: '#FECACA', label: 'Cao' };
      case 'low':
        return { color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE', label: 'Thấp' };
      default:
        return { color: '#D97706', bg: '#FFFBEB', border: '#FDE68A', label: 'Vừa' };
    }
  };

  const prio = getPriorityStyle(task.priority);

  return (
    <div
      onClick={() => onSelect(task.id)}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: 'var(--border-width) solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        cursor: 'pointer',
        transition: 'var(--transition-smooth)',
        position: 'relative',
        opacity: isDone ? 0.65 : 1,
      }}
      className="task-row-card"
    >
      {/* Checkbox Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(task.id);
        }}
        aria-label={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
        style={{
          width: '20px',
          height: '20px',
          borderRadius: '50%',
          border: isDone
            ? 'none'
            : '2px solid var(--color-border-strong)',
          backgroundColor: isDone ? 'var(--color-primary)' : 'var(--color-surface)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          flexShrink: 0,
          transition: 'var(--transition-fast)',
          padding: 0,
        }}
        className="task-checkbox-btn"
      >
        {isDone && <Check size={13} strokeWidth={3} />}
      </button>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '3px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span
            style={{
              fontSize: 'var(--font-size-base)',
              fontWeight: 500,
              color: 'var(--color-text)',
              textDecoration: isDone ? 'line-through' : 'none',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {task.title}
          </span>
        </div>

        {/* Metadata badges */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 'var(--space-2)',
            fontSize: 'var(--font-size-xs)',
          }}
        >
          {/* Priority Badge */}
          <span
            style={{
              color: prio.color,
              backgroundColor: prio.bg,
              border: `1px solid ${prio.border}`,
              padding: '1px 6px',
              borderRadius: 'var(--radius-sm)',
              fontWeight: 600,
            }}
          >
            {prio.label}
          </span>

          {/* Category Tag */}
          {task.categoryName && (
            <span
              style={{
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: '1px solid var(--color-border)',
                padding: '1px 6px',
                borderRadius: 'var(--radius-sm)',
              }}
            >
              {task.categoryName}
            </span>
          )}

          {/* Due date Badge */}
          {dueDateInfo && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                color: dueDateInfo.isOverdue ? 'var(--color-danger)' : 'var(--color-text-muted)',
                fontWeight: dueDateInfo.isOverdue ? 600 : 400,
              }}
            >
              <Calendar size={12} />
              {dueDateInfo.text}
            </span>
          )}

          {/* Checklist Counter */}
          {task.totalChecklists > 0 && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px',
                color: 'var(--color-text-muted)',
              }}
            >
              <CheckSquare size={12} />
              {task.completedChecklists}/{task.totalChecklists}
            </span>
          )}
        </div>
      </div>

      {/* Delete quick action */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(task.id);
        }}
        title="Xóa công việc"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--color-text-muted)',
          cursor: 'pointer',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'var(--transition-fast)',
          opacity: 0.6,
        }}
        className="delete-hover-btn"
      >
        <Trash2 size={16} />
      </button>
    </div>
  );
};

