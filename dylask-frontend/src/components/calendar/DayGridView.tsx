import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { CalendarTask, TaskStatus } from '@/types/task';
import { CalendarTaskChip } from '@/components/calendar/CalendarTaskChip';
import { formatVietnameseDateLabel, toLocalDateKey } from '@/components/calendar/calendarUtils';

interface DayGridViewProps {
  currentDate: Date;
  tasks: CalendarTask[];
  onSelectDateToCreate: (dateStr: string) => void;
  onSelectTask: (taskId: number) => void;
  onToggleTaskStatus: (taskId: number, currentStatus: TaskStatus) => void;
  onRescheduleTask: (taskId: number, targetDateStr: string, targetHour?: number) => void;
}

const HOURS_24 = Array.from({ length: 24 }, (_, i) => i);

/**
 * Chế độ Ngày (Day View) hiển thị header ngày đang xem và dòng thời gian 24 giờ.
 * Hỗ trợ vạch thời gian hiện tại và kéo thả công việc giữa các khung giờ.
 */
export const DayGridView: React.FC<DayGridViewProps> = ({
  currentDate,
  tasks,
  onSelectDateToCreate,
  onSelectTask,
  onToggleTaskStatus,
  onRescheduleTask,
}) => {
  const [dragOverHour, setDragOverHour] = useState<number | null>(null);
  const dateKey = useMemo(() => toLocalDateKey(currentDate), [currentDate]);
  const now = new Date();
  const isToday = dateKey === toLocalDateKey(now);
  const currentHour = now.getHours();
  const currentMinutePercent = Math.round((now.getMinutes() / 60) * 100);

  const dayTasks = useMemo(() => {
    return tasks.filter((task) => task.dueDate && toLocalDateKey(new Date(task.dueDate)) === dateKey);
  }, [tasks, dateKey]);

  const tasksByHour = useMemo(() => {
    const map = new Map<number, CalendarTask[]>();
    for (const task of dayTasks) {
      const hour = new Date(task.dueDate).getHours();
      const existing = map.get(hour) ?? [];
      existing.push(task);
      map.set(hour, existing);
    }
    return map;
  }, [dayTasks]);

  return (
    <div className="timeline-grid-container">
      <div className="day-view-header">
        <div className="day-view-header-left">
          <span className="day-view-header-title">{formatVietnameseDateLabel(currentDate)}</span>
          {isToday && <span className="month-today-tag">Hôm nay</span>}
          <span className="day-view-count-pill">{dayTasks.length} công việc</span>
        </div>
        <button
          type="button"
          className="day-view-add-btn"
          onClick={() => onSelectDateToCreate(dateKey)}
        >
          <Plus size={13} />
          <span>Thêm vào ngày này</span>
        </button>
      </div>

      <div className="timeline-scroll-body">
        {HOURS_24.map((hour) => {
          const slotTasks = tasksByHour.get(hour) ?? [];
          const showTimeLine = isToday && hour === currentHour;

          return (
            <div key={hour} className="day-hour-row">
              <div className="timeline-hour-label">{String(hour).padStart(2, '0')}:00</div>
              <div
                className={`timeline-slot-cell ${isToday ? 'is-today-column' : ''} ${
                  dragOverHour === hour ? 'is-drag-over' : ''
                }`}
                onClick={() => onSelectDateToCreate(dateKey)}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (dragOverHour !== hour) setDragOverHour(hour);
                }}
                onDragLeave={() => {
                  if (dragOverHour === hour) setDragOverHour(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setDragOverHour(null);
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
                    variant="detailed"
                    onSelect={onSelectTask}
                    onToggleStatus={onToggleTaskStatus}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
