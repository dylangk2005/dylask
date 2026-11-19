import React, { useMemo } from 'react';
import { Repeat, CheckCircle2, Circle } from 'lucide-react';
import type { CalendarTask, TaskStatus } from '@/types/task';

interface WeekGridViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onSelectDateToCreate: (dateStr: string) => void;
  onSelectTask: (taskId: number) => void;
  onToggleTaskStatus: (taskId: number, currentStatus: TaskStatus) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 -> 22:00
const DAY_SHORT = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

function toDateKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Lưới Tuần (Week View) hiển thị 7 ngày từ 06:00 đến 22:00.
 */
export const WeekGridView: React.FC<WeekGridViewProps> = ({
  currentDate,
  tasks,
  onSelectDateToCreate,
  onSelectTask,
  onToggleTaskStatus,
}) => {
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const weekDays = useMemo(() => {
    const offset = (currentDate.getDay() + 6) % 7;
    const start = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      currentDate.getDate() - offset
    );
    return Array.from({ length: 7 }, (_, i) => {
      return new Date(start.getFullYear(), start.getMonth(), start.getDate() + i);
    });
  }, [currentDate]);

  const tasksByDayAndHour = useMemo(() => {
    const map = new Map<string, CalendarTask[]>();
    for (const task of tasks) {
      if (!task.dueDate) continue;
      const d = new Date(task.dueDate);
      const hour = Math.min(22, Math.max(6, d.getHours()));
      const key = `${toDateKey(d)}-${hour}`;
      const existing = map.get(key) ?? [];
      existing.push(task);
      map.set(key, existing);
    }
    return map;
  }, [tasks]);

  return (
    <div className="timeline-grid-container">
      <div className="week-header-row">
        <div className="week-header-cell" style={{ borderLeft: 'none' }}>
          Giờ
        </div>
        {weekDays.map((day, idx) => {
          const key = toDateKey(day);
          return (
            <div key={key} className={`week-header-cell ${key === todayKey ? 'is-today' : ''}`}>
              {DAY_SHORT[idx]} · {day.getDate()}/{day.getMonth() + 1}
            </div>
          );
        })}
      </div>

      <div className="timeline-scroll-body">
        {HOURS.map((hour) => (
          <div key={hour} className="week-hour-row">
            <div className="timeline-hour-label">{String(hour).padStart(2, '0')}:00</div>
            {weekDays.map((day) => {
              const dateKey = toDateKey(day);
              const slotTasks = tasksByDayAndHour.get(`${dateKey}-${hour}`) ?? [];
              return (
                <div
                  key={`${dateKey}-${hour}`}
                  className="timeline-slot-cell"
                  onClick={() => onSelectDateToCreate(dateKey)}
                >
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
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};
