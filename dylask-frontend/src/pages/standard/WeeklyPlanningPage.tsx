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
} from 'lucide-react';
import { usePlanning } from '@/hooks/usePlanning';
import { useToast } from '@/hooks/useToast';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import './planning.css';

const DAY_NAMES = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'Chủ nhật'];

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
    scheduleTask,
    createInboxTask,
    createTaskForDate,
    addGoal,
    toggleGoal,
    deleteGoal,
    bulkReschedule,
    shiftWeek,
  } = usePlanning();

  const { showToast } = useToast();

  const [newInboxTitle, setNewInboxTitle] = useState('');
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [addingDate, setAddingDate] = useState<string | null>(null);
  const [dayQuickTitle, setDayQuickTitle] = useState('');
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const todayStr = toLocalDateStr(new Date());
  const tomorrowDate = new Date();
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  const tomorrowStr = toLocalDateStr(tomorrowDate);

  const handleAddInbox = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newInboxTitle.trim()) return;
    await createInboxTask(newInboxTitle.trim());
    setNewInboxTitle('');
    showToast('Đã thêm việc vào Hộp tồn đọng', 'success');
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
    showToast(`Đã lên lịch việc vào ${dateStr}`, 'success');
  };

  return (
    <div className="planning-page">
      <div className="planning-header">
        <div>
          <h1 className="planning-title">Lập kế hoạch &amp; Điều phối</h1>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)' }}>
            Phân bổ việc tồn đọng, theo dõi 7 ngày tới và xử lý việc quá hạn
          </div>
        </div>

        <div className="planning-tabs" role="tablist">
          <button
            type="button"
            className={`planning-tab ${activeTab === 'weekly' ? 'active' : ''}`}
            onClick={() => setActiveTab('weekly')}
          >
            <Compass size={14} />
            <span>Kế hoạch tuần</span>
          </button>
          <button
            type="button"
            className={`planning-tab ${activeTab === 'upcoming' ? 'active' : ''}`}
            onClick={() => setActiveTab('upcoming')}
          >
            <CalendarDays size={14} />
            <span>7 ngày tới</span>
          </button>
          <button
            type="button"
            className={`planning-tab ${activeTab === 'overdue' ? 'active' : ''}`}
            onClick={() => setActiveTab('overdue')}
          >
            <AlertTriangle size={14} color={overdue && overdue.totalOverdue > 0 ? 'var(--color-danger)' : 'currentColor'} />
            <span>Việc quá hạn</span>
            {overdue && overdue.totalOverdue > 0 && (
              <span className="planning-overdue-badge">{overdue.totalOverdue}</span>
            )}
          </button>
        </div>
      </div>

      {isLoading && !weekly ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="skeleton-box" style={{ height: '90px' }} />
          <div className="skeleton-box" style={{ height: '300px' }} />
        </div>
      ) : error ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-8)', gap: '10px', color: 'var(--color-danger)' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
                    <Target size={16} color="var(--color-primary)" />
                    <span>
                      Mục tiêu trọng tâm Tuần {weekly.weekNumber}/{weekly.year} ({weekly.startDate} → {weekly.endDate})
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button type="button" className="planning-btn" onClick={() => void shiftWeek(-1)}>
                      <ChevronLeft size={14} /> Tuần trước
                    </button>
                    <button type="button" className="planning-btn" onClick={() => void shiftWeek(1)}>
                      Tuần sau <ChevronRight size={14} />
                    </button>
                  </div>
                </div>

                <div className="planning-goals-list">
                  {weekly.weeklyGoals.map((g) => (
                    <div key={g.id} className={`planning-goal-chip ${g.isCompleted ? 'is-done' : ''}`}>
                      <button
                        type="button"
                        onClick={() => void toggleGoal(g.id)}
                        style={{ border: 'none', background: 'transparent', padding: 0, display: 'inline-flex', color: g.isCompleted ? 'var(--color-success)' : 'var(--color-text-muted)', cursor: 'pointer' }}
                      >
                        {g.isCompleted ? <CheckCircle2 size={15} /> : <Circle size={15} />}
                      </button>
                      <span>{g.title}</span>
                      <button
                        type="button"
                        onClick={() => void deleteGoal(g.id)}
                        style={{ border: 'none', background: 'transparent', padding: 0, display: 'inline-flex', color: 'var(--color-text-muted)', cursor: 'pointer' }}
                        title="Xóa mục tiêu"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}

                  <form onSubmit={handleAddGoal} style={{ display: 'inline-flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="+ Thêm mục tiêu tuần..."
                      value={newGoalTitle}
                      onChange={(e) => setNewGoalTitle(e.target.value)}
                      style={{ padding: '4px 10px', fontSize: 'var(--font-size-xs)', width: '200px' }}
                    />
                    {newGoalTitle.trim() && (
                      <button type="submit" className="planning-btn planning-btn-primary">
                        Thêm
                      </button>
                    )}
                  </form>
                </div>
              </section>

              {/* Bảng phân bổ: Hộp tồn đọng + Lưới 7 ngày */}
              <div className="planning-board">
                <aside className="planning-inbox-panel">
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-size-sm)', display: 'flex', justifyContent: 'space-between' }}>
                    <span>Hộp việc chưa xếp lịch</span>
                    <span style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>
                      {weekly.unscheduledTasks.length}
                    </span>
                  </div>

                  <form onSubmit={handleAddInbox} style={{ display: 'flex', gap: '6px' }}>
                    <input
                      type="text"
                      placeholder="Thêm việc mới..."
                      value={newInboxTitle}
                      onChange={(e) => setNewInboxTitle(e.target.value)}
                      style={{ flex: 1, padding: '6px 8px', fontSize: 'var(--font-size-xs)' }}
                    />
                    <button type="submit" className="planning-btn planning-btn-primary" title="Thêm">
                      <Plus size={14} />
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {weekly.unscheduledTasks.length === 0 ? (
                      <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)', textAlign: 'center', padding: '12px 0' }}>
                        Không có việc tồn đọng nào chưa xếp lịch.
                      </div>
                    ) : (
                      weekly.unscheduledTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`planning-task-card priority-${task.priority}`}
                        >
                          <span>{task.title}</span>
                          <span style={{ fontSize: '10px', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                            Kéo sang ngày trong tuần →
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </aside>

                <div className="planning-days-grid">
                  {Object.entries(weekly.scheduledByDay).map(([dateStr, dayTasks], idx) => (
                    <div
                      key={dateStr}
                      className={`planning-day-col ${dragOverDate === dateStr ? 'is-drag-over' : ''}`}
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
                          showToast(`Đã xếp lịch vào ${dateStr}`, 'success');
                        }
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-border)', paddingBottom: '6px' }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 'var(--font-size-xs)', color: dateStr === todayStr ? 'var(--color-primary)' : 'var(--color-text)' }}>
                            {DAY_NAMES[idx] ?? dateStr}
                          </div>
                          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
                            {dateStr.slice(5)}
                          </div>
                        </div>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {dayTasks.length} việc
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
                        {dayTasks.map((task) => (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => e.dataTransfer.setData('text/plain', String(task.id))}
                            onClick={() => setSelectedTaskId(task.id)}
                            className={`planning-task-card priority-${task.priority} ${task.status === 'done' ? 'is-done' : ''}`}
                          >
                            <span>{task.title}</span>
                          </div>
                        ))}
                      </div>

                      {addingDate === dateStr ? (
                        <form onSubmit={(e) => void handleAddForDay(e, dateStr)} style={{ display: 'flex', gap: '4px' }}>
                          <input
                            type="text"
                            autoFocus
                            placeholder="Tên việc..."
                            value={dayQuickTitle}
                            onChange={(e) => setDayQuickTitle(e.target.value)}
                            style={{ flex: 1, padding: '4px 6px', fontSize: '11px' }}
                          />
                          <button type="submit" className="planning-btn planning-btn-primary">
                            Lưu
                          </button>
                        </form>
                      ) : (
                        <button
                          type="button"
                          className="planning-btn"
                          style={{ justifyContent: 'center', width: '100%' }}
                          onClick={() => {
                            setAddingDate(dateStr);
                            setDayQuickTitle('');
                          }}
                        >
                          <Plus size={12} /> Thêm việc
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* TAB 2: 7 NGÀY TỚI (UPCOMING 7 DAYS) */}
          {activeTab === 'upcoming' && upcoming && (
            <div className="planning-list-stack">
              {upcoming.days.map((group) => (
                <div key={group.date} className="planning-group-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-text)' }}>
                      {group.label}
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
                    <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
                      Chưa có công việc nào được lên lịch.
                    </div>
                  ) : (
                    group.tasks.map((task) => (
                      <div key={task.id} className="planning-row" onClick={() => setSelectedTaskId(task.id)} style={{ cursor: 'pointer' }}>
                        <span style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{task.title}</span>
                        <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                          {task.categoryName || 'Cá nhân'}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: VIỆC QUÁ HẠN (OVERDUE) */}
          {activeTab === 'overdue' && overdue && (
            <div className="planning-list-stack">
              {overdue.totalOverdue === 0 ? (
                <div className="planning-group-card" style={{ textAlign: 'center', padding: 'var(--space-8)' }}>
                  <CheckCircle2 size={32} color="var(--color-success)" style={{ margin: '0 auto 8px' }} />
                  <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    Tuyệt vời! Bạn không có công việc nào quá hạn.
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button
                      type="button"
                      className="planning-btn planning-btn-primary"
                      onClick={() => {
                        const allIds = [
                          ...overdue.severeOverdue.map((i) => i.task.id),
                          ...overdue.recentOverdue.map((i) => i.task.id),
                        ];
                        void bulkReschedule(allIds, todayStr);
                        showToast(`Đã dời ${allIds.length} việc quá hạn sang Hôm nay`, 'success');
                      }}
                    >
                      <CalendarClock size={14} /> Dời tất cả sang Hôm nay
                    </button>
                  </div>

                  {overdue.severeOverdue.length > 0 && (
                    <div className="planning-group-card" style={{ borderColor: 'var(--color-danger)' }}>
                      <div style={{ fontWeight: 700, color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>
                        Trễ nghiêm trọng (≥ 3 ngày) · {overdue.severeOverdue.length} việc
                      </div>
                      {overdue.severeOverdue.map((item) => (
                        <div key={item.task.id} className="planning-row">
                          <div onClick={() => setSelectedTaskId(item.task.id)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.task.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-danger)' }}>
                              Quá hạn {item.daysOverdue} ngày
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {overdue.recentOverdue.length > 0 && (
                    <div className="planning-group-card">
                      <div style={{ fontWeight: 700, color: 'var(--color-warning)', fontSize: 'var(--font-size-sm)' }}>
                        Trễ 1–2 ngày · {overdue.recentOverdue.length} việc
                      </div>
                      {overdue.recentOverdue.map((item) => (
                        <div key={item.task.id} className="planning-row">
                          <div onClick={() => setSelectedTaskId(item.task.id)} style={{ cursor: 'pointer' }}>
                            <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>{item.task.title}</div>
                            <div style={{ fontSize: '11px', color: 'var(--color-warning)' }}>
                              Quá hạn {item.daysOverdue} ngày
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
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
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
