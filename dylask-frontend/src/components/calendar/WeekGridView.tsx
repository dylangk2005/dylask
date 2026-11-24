import React, { useMemo, useState } from 'react';
import type { CalendarTask, TaskStatus } from '@/types/task';
import { CalendarTaskChip } from '@/components/calendar/CalendarTaskChip';
import { DAY_SHORT_LABELS, toLocalDateKey } from '@/components/calendar/calendarUtils';

interface WeekGridViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onSelectDateToCreate: (dateStr: string) => void;
  onSelectTask: (taskId: number) => void;
  onToggleTaskStatus: (taskId: number, currentStatus: TaskStatus) => void;
  onRescheduleTask: (taskId: number, targetDateStr: string, targetHour?: number) => void;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 06:00 -> 22:00

/**
 * Lưới Tuần (Week View) hiển thị 7 ngày từ 06:00 đến 22:00.
 * Nổi bật cột hôm nay, có vạch thời gian hiện tại và hỗ trợ kéo thả đổi ngày/giờ.
 */
export const WeekGridView: React.FC<WeekGridViewProps> = ({
  currentDate,
  tasks,
  onSelectDateToCreate,
  onSelectTask,
  onToggleTaskStatus,
  onRescheduleTask,
}) => {
  const [dragOverSlot, setDragOverSlot] = useState<string | null>(null);
  const now = new Date();
  const todayKey = toLocalDateKey(now);
  const currentHour = Math.min(22, Math.max(6, now.getHours()));
  const currentMinutePercent = Math.round((now.getMinutes() / 60) * 100);

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
      const key = `${toLocalDateKey(d)}-${hour}`;
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
          const key = toDateHeaderKey(day);
          const isToday = key === todayKey;
          return (
            <div
              key={key}
              className={`week-header-cell ${isToday ? 'is-today' : ''}`}
              onClick={() => onSelectDateToCreate(key)}
              title="Nhấn để thêm việc vào ngày này"
              style={{ cursor: 'pointer' }}
            >
              <span>{DAY_SHORT_LABELS[idx]} · </span>
              <span>
                {day.getDate()}/{day.getMonth() + 1}
              </span>
            </div>
          );
        })}
      </div>

      <div className="timeline-scroll-body">
        {HOURS.map((hour) => (
          <div key={hour} className="week-hour-row">
            <div className="timeline-hour-label">{String(hour).padStart(2, '0')}:00</div>
            {weekDays.map((day) => {
              const dateKey = toLocalDateKey(day);
              const slotKey = `${dateKey}-${hour}`;
              const isToday = dateKey === todayKey;
              const slotTasks = tasksByDayAndHour.get(slotKey) ?? [];
              const showTimeLine = isToday && hour === currentHour;

              return (
                <div
                  key={slotKey}
                  className={`timeline-slot-cell ${isToday ? 'is-today-column' : ''} ${
                    dragOverSlot === slotKey ? 'is-drag-over' : ''
                  }`}
                  onClick={() => onSelectDateToCreate(dateKey)}
                  onDragOver={(e) => {
                    e.preventDefault();
                    if (dragOverSlot !== slotKey) setDragOverSlot(slotKey);
                  }}
                  onDragLeave={() => {
                    if (dragOverSlot === slotKey) setDragOverSlot(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverSlot(null);
                    const taskId = Number(e.dataTransfer.getData('text/plain'));
                    if (!Number.isNaN(taskId) && taskId > 0) {
                      onRescheduleTask(taskId, dateKey, hour);
                    }
                  }}
                >
                  {showTimeLine && (
                    <div
                      className="timeline-now-indicator"
                      style={{ top: `${currentMinutePercent}%` }}
                    />
                  )}
                  {slotTasks.map((task) => (
                    <CalendarTaskChip
                      key={task.id}
                      task={task}
                      onSelect={onSelectTask}
                      onToggleStatus={onToggleTaskStatus}
                    />
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

function toDateHeaderKey(day: Date): string {
  return toLocalDateKey(day);
}
