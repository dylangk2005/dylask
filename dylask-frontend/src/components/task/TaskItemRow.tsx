import React from 'react';
import { Check, CheckSquare, Calendar, Trash2, Sun, Repeat, FileText } from 'lucide-react';
import type { TaskSummary } from '@/types/task';

interface TaskItemRowProps {
  task: TaskSummary;
  onToggleStatus: (id: number) => void;
  onSelect: (id: number) => void;
  onDelete: (id: number) => void;
  onToggleMyDay?: (id: number) => void;
}

/**
 * Thẻ hiển thị một đầu việc trong danh sách (TaskItemRow).
 * Hiển thị chỉ báo ưu tiên, hạn chót dạng pill, dấu hiệu ghi chú/lặp lại,
 * cùng nút ghim nhanh vào Kế hoạch hôm nay (My Day).
 */
export const TaskItemRow: React.FC<TaskItemRowProps> = ({
  task,
  onToggleStatus,
  onSelect,
  onDelete,
  onToggleMyDay,
}) => {
  const isDone = task.status === 'done';

  // Định dạng hạn chót kèm phân loại Hôm nay / Quá hạn
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
      text: isToday ? 'Hôm nay' : isPast && !isDone ? `Quá hạn · ${formatted}` : formatted,
      isToday,
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

  // Chỉ báo viền nhấn bên trái cho việc ưu tiên Cao hoặc đang Quá hạn
  const accentClass = !isDone
    ? dueDateInfo?.isOverdue || task.priority === 'high'
      ? 'task-row-urgent'
      : task.priority === 'low'
        ? 'task-row-low'
        : ''
    : '';

  return (
    <div
      onClick={() => onSelect(task.id)}
      className={`task-row-card ${isDone ? 'is-done' : ''} ${accentClass}`}
    >
      {/* Checkbox Button */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggleStatus(task.id);
        }}
        aria-label={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
        className={`task-checkbox-btn ${isDone ? 'checked' : ''}`}
      >
        {isDone && <Check size={13} strokeWidth={3} />}
      </button>

      {/* Nội dung & Metadata */}
      <div className="task-row-body">
        <div className="task-row-title-line">
          <span className={`task-row-title ${isDone ? 'done' : ''}`}>
            {task.title}
          </span>
          {task.description && (
            <span className="task-row-meta-icon" title="Có ghi chú chi tiết">
              <FileText size={13} />
            </span>
          )}
          {task.isRecurring && (
            <span className="task-row-meta-icon recurring" title="Công việc lặp lại định kỳ">
              <Repeat size={13} />
            </span>
          )}
        </div>

        <div className="task-row-badges">
          {/* Priority Badge */}
          <span
            className="task-prio-badge"
            style={{
              color: prio.color,
              backgroundColor: prio.bg,
              borderColor: prio.border,
            }}
          >
            {prio.label}
          </span>

          {/* Category Tag */}
          {task.categoryName && (
            <span className="task-category-tag">{task.categoryName}</span>
          )}

          {/* Due date Badge */}
          {dueDateInfo && (
            <span
              className={`task-due-badge ${
                dueDateInfo.isOverdue
                  ? 'overdue'
                  : dueDateInfo.isToday
                    ? 'today'
                    : ''
              }`}
            >
              <Calendar size={11} />
              {dueDateInfo.text}
            </span>
          )}

          {/* Checklist Counter */}
          {task.totalChecklists > 0 && (
            <span className="task-checklist-counter">
              <CheckSquare size={12} />
              {task.completedChecklists}/{task.totalChecklists}
            </span>
          )}
        </div>
      </div>

      {/* Nhóm thao tác nhanh bên phải */}
      <div className="task-row-actions">
        {onToggleMyDay && !isDone && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleMyDay(task.id);
            }}
            title={task.isMyDay ? 'Gỡ khỏi Kế hoạch hôm nay' : 'Thêm vào Kế hoạch hôm nay'}
            className={`task-myday-btn ${task.isMyDay ? 'active' : ''}`}
          >
            <Sun size={14} />
            <span>{task.isMyDay ? 'Hôm nay' : '+ Hôm nay'}</span>
          </button>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
          title="Xóa công việc"
          className="delete-hover-btn"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  );
};

