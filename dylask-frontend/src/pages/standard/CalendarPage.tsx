import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Loader2, AlertCircle } from 'lucide-react';
import { useCalendar, type CalendarViewMode } from '@/hooks/useCalendar';
import { useToast } from '@/hooks/useToast';
import { taskApi } from '@/api/task.api';
import { MonthGridView } from '@/components/calendar/MonthGridView';
import { WeekGridView } from '@/components/calendar/WeekGridView';
import { DayGridView } from '@/components/calendar/DayGridView';
import { CreateTaskModal } from '@/components/task/CreateTaskModal';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import type { CreateTaskPayload } from '@/types/task';
import './calendar.css';

const VIEW_LABELS: { mode: CalendarViewMode; label: string }[] = [
  { mode: 'month', label: 'Tháng' },
  { mode: 'week', label: 'Tuần' },
  { mode: 'day', label: 'Ngày' },
];

/**
 * Màn hình Lịch Trình (CalendarPage) hỗ trợ xem Tháng / Tuần / Ngày,
 * thêm nhanh theo ngày, kéo thả đổi hạn và theo dõi công việc lặp lại.
 */
export const CalendarPage: React.FC = () => {
  const {
    viewMode,
    setViewMode,
    currentDate,
    tasks,
    isLoading,
    error,
    goToday,
    goPrev,
    goNext,
    refresh,
    toggleTaskStatus,
    rescheduleTask,
  } = useCalendar();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [defaultDueDate, setDefaultDueDate] = useState<string>('');
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const { showToast } = useToast();

  const headerTitle = useMemo(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();
    if (viewMode === 'day') {
      return `${currentDate.getDate()} Tháng ${month}, ${year}`;
    }
    return `Tháng ${month}, ${year}`;
  }, [currentDate, viewMode]);

  const handleOpenCreateForDate = (dateStr: string) => {
    setDefaultDueDate(dateStr);
    setIsCreateOpen(true);
  };

  const handleCreateTask = async (payload: CreateTaskPayload) => {
    const created = await taskApi.createTask(payload);
    await refresh();
    showToast(`Đã tạo "${created.title}" trên lịch`, 'success');
    return created;
  };

  return (
    <div className="calendar-page">
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <h1 className="calendar-title">{headerTitle}</h1>
          <div className="calendar-nav-group">
            <button type="button" className="calendar-btn" onClick={goToday}>
              Hôm nay
            </button>
            <button
              type="button"
              className="calendar-btn calendar-btn-icon"
              onClick={goPrev}
              aria-label="Khoảng thời gian trước"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="calendar-btn calendar-btn-icon"
              onClick={goNext}
              aria-label="Khoảng thời gian sau"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-toolbar-right">
          <div className="calendar-view-switcher" role="tablist" aria-label="Chế độ xem lịch">
            {VIEW_LABELS.map((item) => (
              <button
                key={item.mode}
                type="button"
                role="tab"
                aria-selected={viewMode === item.mode}
                className={`calendar-view-tab ${viewMode === item.mode ? 'active' : ''}`}
                onClick={() => setViewMode(item.mode)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            className="calendar-btn calendar-btn-primary"
            onClick={() => handleOpenCreateForDate('')}
          >
            <Plus size={15} />
            <span>Thêm công việc</span>
          </button>
        </div>
      </div>

      {isLoading && tasks.length === 0 ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: 'var(--color-text-muted)',
          }}
        >
          <Loader2 className="spinner" size={20} color="var(--color-primary)" />
          <span>Đang tải lịch công việc...</span>
        </div>
      ) : error ? (
        <div
          style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            color: 'var(--color-danger)',
          }}
        >
          <AlertCircle size={24} />
          <span>{error}</span>
          <button type="button" className="calendar-btn" onClick={refresh}>
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {viewMode === 'month' && (
            <MonthGridView
              currentDate={currentDate}
              tasks={tasks}
              onSelectDateToCreate={handleOpenCreateForDate}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onToggleTaskStatus={toggleTaskStatus}
              onRescheduleTask={(taskId, targetDate) => {
                void rescheduleTask(taskId, targetDate);
                showToast(`Đã dời lịch sang ${targetDate}`, 'info');
              }}
            />
          )}
          {viewMode === 'week' && (
            <WeekGridView
              currentDate={currentDate}
              tasks={tasks}
              onSelectDateToCreate={handleOpenCreateForDate}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onToggleTaskStatus={toggleTaskStatus}
            />
          )}
          {viewMode === 'day' && (
            <DayGridView
              currentDate={currentDate}
              tasks={tasks}
              onSelectDateToCreate={handleOpenCreateForDate}
              onSelectTask={(id) => setSelectedTaskId(id)}
              onToggleTaskStatus={toggleTaskStatus}
            />
          )}
        </>
      )}

      <CreateTaskModal
        key={defaultDueDate || 'new-task'}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreate={handleCreateTask}
        defaultDueDate={defaultDueDate}
      />

      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={() => {
          void refresh();
        }}
        onDeleted={() => {
          void refresh();
        }}
      />
    </div>
  );
};
