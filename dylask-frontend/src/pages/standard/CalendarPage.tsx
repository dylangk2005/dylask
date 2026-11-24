import React, { useMemo, useState, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  AlertCircle,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  PanelRight,
  RefreshCw,
  X,
  CalendarPlus,
} from 'lucide-react';
import { useCalendar, type CalendarViewMode } from '@/hooks/useCalendar';
import { useToast } from '@/hooks/useToast';
import { taskApi } from '@/api/task.api';
import { MonthGridView } from '@/components/calendar/MonthGridView';
import { WeekGridView } from '@/components/calendar/WeekGridView';
import { DayGridView } from '@/components/calendar/DayGridView';
import { CalendarTaskChip } from '@/components/calendar/CalendarTaskChip';
import {
  formatVietnameseDateLabel,
  isCalendarTaskOverdue,
  toLocalDateKey,
} from '@/components/calendar/calendarUtils';
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
 * bảng chi tiết ngày (Day Agenda), kéo thả đổi hạn trên cả 3 chế độ và phím tắt nhanh.
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
  const [selectedDateKey, setSelectedDateKey] = useState<string>(() => toLocalDateKey(new Date()));
  const [isAgendaOpen, setIsAgendaOpen] = useState<boolean>(true);
  const [hideCompleted, setHideCompleted] = useState<boolean>(false);
  const { showToast } = useToast();

  // Phím tắt điều hướng lịch khi không focus vào ô nhập liệu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (document.activeElement?.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (isCreateOpen || selectedTaskId !== null) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setDefaultDueDate(viewMode === 'month' ? selectedDateKey : toLocalDateKey(currentDate));
        setIsCreateOpen(true);
      } else if (e.key === 't' || e.key === 'T') {
        e.preventDefault();
        goToday();
        setSelectedDateKey(toLocalDateKey(new Date()));
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        goPrev();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        goNext();
      } else if (e.key === '1') {
        setViewMode('month');
      } else if (e.key === '2') {
        setViewMode('week');
      } else if (e.key === '3') {
        setViewMode('day');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isCreateOpen,
    selectedTaskId,
    viewMode,
    selectedDateKey,
    currentDate,
    goToday,
    goPrev,
    goNext,
    setViewMode,
  ]);

  const headerTitle = useMemo(() => {
    const month = currentDate.getMonth() + 1;
    const year = currentDate.getFullYear();

    if (viewMode === 'day') {
      return `${currentDate.getDate()} Tháng ${month}, ${year}`;
    }

    if (viewMode === 'week') {
      const offset = (currentDate.getDay() + 6) % 7;
      const start = new Date(year, currentDate.getMonth(), currentDate.getDate() - offset);
      const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
      return `Tuần ${start.getDate()}/${start.getMonth() + 1} – ${end.getDate()}/${end.getMonth() + 1}, ${end.getFullYear()}`;
    }

    return `Tháng ${month}, ${year}`;
  }, [currentDate, viewMode]);

  const periodStats = useMemo(() => {
    const done = tasks.filter((t) => t.status === 'done').length;
    const overdue = tasks.filter((t) => isCalendarTaskOverdue(t)).length;
    return { total: tasks.length, done, overdue };
  }, [tasks]);

  const visibleTasks = useMemo(
    () => (hideCompleted ? tasks.filter((t) => t.status !== 'done') : tasks),
    [tasks, hideCompleted]
  );

  const selectedDateObj = useMemo(() => {
    const [yyyy, mm, dd] = selectedDateKey.split('-').map(Number);
    return new Date(yyyy, mm - 1, dd);
  }, [selectedDateKey]);

  const selectedDayTasks = useMemo(
    () =>
      visibleTasks.filter(
        (t) => t.dueDate && toLocalDateKey(new Date(t.dueDate)) === selectedDateKey
      ),
    [visibleTasks, selectedDateKey]
  );

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

  const handleReschedule = async (taskId: number, targetDate: string, targetHour?: number) => {
    const ok = await rescheduleTask(taskId, targetDate, targetHour);
    if (ok) {
      const [, mm, dd] = targetDate.split('-');
      const timeLabel = targetHour !== undefined ? ` lúc ${String(targetHour).padStart(2, '0')}:00` : '';
      showToast(`Đã dời lịch sang ${dd}/${mm}${timeLabel}`, 'info');
    } else {
      showToast('Không thể dời lịch công việc. Vui lòng thử lại.', 'error');
    }
  };

  const handleGoToday = () => {
    goToday();
    setSelectedDateKey(toLocalDateKey(new Date()));
  };

  const isSelectedDateToday = selectedDateKey === toLocalDateKey(new Date());

  return (
    <div className="calendar-page">
      {/* Toolbar đồng bộ cùng hệ thống Standard Workspace */}
      <div className="calendar-toolbar">
        <div className="calendar-toolbar-left">
          <span className="calendar-icon-badge" aria-hidden="true">
            <CalendarIcon size={19} strokeWidth={2.2} />
          </span>

          <div className="calendar-title-block">
            <div className="calendar-title-row">
              <h1 className="calendar-title">{headerTitle}</h1>
              <div className="calendar-summary-pills">
                <span className="calendar-summary-pill">
                  {periodStats.done}/{periodStats.total} việc hoàn thành
                </span>
                {periodStats.overdue > 0 && (
                  <span className="calendar-summary-pill danger">
                    {periodStats.overdue} quá hạn
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="calendar-nav-group">
            <button
              type="button"
              className="calendar-btn"
              onClick={handleGoToday}
              title="Quay về hôm nay (Phím T)"
            >
              Hôm nay
            </button>
            <button
              type="button"
              className="calendar-btn calendar-btn-icon"
              onClick={goPrev}
              aria-label="Khoảng thời gian trước"
              title="Kỳ trước (←)"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              type="button"
              className="calendar-btn calendar-btn-icon"
              onClick={goNext}
              aria-label="Khoảng thời gian sau"
              title="Kỳ sau (→)"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="calendar-toolbar-right">
          <button
            type="button"
            className={`calendar-btn ${hideCompleted ? 'is-toggled' : ''}`}
            onClick={() => setHideCompleted((prev) => !prev)}
            title={hideCompleted ? 'Hiện lại việc đã xong' : 'Ẩn việc đã hoàn thành'}
          >
            {hideCompleted ? <EyeOff size={14} /> : <Eye size={14} />}
            <span className="calendar-btn-label">
              {hideCompleted ? 'Đang ẩn việc xong' : 'Ẩn việc xong'}
            </span>
          </button>

          {viewMode === 'month' && (
            <button
              type="button"
              className={`calendar-btn ${isAgendaOpen ? 'is-toggled' : ''}`}
              onClick={() => setIsAgendaOpen((prev) => !prev)}
              title="Bật/tắt bảng chi tiết ngày"
            >
              <PanelRight size={14} />
              <span className="calendar-btn-label">Chi tiết ngày</span>
            </button>
          )}

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
            className="calendar-btn calendar-btn-icon"
            onClick={refresh}
            title="Làm mới lịch"
            aria-label="Làm mới lịch"
          >
            <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
          </button>

          <button
            type="button"
            className="calendar-btn calendar-btn-primary"
            onClick={() =>
              handleOpenCreateForDate(
                viewMode === 'month' ? selectedDateKey : toLocalDateKey(currentDate)
              )
            }
            title="Thêm công việc mới (Phím C)"
          >
            <Plus size={15} />
            <span>Thêm công việc</span>
            <span className="calendar-kbd-hint">C</span>
          </button>
        </div>
      </div>

      {/* Khu vực nội dung chính */}
      {isLoading && tasks.length === 0 ? (
        <div className="calendar-state-box">
          <Loader2 className="spinner" size={20} color="var(--color-primary)" />
          <span>Đang tải lịch công việc...</span>
        </div>
      ) : error ? (
        <div className="calendar-state-box error">
          <AlertCircle size={24} />
          <span>{error}</span>
          <button type="button" className="calendar-btn" onClick={refresh}>
            Thử lại
          </button>
        </div>
      ) : (
        <div className="calendar-workspace-body">
          <div className="calendar-main-grid">
            {viewMode === 'month' && (
              <MonthGridView
                currentDate={currentDate}
                selectedDateKey={selectedDateKey}
                tasks={visibleTasks}
                onSelectDate={(dateStr) => setSelectedDateKey(dateStr)}
                onSelectDateToCreate={handleOpenCreateForDate}
                onShowMoreForDate={(dateStr) => {
                  setSelectedDateKey(dateStr);
                  setIsAgendaOpen(true);
                }}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onToggleTaskStatus={toggleTaskStatus}
                onRescheduleTask={(taskId, targetDate) => {
                  void handleReschedule(taskId, targetDate);
                }}
              />
            )}
            {viewMode === 'week' && (
              <WeekGridView
                currentDate={currentDate}
                tasks={visibleTasks}
                onSelectDateToCreate={handleOpenCreateForDate}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onToggleTaskStatus={toggleTaskStatus}
                onRescheduleTask={(taskId, targetDate, hour) => {
                  void handleReschedule(taskId, targetDate, hour);
                }}
              />
            )}
            {viewMode === 'day' && (
              <DayGridView
                currentDate={currentDate}
                tasks={visibleTasks}
                onSelectDateToCreate={handleOpenCreateForDate}
                onSelectTask={(id) => setSelectedTaskId(id)}
                onToggleTaskStatus={toggleTaskStatus}
                onRescheduleTask={(taskId, targetDate, hour) => {
                  void handleReschedule(taskId, targetDate, hour);
                }}
              />
            )}
          </div>

          {/* Bảng Chi Tiết Ngày Đang Chọn (hiện ở chế độ Tháng) */}
          {viewMode === 'month' && isAgendaOpen && (
            <aside className="calendar-agenda-panel" aria-label="Chi tiết công việc trong ngày">
              <div className="calendar-agenda-header">
                <div>
                  <div className="calendar-agenda-kicker">
                    <span>LỊCH TRONG NGÀY</span>
                    {isSelectedDateToday && <span className="month-today-tag">Hôm nay</span>}
                  </div>
                  <h2 className="calendar-agenda-date">
                    {formatVietnameseDateLabel(selectedDateObj)}
                  </h2>
                </div>
                <button
                  type="button"
                  className="calendar-agenda-close"
                  onClick={() => setIsAgendaOpen(false)}
                  aria-label="Đóng bảng chi tiết ngày"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="calendar-agenda-body">
                {selectedDayTasks.length === 0 ? (
                  <div className="calendar-agenda-empty">
                    <CalendarPlus size={26} strokeWidth={1.6} color="var(--color-primary)" />
                    <p>Chưa có đầu việc nào được lên lịch cho ngày này.</p>
                    <button
                      type="button"
                      className="calendar-btn calendar-btn-primary"
                      onClick={() => handleOpenCreateForDate(selectedDateKey)}
                    >
                      <Plus size={14} />
                      <span>Thêm việc ngày này</span>
                    </button>
                  </div>
                ) : (
                  <div className="calendar-agenda-list">
                    {selectedDayTasks.map((task) => (
                      <CalendarTaskChip
                        key={task.id}
                        task={task}
                        variant="detailed"
                        onSelect={(id) => setSelectedTaskId(id)}
                        onToggleStatus={toggleTaskStatus}
                      />
                    ))}
                  </div>
                )}
              </div>

              <div className="calendar-agenda-footer">
                {selectedDayTasks.length > 0 && (
                  <button
                    type="button"
                    className="calendar-agenda-add-btn"
                    onClick={() => handleOpenCreateForDate(selectedDateKey)}
                  >
                    <Plus size={14} />
                    <span>Thêm việc cho ngày này</span>
                  </button>
                )}

                <div className="calendar-legend-row">
                  <span className="legend-item">
                    <i className="legend-dot high" /> Cao
                  </span>
                  <span className="legend-item">
                    <i className="legend-dot medium" /> Vừa
                  </span>
                  <span className="legend-item">
                    <i className="legend-dot low" /> Thấp
                  </span>
                  <span className="legend-tip">Kéo thẻ để dời ngày</span>
                </div>
              </div>
            </aside>
          )}
        </div>
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
