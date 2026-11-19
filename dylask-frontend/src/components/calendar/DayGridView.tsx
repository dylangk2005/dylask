import React, { useMemo } from 'react';
import { Repeat, CheckCircle2, Circle } from 'lucide-react';
import type { CalendarTask, TaskStatus } from '@/types/task';

interface DayGridViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onSelectDateToCreate: (dateStr: string) => void;
  onSelectTask: (taskId: number) => void;
  onToggleTaskStatus: (taskId: number, currentStatus: TaskStatus) => void;
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Chế độ Ngày (Day View) hiển thị dòng thời gian 24 giờ cho ngày đang chọn.
 */
export const DayGridView: React.FC<DayGridViewProps> = ({
  currentDate,
  tasks,
  onSelectDateToCreate,
  onSelectTask,
  onToggleTaskStatus,
}) => {
  const dateKey = useMemo(() => toDateKey(currentDate), [currentDate]);

  const tasksByHour = useMemo(() => {
    const map = new Map<number, CalendarTask[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const d = new Date(task.dueDate);
      if (toDateKey(d) !== dateKey) continue;
      const hour = d.getHours();
      const existing = map.get(hour) ?? [];
      existing.push(task);
      map.set(hour, existing);
    }
    return map;
  }, [tasks, dateKey]);

  return (
    <div className="timeline-grid-container">
      <div className="timeline-scroll-body">
        {HOURS_24.map((hour) => {
          const slotTasks = tasksByHour.get(hour) ?? [];
          return (
            <div key={hour} className="day-hour-row">
              <div className="timeline-hour-label">{String(hour).padStart(2, '0')}:00</div>
              <div className="timeline-slot-cell" onClick={() => onSelectDateToCreate(dateKey)}>
                {slotTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTask(task.id);
                    }}
                    className={`calendar-task-chip priority-${task.priority} ${
                      task.status === 'done' ? 'is-done' : ''
                    }`}
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
                        color:
                          task.status === 'done' ? 'var(--color-success)' : 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      {task.status === 'done' ? <CheckCircle2 size={12} /> : <Circle size={12} />}
                    </button>
                    <span className="calendar-task-title">{task.title}</span>
                    {task.isRecurring && <Repeat size={11} style={{ color: 'var(--color-primary)' }} />}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
