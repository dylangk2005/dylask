import React, { useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import type { CalendarTask, TaskStatus } from '@/types/task';
import { CalendarTaskChip } from '@/components/calendar/CalendarTaskChip';
import { DAY_SHORT_LABELS, toLocalDateKey } from '@/components/calendar/calendarUtils';

interface MonthGridViewProps {
  currentDate: Date;
  selectedDateKey: string;
  tasks: CalendarTask[];
  onSelectDate: (dateStr: string) => void;
  onSelectDateToCreate: (dateStr: string) => void;
  onShowMoreForDate: (dateStr: string) => void;
  onSelectTask: (taskId: number) => void;
  onToggleTaskStatus: (taskId: number, currentStatus: TaskStatus) => void;
  onRescheduleTask: (taskId: number, targetDateStr: string) => void;
}

/**
 * Lưới Tháng (Month Grid View) hiển thị 7 cột x 6 hàng.
 * Hỗ trợ chọn ngày xem Agenda, bấm nút (+) hoặc double-click để tạo task,
 * bấm "+N việc nữa" để xem đầy đủ việc trong ngày và kéo thả đổi hạn.
 */
export const MonthGridView: React.FC<MonthGridViewProps> = ({
  currentDate,
  selectedDateKey,
  tasks,
  onSelectDate,
  onSelectDateToCreate,
  onShowMoreForDate,
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
        {DAY_SHORT_LABELS.map((label, idx) => (
          <div
            key={label}
            className={`month-weekday-cell ${idx >= 5 ? 'is-weekend' : ''}`}
          >
            {label}
          </div>
        ))}
      </div>

      <div className="month-cells-grid">
        {days.map((day, idx) => {
          const dateKey = toLocalDateKey(day);
          const isOutside = day.getMonth() !== activeMonth;
          const isToday = dateKey === todayKey;
          const isSelected = dateKey === selectedDateKey;
          const isWeekend = idx % 7 >= 5;
          const dayTasks = tasksByDate.get(dateKey) ?? [];
          const visibleTasks = dayTasks.slice(0, 3);
          const extraCount = dayTasks.length - visibleTasks.length;

          return (
            <div
              key={dateKey}
              className={`month-day-cell ${isOutside ? 'is-outside' : ''} ${
                isWeekend ? 'is-weekend' : ''
              } ${isToday ? 'is-today' : ''} ${isSelected ? 'is-selected' : ''} ${
                dragOverDateKey === dateKey ? 'is-drag-over' : ''
              }`}
              onClick={() => onSelectDate(dateKey)}
              onDoubleClick={() => onSelectDateToCreate(dateKey)}
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
                <div className="month-day-number-wrap">
                  <span className="month-day-number">{day.getDate()}</span>
                  {isToday && <span className="month-today-tag">Hôm nay</span>}
                </div>
                <button
                  type="button"
                  className="month-day-add-btn"
                  title="Thêm công việc vào ngày này"
                  aria-label={`Thêm công việc ngày ${dateKey}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectDateToCreate(dateKey);
                  }}
                >
                  <Plus size={12} />
                </button>
              </div>

              <div className="month-day-tasks">
                {visibleTasks.map((task) => (
                  <CalendarTaskChip
                    key={task.id}
                    task={task}
                    onSelect={onSelectTask}
                    onToggleStatus={onToggleTaskStatus}
                  />
                ))}

                {extraCount > 0 && (
                  <button
                    type="button"
                    className="calendar-more-badge"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShowMoreForDate(dateKey);
                    }}
                  >
                    +{extraCount} việc nữa
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
