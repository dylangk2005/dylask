import React, { useState } from 'react';
import {
  Compass,
  CalendarDays,
  AlertTriangle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Target,
  CheckCircle2,
  Circle,
  Trash2,
  CalendarClock,
  AlertCircle,
  Inbox,
  RefreshCw,
  X,
} from 'lucide-react';
import { usePlanning } from '@/hooks/usePlanning';
import { useToast } from '@/hooks/useToast';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import type { OverdueItem, PlanningTask } from '@/types/planning';
import type { TaskPriority } from '@/types/task';
import './planning.css';

const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Vừa' },
  { value: 'high', label: 'Cao' },
];

function getPriorityLabel(priority: TaskPriority): string {
  switch (priority) {
    case 'high':
      return 'Cao';
    case 'low':
      return 'Thấp';
    default:
      return 'Vừa';
  }
}

function formatShortVnDate(isoDate: string): string {
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;
  return `${parts[2]}/${parts[1]}`;
}

function toLocalDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}

/**
 * Màn hình Lập Kế Hoạch Tuần, 7 Ngày Tới (Upcoming) & Việc Quá Hạn (Overdue).
 */
export const WeeklyPlanningPage: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    weekly,
    upcoming,
    overdue,
    isLoading,
    error,
    refresh,
    toggleTaskStatus,
    scheduleTask,
    createInboxTask,
    createTaskForDate,
    addGoal,
    toggleGoal,
    deleteGoal,
    bulkReschedule,
    goToCurrentWeek,
    shiftWeek,
  } = usePlanning();

  const { showToast } = useToast();

  const [newInboxTitle, setNewInboxTitle] = useState('');
  const [inboxPriority, setInboxPriority] = useState<TaskPriority>('medium');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [dayQuickTitle, setDayQuickTitle] = useState('');
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const todayStr = toLocalDateStr(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toLocalDateStr(tomorrowDate);

  const nextWeekDate = new Date();
  nextWeekDate.setDate(nextWeekDate.getDate() + 7);
  const nextWeekStr = toLocalDateStr(nextWeekDate);

  const handleAddInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInboxTitle.trim()) return;
    await createInboxTask(newInboxTitle.trim(), inboxPriority);
    setNewInboxTitle('');
    showToast('Đã thêm việc vào Hộp chờ', 'success');
  };

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle.trim()) return;
    await addGoal(newGoalTitle.trim());
    setNewGoalTitle('');
    showToast('Đã thêm mục tiêu tuần', 'success');
  };

  const handleAddForDay = async (e: React.FormEvent, dateStr: string) => {
    e.preventDefault();
    if (!dayQuickTitle.trim()) return;
    await createTaskForDate(dayQuickTitle.trim(), dateStr);
    setDayQuickTitle('');
    setAddingDate(null);
    showToast(`Đã lên lịch việc vào ${formatShortVnDate(dateStr)}`, 'success');
  };

  const renderTaskCheckbox = (task: PlanningTask) => {
    const isDone = task.status === 'done';
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          void toggleTaskStatus(task.id, task.status);
        }}
        className={`planning-task-check ${isDone ? 'checked' : ''}`}
        aria-label={isDone ? 'Đánh dấu chưa hoàn thành' : 'Đánh dấu hoàn thành'}
      >
        {isDone ? <CheckCircle2 size={14} /> : <Circle size={14} />}
      </button>
    );
  };

  const renderOverdueSection = (
    title: string,
    items: OverdueItem[],
    variant: 'severe' | 'recent'
  ) => {
    if (items.length === 0) return null;

    return (
      <div className={`planning-group-card overdue-${variant}`}>
        <div className="planning-group-header">
          <div className={`planning-overdue-heading ${variant}`}>
            <AlertTriangle size={15} />
            <span>
              {title} · {items.length} việc
            </span>
          </div>
        </div>

        <div className="planning-rows-list">
          {items.map((item) => (
            <div key={item.task.id} className="planning-row">
              <div className="planning-row-left">
                {renderTaskCheckbox(item.task)}
                <div
                  className="planning-row-info"
                  onClick={() => setSelectedTaskId(item.task.id)}
                >
                  <div className="planning-row-title">{item.task.title}</div>
                  <div className="planning-row-sub">
                    <span className={`planning-overdue-days ${variant}`}>
                      Quá hạn {item.daysOverdue} ngày
                    </span>
                    <span className={`planning-prio-pill prio-${item.task.priority}`}>
                      {getPriorityLabel(item.task.priority)}
                    </span>
                    {item.task.categoryName && (
                      <span className="planning-cat-pill">{item.task.categoryName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="planning-row-actions">
                <button
                  type="button"
                  className="planning-btn planning-btn-primary"
                  onClick={() => {
                    void scheduleTask(item.task.id, todayStr);
                    showToast('Đã dời sang Hôm nay', 'success');
                  }}
                >
                  Hôm nay
                </button>
                <button
                  type="button"
                  className="planning-btn"
                  onClick={() => {
                    void scheduleTask(item.task.id, tomorrowStr);
                    showToast('Đã dời sang Ngày mai', 'info');
                  }}
                >
                  Ngày mai
                </button>
                <button
                  type="button"
                  className="planning-btn"
                  onClick={() => {
                    void scheduleTask(item.task.id, nextWeekStr);
                    showToast('Đã dời sang Tuần tới', 'info');
                  }}
                >
                  Tuần sau
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const completedGoalsCount = weekly
    ? weekly.weeklyGoals.filter((g) => g.isCompleted).length
    : 0;

  return (
    <div className="planning-page">
      <div className="planning-header">
        <div className="planning-title-block">
          <span className="planning-icon-badge" aria-hidden="true">
            <Compass size={20} strokeWidth={2.2} />
          </span>
          <div>
            <h1 className="planning-title">Lập kế hoạch &amp; Điều phối</h1>
            <div className="planning-subtitle">
              Phân bổ việc tồn đọng, theo dõi 7 ngày tới và xử lý việc quá hạn
            </div>
          </div>
        </div>

        <div className="planning-header-right">
          <div className="planning-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'weekly'}
              className={`planning-tab ${activeTab === 'weekly' ? 'active' : ''}`}
              onClick={() => setActiveTab('weekly')}
            >
              <Compass size={14} />
              <span>Kế hoạch tuần</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'upcoming'}
              className={`planning-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
              onClick={() => setActiveTab('upcoming')}
            >
              <CalendarDays size={14} />
              <span>7 ngày tới</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'overdue'}
              className={`planning-tab ${activeTab === 'overdue' ? 'active' : ''}`}
              onClick={() => setActiveTab('overdue')}
            >
              <AlertTriangle
                size={14}
                color={overdue && overdue.totalOverdue > 0 ? 'var(--color-danger)' : 'currentColor'}
              />
              <span>Việc quá hạn</span>
              {overdue && overdue.totalOverdue > 0 && (
                <span className="planning-overdue-badge">{overdue.totalOverdue}</span>
              )}
            </button>
          </div>

          <button
            type="button"
            className="planning-btn planning-refresh-btn"
            onClick={() => void refresh()}
            title="Làm mới dữ liệu"
            aria-label="Làm mới dữ liệu"
          >
            <RefreshCw size={14} className={isLoading ? 'spinner' : ''} />
          </button>
        </div>
      </div>

      {isLoading && !weekly ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-box" style={{ height: '90px' }} />
          <div className="skeleton-box" style={{ height: '300px' }} />
        </div>
      ) : error ? (
        <div className="planning-error-box">
          <AlertCircle size={24} />
          <span>{error}</span>
          <button type="button" className="planning-btn" onClick={() => void refresh()}>
            Thử lại
          </button>
        </div>
      ) : (
        <>
          {/* TAB 1: KẾ HOẠCH TUẦN */}
          {activeTab === 'weekly' && weekly && (
            <>
              {/* Mục tiêu trọng tâm tuần */}
              <section className="planning-goals-card">
                <div className="planning-card-header">
                  <div className="planning-section-title">
                    <Target size={16} color="var(--color-primary)" />
                    <span>
                      Mục tiêu trọng tâm Tuần {weekly.weekNumber}/{weekly.year}
                    </span>
                    <span className="planning-date-range-pill">
                      {formatShortVnDate(weekly.startDate)} – {formatShortVnDate(weekly.endDate)}
                    </span>
                    {weekly.weeklyGoals.length > 0 && (
                      <span className="planning-goal-progress-pill">
                        {completedGoalsCount}/{weekly.weeklyGoals.length} đạt được
                      </span>
                    )}
                  </div>

                  <div className="planning-week-nav">
                    <button
                      type="button"
                      className="planning-btn"
                      onClick={() => void shiftWeek(-1)}
                    >
                      <ChevronLeft size={14} /> Tuần trước
                    </button>
                    <button
                      type="button"
                      className="planning-btn"
                      onClick={() => void goToCurrentWeek()}
                      title="Quay về tuần hiện tại"
                    >
                      Tuần này
                    </button>
                    <button
                      type="button"
                      className="planning-btn"
                      onClick={() => void shiftWeek(1)}
                    >
                      Tuần sau <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="planning-goals-list">
                  {weekly.weeklyGoals.map((g) => (
                    <div
                      key={g.id}
                      className={`planning-goal-chip ${g.isCompleted ? 'is-done' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => void toggleGoal(g.id)}
                        className="planning-goal-toggle"
                        aria-label="Đánh dấu hoàn thành mục tiêu"
                      >
                        {g.isCompleted ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      </button>
                      <span>{g.title}</span>
                      <button
                        type="button"
                        onClick={() => void deleteGoal(g.id)}
                        className="planning-goal-delete"
                        title="Xóa mục tiêu"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <form onSubmit={handleAddGoal} className="planning-inline-form">
                    <input
                      type="text"
                      className="planning-input"
                      placeholder="Nhập mục tiêu tuần..."
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      style={{ width: '215px' }}
                    />
                    <button
                      type="submit"
                      className="planning-btn planning-btn-primary"
                      disabled={!newGoalTitle.trim()}
                    >
                      <Plus size={12} /> Thêm mục tiêu
                    </button>
                  </form>
                </div>
              </section>

              {/* Bảng phân bổ: Hộp tồn đọng + Lưới 7 ngày */}
              <div className="planning-board">
                <aside className="planning-inbox-panel">
                  <div className="planning-card-header">
                    <div className="planning-section-title">
                      <Inbox size={15} color="var(--color-primary)" />
                      <span>Hộp việc chưa xếp lịch</span>
                      <span className="planning-count-badge">
                        {weekly.unscheduledTasks.length}
                      </span>
                    </div>

                    <form onSubmit={handleAddInbox} className="planning-inline-form">
                      <div className="planning-prio-switcher" role="group" aria-label="Độ ưu tiên">
                        {PRIORITY_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setInboxPriority(opt.value)}
                            className={`planning-prio-btn prio-${opt.value} ${
                              inboxPriority === opt.value ? 'active' : ''
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      <input
                        type="text"
                        className="planning-input"
                        placeholder="Thêm việc vào hộp chờ..."
                        value={newInboxTitle}
                        onChange={(e) => setNewInboxTitle(e.target.value)}
                        style={{ width: '210px' }}
                      />
                      <button
                        type="submit"
                        className="planning-btn planning-btn-primary"
                        disabled={!newInboxTitle.trim()}
                      >
                        <Plus size={14} /> Thêm
                      </button>
                    </form>
                  </div>

                  <div className="planning-inbox-items">
                    {weekly.unscheduledTasks.length === 0 ? (
                      <div className="planning-inbox-empty">
                        Không có việc tồn đọng nào chưa xếp lịch — bạn đã sắp xếp rất gọn gàng!
                      </div>
                    ) : (
                      weekly.unscheduledTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`planning-task-card inbox-card priority-${task.priority} ${
                            task.status === 'done' ? 'is-done' : ''
                          }`}
                        >
                          <div className="planning-task-card-top">
                            {renderTaskCheckbox(task)}
                            <span className="planning-task-card-title">{task.title}</span>
                          </div>
                          <div className="planning-task-card-meta">
                            <span className={`planning-prio-pill prio-${task.priority}`}>
                              {getPriorityLabel(task.priority)}
                            </span>
                            {task.categoryName && (
                              <span className="planning-cat-pill">{task.categoryName}</span>
                            )}
                            <span className="planning-drag-hint">Kéo xuống ngày ↓</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </aside>

                <div className="planning-days-grid">
                  {Object.entries(weekly.scheduledByDay).map(([dateStr, dayTasks], idx) => {
                    const isToday = dateStr === todayStr;
                    const doneCount = dayTasks.filter((t) => t.status === 'done').length;

                    return (
                      <div
                        key={dateStr}
                        className={`planning-day-col ${isToday ? 'is-today' : ''} ${
                          dragOverDate === dateStr ? 'is-drag-over' : ''
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          if (dragOverDate !== dateStr) setDragOverDate(dateStr);
                        }}
                        onDragLeave={() => {
                          if (dragOverDate === dateStr) setDragOverDate(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverDate(null);
                          const id = Number(e.dataTransfer.getData('text/plain'));
                          if (!Number.isNaN(id) && id > 0) {
                            void scheduleTask(id, dateStr);
                            showToast(
                              `Đã xếp lịch vào ${formatShortVnDate(dateStr)}`,
                              'success'
                            );
                          }
                        }}
                      >
                        <div className="planning-day-header">
                          <div>
                            <div className="planning-day-title-row">
                              <span className="planning-day-name">
                                {DAY_NAMES[idx] ?? dateStr}
                              </span>
                              {isToday && <span className="planning-today-badge">Hôm nay</span>}
                            </div>
                            <div className="planning-day-date">{formatShortVnDate(dateStr)}</div>
                          </div>
                          <span className="planning-day-count">
                            {dayTasks.length > 0
                              ? `${doneCount}/${dayTasks.length} việc`
                              : '0 việc'}
                          </span>
                        </div>

                        <div className="planning-day-tasks">
                          {dayTasks.length === 0 ? (
                            <div className="planning-day-dropzone-hint">
                              Thả thẻ vào đây hoặc thêm mới
                            </div>
                          ) : (
                            dayTasks.map((task) => (
                              <div
                                key={task.id}
                                draggable
                                onDragStart={(e) =>
                                  e.dataTransfer.setData('text/plain', String(task.id))
                                }
                                onClick={() => setSelectedTaskId(task.id)}
                                className={`planning-task-card priority-${task.priority} ${
                                  task.status === 'done' ? 'is-done' : ''
                                }`}
                              >
                                <div className="planning-task-card-top">
                                  {renderTaskCheckbox(task)}
                                  <span className="planning-task-card-title">{task.title}</span>
                                </div>
                                {task.categoryName && (
                                  <div className="planning-task-card-meta">
                                    <span className="planning-cat-pill">{task.categoryName}</span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>

                        {addingDate === dateStr ? (
                          <form
                            onSubmit={(e) => void handleAddForDay(e, dateStr)}
                            className="planning-day-quick-form"
                          >
                            <input
                              type="text"
                              autoFocus
                              className="planning-input compact"
                              placeholder="Tên việc..."
                              value={dayQuickTitle}
                              onChange={(e) => setDayQuickTitle(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Escape') {
                                  setAddingDate(null);
                                  setDayQuickTitle('');
                                }
                              }}
                            />
                            <div className="planning-day-quick-actions">
                              <button
                                type="submit"
                                className="planning-btn planning-btn-primary"
                                style={{ flex: 1, justifyContent: 'center' }}
                              >
                                Lưu
                              </button>
                              <button
                                type="button"
                                className="planning-btn"
                                onClick={() => {
                                  setAddingDate(null);
                                  setDayQuickTitle('');
                                }}
                                aria-label="Hủy thêm nhanh"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          </form>
                        ) : (
                          <button
                            type="button"
                            className="planning-day-add-btn"
                            onClick={() => {
                              setAddingDate(dateStr);
                              setDayQuickTitle('');
                            }}
                          >
                            <Plus size={12} /> Thêm việc
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: 7 NGÀY TỚI (UPCOMING 7 DAYS) */}
          {activeTab === 'upcoming' && upcoming && (
            <div className="planning-list-stack">
              {upcoming.days.map((group) => {
                const isToday = group.date === todayStr;
                return (
                  <div
                    key={group.date}
                    className={`planning-group-card ${isToday ? 'is-today-group' : ''}`}
                  >
                    <div className="planning-group-header">
                      <div className="planning-upcoming-title-row">
                        <span className="planning-upcoming-label">{group.label}</span>
                        {isToday && <span className="planning-today-badge">Hôm nay</span>}
                        <span className="planning-count-badge">{group.tasks.length} việc</span>
                      </div>
                      <button
                        type="button"
                        className="planning-btn"
                        onClick={() => {
                          setActiveTab('weekly');
                          setAddingDate(group.date);
                        }}
                      >
                        <Plus size={13} /> Lên lịch việc
                      </button>
                    </div>

                    {group.tasks.length === 0 ? (
                      <div className="planning-group-empty">
                        Chưa có công việc nào được lên lịch.
                      </div>
                    ) : (
                      <div className="planning-rows-list">
                        {group.tasks.map((task) => (
                          <div
                            key={task.id}
                            className={`planning-row ${task.status === 'done' ? 'is-done' : ''}`}
                          >
                            <div className="planning-row-left">
                              {renderTaskCheckbox(task)}
                              <div
                                className="planning-row-info"
                                onClick={() => setSelectedTaskId(task.id)}
                              >
                                <span className="planning-row-title">{task.title}</span>
                              </div>
                            </div>

                            <div className="planning-row-actions">
                              <span className={`planning-prio-pill prio-${task.priority}`}>
                                {getPriorityLabel(task.priority)}
                              </span>
                              <span className="planning-cat-pill">
                                {task.categoryName || 'Cá nhân'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 3: VIỆC QUÁ HẠN (OVERDUE) */}
          {activeTab === 'overdue' && overdue && (
            <div className="planning-list-stack">
              {overdue.totalOverdue === 0 ? (
                <div className="planning-group-card planning-overdue-clear">
                  <CheckCircle2 size={36} color="var(--color-success)" strokeWidth={1.6} />
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
                    Tuyệt vời! Bạn không có công việc nào quá hạn.
                  </div>
                  <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
                    Mọi đầu việc đều đang được kiểm soát đúng tiến độ.
                  </div>
                </div>
              ) : (
                <>
                  <div className="planning-overdue-banner">
                    <div>
                      <strong>Bạn đang có {overdue.totalOverdue} công việc quá hạn</strong>
                      <p>
                        Đánh dấu đã xong nếu bạn đã hoàn thành, hoặc điều phối lại sang ngày phù hợp.
                      </p>
                    </div>
                    <div className="planning-row-actions">
                      <button
                        type="button"
                        className="planning-btn planning-btn-primary"
                        onClick={() => {
                          const allIds = [
                            ...overdue.severeOverdue.map((i) => i.task.id),
                            ...overdue.recentOverdue.map((i) => i.task.id),
                          ];
                          void bulkReschedule(allIds, todayStr);
                          showToast(
                            `Đã dời ${allIds.length} việc quá hạn sang Hôm nay`,
                            'success'
                          );
                        }}
                      >
                        <CalendarClock size={14} /> Dời tất cả sang Hôm nay
                      </button>
                      <button
                        type="button"
                        className="planning-btn"
                        onClick={() => {
                          const allIds = [
                            ...overdue.severeOverdue.map((i) => i.task.id),
                            ...overdue.recentOverdue.map((i) => i.task.id),
                          ];
                          void bulkReschedule(allIds, tomorrowStr);
                          showToast(
                            `Đã dời ${allIds.length} việc quá hạn sang Ngày mai`,
                            'info'
                          );
                        }}
                      >
                        Dời sang Ngày mai
                      </button>
                    </div>
                  </div>

                  {renderOverdueSection(
                    'Trễ nghiêm trọng (≥ 3 ngày)',
                    overdue.severeOverdue,
                    'severe'
                  )}
                  {renderOverdueSection('Trễ 1–2 ngày', overdue.recentOverdue, 'recent')}
                </>
              )}
            </div>
          )}
        </>
      )}

      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={() => void refresh()}
        onDeleted={() => void refresh()}
      />
    </div>
  );
};
