import React from 'react';
import { Repeat, CheckCircle2, Circle } from 'lucide-react';
import type { CalendarTask, TaskStatus } from '@/types/task';
import { getPriorityLabel, isCalendarTaskOverdue } from '@/components/calendar/calendarUtils';

interface CalendarTaskChipProps {
  task: CalendarTask;
  variant?: 'compact' | 'detailed';
  draggable?: boolean;
  onSelect: (taskId: number) => void;
  onToggleStatus: (taskId: number, currentStatus: TaskStatus) => void;
}

/**
 * Thẻ công việc dùng chung trên các lưới Lịch (Tháng / Tuần / Ngày).
 * Hiển thị màu viền ưu tiên, trạng thái quá hạn, icon lặp lại và hỗ trợ kéo thả.
 */
export const CalendarTaskChip: React.FC<CalendarTaskChipProps> = ({
  task,
  variant = 'compact',
  draggable = true,
  onSelect,
  onToggleStatus,
}) => {
  const isDone = task.status === 'done';
  const isOverdue = isCalendarTaskOverdue(task);

  return (
    <div
      draggable={draggable}
      onDragStart={(e) => {
        if (!draggable) return;
        e.dataTransfer.setData('text/plain', String(task.id));
        e.stopPropagation();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(task.id);
      }}
      className={`calendar-task-chip priority-${task.priority} ${isDone ? 'is-done' : ''} ${
        isOverdue ? 'is-overdue' : ''
      } ${variant === 'detailed' ? 'is-detailed' : ''}`}
      title={`${task.title}${isOverdue ? ' (Quá hạn)' : ''}`}
    >
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(task.id, task.status);
        }}
        className={`calendar-chip-check ${isDone ? 'done' : ''}`}
        aria-label={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
      >
        {isDone ? <CheckCircle2 size={12} /> : <Circle size={12} />}
      </button>

      <span className="calendar-task-title">{task.title}</span>

      {variant === 'detailed' && (
        <span className="calendar-chip-meta">
          {task.categoryName && (
            <span className="calendar-chip-tag">{task.categoryName}</span>
          )}
          <span className={`calendar-chip-prio prio-${task.priority}`}>
            {getPriorityLabel(task.priority)}
          </span>
        </span>
      )}

      {task.isRecurring && (
        <Repeat
          size={11}
          style={{ color: 'var(--color-primary)', flexShrink: 0 }}
          aria-label="Lặp lại định kỳ"
        />
      )}
    </div>
  );
};
