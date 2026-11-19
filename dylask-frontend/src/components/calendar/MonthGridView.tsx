import React, { useMemo, useState } from 'react';
import { Repeat, Plus, CheckCircle2, Circle } from 'lucide-react';
import type { CalendarTask, TaskStatus } from '@/types/task';

interface MonthGridViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onSelectDateToCreate: (dateStr: string) => void;
  onSelectTask: (taskId: number) => void;
  onToggleTaskStatus: (taskId: number, currentStatus: TaskStatus) => void;
  onRescheduleTask: (taskId: number, targetDateStr: string) => void;
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function toLocalDateKey(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

/**
 * Lưới Tháng (Month Grid View) hiển thị 7 cột x 6 hàng.
 * Hỗ trợ tối đa 3 thẻ/ô (+N việc nữa), click ô trống tạo task nhanh, và kéo thả đổi ngày.
 */
export const MonthGridView: React.FC<MonthGridViewProps> = ({
  currentDate,
  tasks,
  onSelectDateToCreate,
  onSelectTask,
  onToggleTaskStatus,
  onRescheduleTask,
}) => {
  const [dragOverDateKey, setDragOverDateKey] = useState<string | null>(null);

  const todayKey = useMemo(() => toLocalDateKey(new Date()), []);
  const activeMonth = currentDate.getMonth();

  const days = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const offset = (firstOfMonth.getDay() + 6) % 7;
    const start = new Date(year, month, 1 - offset);

    const list: Date[] = [];
    for (let i = 0; i < 42; i++) {
      list.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
    }
    return list;
  }, [currentDate]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const key = toLocalDateKey(new Date(task.dueDate));
      const existing = map.get(key) ?? [];
      existing.push(task);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  return (
    <div className="month-grid-container">
      <div className="month-weekdays-header">
        {WEEKDAY_LABELS.map((label) => (
          <div key={label} className="month-weekday-cell">
            {label}
          </div>
        ))}
      </div>

      <div className="month-cells-grid">
        {days.map((day) => {
          const dateKey = toLocalDateKey(day);
          const isOutside = day.getMonth() !== activeMonth;
          const isToday = dateKey === todayKey;
          const dayTasks = tasksByDate.get(dateKey) ?? [];
          const visibleTasks = dayTasks.slice(0, 3);
          const extraCount = dayTasks.length - visibleTasks.length;

          return (
            <div
              key={dateKey}
              className={`month-day-cell ${isOutside ? 'is-outside' : ''} ${
                isToday ? 'is-today' : ''
              } ${dragOverDateKey === dateKey ? 'is-drag-over' : ''}`}
              onClick={() => onSelectDateToCreate(dateKey)}
              onDragOver={(e) => {
                e.preventDefault();
                if (dragOverDateKey !== dateKey) {
                  setDragOverDateKey(dateKey);
                }
              }}
              onDragLeave={() => {
                if (dragOverDateKey === dateKey) {
                  setDragOverDateKey(null);
                }
              }}
              onDrop={(e) => {
                e.preventDefault();
                setDragOverDateKey(null);
                const taskIdStr = e.dataTransfer.getData('text/plain');
                const taskId = Number(taskIdStr);
                if (!Number.isNaN(taskId) && taskId > 0) {
                  onRescheduleTask(taskId, dateKey);
                }
              }}
            >
              <div className="month-day-header">
                <span className="month-day-number">{day.getDate()}</span>
                <span className="month-day-add-hint" title="Thêm công việc ngày này">
                  <Plus size={12} />
                </span>
              </div>

              <div className="month-day-tasks">
                {visibleTasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData('text/plain', String(task.id));
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTask(task.id);
                    }}
                    className={`calendar-task-chip priority-${task.priority} ${
                      task.status === 'done' ? 'is-done' : ''
                    }`}
                    title={task.title}
                  >
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleTaskStatus(task.id, task.status);
                      }}
                      style={{
                        border: 'none',
                        background: 'transparent',
                        padding: 0,
                        display: 'inline-flex',
                        color: task.status === 'done' ? 'var(--color-success)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                        flexShrink: 0,
                      }}
                      aria-label="Đánh dấu hoàn thành"
                    >
                      {task.status === 'done' ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                    </button>
                    <span className="calendar-task-title">{task.title}</span>
                    {task.isRecurring && (
                      <Repeat size={11} style={{ color: 'var(--color-primary)', flexShrink: 0 }} />
                    )}
                  </div>
                ))}

                {extraCount > 0 && (
                  <div className="calendar-more-badge">+{extraCount} việc nữa</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
