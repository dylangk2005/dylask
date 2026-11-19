import React, { useEffect, useMemo, useState } from 'react';
import {
  Sun,
  Plus,
  CheckCircle2,
  Circle,
  Play,
  X,
  Timer,
  Loader2,
  AlertCircle,
  Check,
} from 'lucide-react';
import { useMyDay } from '@/hooks/useMyDay';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useToast } from '@/hooks/useToast';
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget';
import { MyDaySuggestionsDrawer } from '@/components/task/MyDaySuggestionsDrawer';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import './myDay.css';

/**
 * Màn hình Kế Hoạch Hôm Nay (MyDayPage) kết hợp danh sách việc trọng tâm,
 * Ngăn gợi ý thông minh (Clean Slate) và Đồng hồ Pomodoro toàn cục.
 */
export const MyDayPage: React.FC = () => {
  const {
    tasks,
    suggestions,
    isLoading,
    error,
    refresh,
    addToMyDay,
    removeFromMyDay,
    toggleTaskStatus,
    createMyDayTask,
    applyPomodoroResult,
  } = useMyDay();

  const pomodoro = usePomodoro();
  const { showToast } = useToast();

  useEffect(() => {
    if (pomodoro.lastRecordedSession) {
      applyPomodoroResult(pomodoro.lastRecordedSession);
      showToast('Đã ghi nhận +1 phiên Pomodoro (25 phút)!', 'success');
    }
  }, [pomodoro.lastRecordedSession, applyPomodoroResult, showToast]);

  const [quickTitle, setQuickTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);

  const todayFormatted = useMemo(() => {
    return new Intl.DateTimeFormat('vi-VN', {
      weekday: 'long',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date());
  }, []);

  const doneCount = useMemo(() => tasks.filter((t) => t.status === 'done').length, [tasks]);
  const todoTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);

  const totalPomoStats = useMemo(() => {
    return tasks.reduce(
      (acc, t) => ({
        sessions: acc.sessions + (t.pomodoroSessionsCompleted || 0),
        minutes: acc.minutes + (t.pomodoroTotalMinutes || 0),
      }),
      { sessions: 0, minutes: 0 }
    );
  }, [tasks]);

  const activeFocusTask = useMemo(() => {
    if (!pomodoro.activeTask) return null;
    return tasks.find((t) => t.id === pomodoro.activeTask?.id) ?? pomodoro.activeTask;
  }, [pomodoro.activeTask, tasks]);

  const handleCompleteActiveFocusTask = async () => {
    if (!activeFocusTask) return;
    await toggleTaskStatus(activeFocusTask.id, activeFocusTask.status);
    showToast(`Đã hoàn thành "${activeFocusTask.title}"`, 'success');
    const nextTodo = todoTasks.find((t) => t.id !== activeFocusTask.id) ?? null;
    pomodoro.setActiveTask(nextTodo);
  };

  const handleQuickAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTitle.trim() || isAdding) return;
    try {
      setIsAdding(true);
      await createMyDayTask(quickTitle.trim());
      setQuickTitle('');
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div className="myday-page">
      <div className="myday-main-column">
        <div className="myday-header">
          <div>
            <h1 className="myday-title">
              <Sun size={24} color="var(--color-primary)" />
              <span>Kế hoạch hôm nay</span>
            </h1>
            <div className="myday-subtitle">{todayFormatted}</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="myday-stats-pill">
              🍅 Hôm nay: {totalPomoStats.sessions} phiên ({totalPomoStats.minutes}p)
            </div>
            <div className="myday-stats-pill">
              Hoàn thành {doneCount}/{tasks.length} việc
            </div>
          </div>
        </div>

        {activeFocusTask && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px',
              padding: '12px 14px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-primary-subtle)',
              border: '1px solid var(--color-primary)',
            }}
          >
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
                Đang tập trung
              </div>
              <div
                style={{
                  fontSize: 'var(--font-size-base)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {activeFocusTask.title}
              </div>
            </div>

            <button
              type="button"
              className="myday-icon-btn myday-icon-btn-primary"
              onClick={() => void handleCompleteActiveFocusTask()}
            >
              <Check size={14} />
              <span>Hoàn thành ngay</span>
            </button>
          </div>
        )}

        <form className="myday-quick-add" onSubmit={handleQuickAdd}>
          <Plus size={18} color="var(--color-primary)" />
          <input
            type="text"
            placeholder="Thêm việc trọng tâm cho hôm nay..."
            value={quickTitle}
            onChange={(e) => setQuickTitle(e.target.value)}
            disabled={isAdding}
          />
          {quickTitle.trim() && (
            <button type="submit" className="myday-icon-btn myday-icon-btn-primary" disabled={isAdding}>
              {isAdding ? <Loader2 className="spinner" size={13} /> : 'Thêm'}
            </button>
          )}
        </form>

        {isLoading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[1, 2, 3].map((idx) => (
              <div key={idx} className="skeleton-box" style={{ height: '58px', width: '100%' }} />
            ))}
          </div>
        ) : error ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: 'var(--space-8)', gap: '10px', color: 'var(--color-danger)' }}>
            <AlertCircle size={24} />
            <span>{error}</span>
            <button type="button" className="myday-icon-btn" onClick={() => void refresh()}>
              Thử lại
            </button>
          </div>
        ) : tasks.length === 0 ? (
          <div
            style={{
              backgroundColor: 'var(--color-surface)',
              border: 'var(--border-width) dashed var(--color-border-strong)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-8)',
              textAlign: 'center',
              color: 'var(--color-text-muted)',
            }}
          >
            <Sun size={32} color="var(--color-primary)" style={{ marginBottom: '8px', opacity: 0.85 }} />
            <div style={{ fontWeight: 600, color: 'var(--color-text)', marginBottom: '4px' }}>
              Ngày mới bắt đầu sạch sẽ (Clean Slate)
            </div>
            <div style={{ fontSize: 'var(--font-size-sm)' }}>
              Nhập công việc ở trên hoặc chọn nhanh từ bảng <strong>Gợi ý thông minh</strong> bên phải.
            </div>
          </div>
        ) : (
          <div className="myday-task-list">
            {tasks.map((task) => {
              const isActivePomo = pomodoro.activeTask?.id === task.id;
              return (
                <div
                  key={task.id}
                  className={`myday-task-card ${isActivePomo ? 'is-active-pomo' : ''}`}
                >
                  <div className="myday-task-left">
                    <button
                      type="button"
                      onClick={() => void toggleTaskStatus(task.id, task.status)}
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
                      {task.status === 'done' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
                    </button>

                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        className={`myday-task-title ${task.status === 'done' ? 'is-done' : ''}`}
                        onClick={() => setSelectedTaskId(task.id)}
                      >
                        {task.title}
                      </div>
                      <div className="myday-task-meta">
                        {task.categoryName && <span>{task.categoryName}</span>}
                        {task.pomodoroSessionsCompleted > 0 && (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-primary)', fontWeight: 600 }}>
                            <Timer size={11} />
                            {task.pomodoroSessionsCompleted} phiên ({task.pomodoroTotalMinutes}p)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="myday-task-actions">
                    {task.status !== 'done' && (
                      <button
                        type="button"
                        className={`myday-icon-btn ${isActivePomo ? 'myday-icon-btn-primary' : ''}`}
                        onClick={() => pomodoro.startForTask(task)}
                        title="Bắt đầu phiên Pomodoro 25 phút"
                      >
                        <Play size={12} />
                        <span>Pomodoro</span>
                      </button>
                    )}

                    <button
                      type="button"
                      className="myday-icon-btn"
                      onClick={() => void removeFromMyDay(task.id)}
                      title="Gỡ khỏi Kế hoạch hôm nay"
                    >
                      <X size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <aside className="myday-side-column">
        <PomodoroWidget
          activeTask={pomodoro.activeTask}
          availableTasks={todoTasks}
          onSelectTask={pomodoro.setActiveTask}
          phase={pomodoro.phase}
          secondsLeft={pomodoro.secondsLeft}
          totalSeconds={pomodoro.totalSeconds}
          isRunning={pomodoro.isRunning}
          completedInCycle={pomodoro.completedInCycle}
          onToggleRun={pomodoro.toggleRun}
          onReset={pomodoro.resetTimer}
          onSwitchPhase={pomodoro.switchPhase}
        />

        <MyDaySuggestionsDrawer
          suggestions={suggestions}
          onAdd={(id) => {
            void addToMyDay(id);
            showToast('Đã thêm công việc vào Kế hoạch hôm nay', 'success');
          }}
        />
      </aside>

      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={() => void refresh()}
        onDeleted={() => void refresh()}
      />
    </div>
  );
};
