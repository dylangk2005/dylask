import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sun,
  Sunrise,
  Moon,
  Plus,
  CheckCircle2,
  Circle,
  Play,
  X,
  Timer,
  Loader2,
  AlertCircle,
  Check,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useMyDay } from '@/hooks/useMyDay';
import { usePomodoro } from '@/hooks/usePomodoro';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { PomodoroWidget } from '@/components/pomodoro/PomodoroWidget';
import { MyDaySuggestionsDrawer } from '@/components/task/MyDaySuggestionsDrawer';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import type { MyDayTask, TaskPriority } from '@/types/task';
import './myDay.css';

const PRIORITY_BADGE: Record<TaskPriority, { label: string; color: string }> = {
  low: { label: 'Thấp', color: 'var(--priority-low)' },
  medium: { label: 'Vừa', color: 'var(--priority-medium)' },
  high: { label: 'Cao', color: 'var(--priority-high)' },
};

/**
 * Màn hình Kế Hoạch Hôm Nay (MyDayPage) kết hợp danh sách việc trọng tâm,
 * Ngăn gợi ý thông minh và Đồng hồ Pomodoro toàn cục.
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
  const { user } = useAuth();
  const { showToast } = useToast();

  const { greetingLabel, GreetingIcon } = useMemo(() => {
    const hour = new Date().getHours();
    const prefix = hour < 12 ? 'Chào buổi sáng' : hour < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
    const IconComp = hour < 12 ? Sunrise : hour < 18 ? Sun : Moon;
    return {
      greetingLabel: user?.fullName ? `${prefix}, ${user.fullName}` : 'Kế hoạch hôm nay',
      GreetingIcon: IconComp,
    };
  }, [user?.fullName]);

  useEffect(() => {
    if (pomodoro.lastRecordedSession) {
      applyPomodoroResult(pomodoro.lastRecordedSession);
      showToast('Đã ghi nhận +1 phiên Pomodoro (25 phút)!', 'success');
    }
  }, [pomodoro.lastRecordedSession, applyPomodoroResult, showToast]);

  const [quickTitle, setQuickTitle] = useState('');
  const [quickPriority, setQuickPriority] = useState<TaskPriority>('medium');
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

  const todoTasks = useMemo(() => tasks.filter((t) => t.status !== 'done'), [tasks]);
  const doneTasks = useMemo(() => tasks.filter((t) => t.status === 'done'), [tasks]);

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
      await createMyDayTask(quickTitle.trim(), quickPriority);
      setQuickTitle('');
      showToast('Đã thêm việc vào Kế hoạch hôm nay', 'success');
    } finally {
      setIsAdding(false);
    }
  };

  const renderTaskRow = (task: MyDayTask) => {
    const isActivePomo = pomodoro.activeTask?.id === task.id;
    const prio = PRIORITY_BADGE[task.priority] ?? PRIORITY_BADGE.medium;

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
              <span
                style={{
                  color: prio.color,
                  fontWeight: 600,
                }}
              >
                {prio.label}
              </span>
              {task.categoryName && <span>· {task.categoryName}</span>}
              {task.pomodoroSessionsCompleted > 0 && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: 'var(--color-primary)', fontWeight: 600 }}>
                  · <Timer size={11} />
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
              <span>{isActivePomo ? 'Đang chạy' : 'Tập trung'}</span>
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
  };

  return (
    <div className="myday-page">
      <div className="myday-main-column">
        <div className="myday-header">
          <div className="myday-title-group">
            <div className="myday-greeting-icon">
              <GreetingIcon size={20} />
            </div>
            <div>
              <h1 className="myday-title">{greetingLabel}</h1>
              <div className="myday-subtitle">Kế hoạch hôm nay · {todayFormatted}</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div className="myday-stats-pill">
              🍅 Hôm nay: {totalPomoStats.sessions} phiên ({totalPomoStats.minutes}p)
            </div>
            <div className="myday-stats-pill">
              Hoàn thành {doneTasks.length}/{tasks.length} việc
            </div>
          </div>
        </div>

        {tasks.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="pomodoro-progress-bar" style={{ flex: 1 }}>
              <div
                className="pomodoro-progress-fill"
                style={{ width: `${Math.round((doneTasks.length / tasks.length) * 100)}%` }}
              />
            </div>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--color-text-muted)' }}>
              {Math.round((doneTasks.length / tasks.length) * 100)}%
            </span>
          </div>
        )}

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
          <select
            value={quickPriority}
            onChange={(e) => setQuickPriority(e.target.value as TaskPriority)}
            aria-label="Mức ưu tiên"
            style={{
              border: 'var(--border-width) solid var(--color-border)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              padding: '4px 8px',
              fontSize: '11px',
              fontWeight: 600,
              color: 'var(--color-text)',
            }}
          >
            <option value="low">Thấp</option>
            <option value="medium">Vừa</option>
            <option value="high">Cao</option>
          </select>
          {quickTitle.trim() ? (
            <button type="submit" className="myday-icon-btn myday-icon-btn-primary" disabled={isAdding}>
              {isAdding ? <Loader2 className="spinner" size={13} /> : 'Thêm'}
            </button>
          ) : (
            <span
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                fontFamily: 'var(--font-mono)',
                padding: '2px 6px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-surface-subtle)',
                flexShrink: 0,
              }}
            >
              Enter ↵
            </span>
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
              border: 'var(--border-width) solid var(--color-border)',
              borderRadius: 'var(--radius)',
              padding: 'var(--space-8) var(--space-6)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              gap: '12px',
            }}
          >
            <div className="myday-greeting-icon" style={{ width: '48px', height: '48px' }}>
              <GreetingIcon size={24} />
            </div>
            <div>
              <div style={{ fontSize: 'var(--font-size-md)', fontWeight: 700, color: 'var(--color-text)', marginBottom: '4px' }}>
                Hôm nay của bạn đang trống
              </div>
              <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--color-text-muted)', maxWidth: '440px' }}>
                Chọn những việc quan trọng nhất để tập trung trong hôm nay, hoặc đưa nhanh từ danh sách gợi ý.
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '4px' }}>
              {suggestions.length > 0 && (
                <button
                  type="button"
                  className="myday-icon-btn myday-icon-btn-primary"
                  style={{ padding: '8px 14px', fontSize: 'var(--font-size-xs)' }}
                  onClick={() => {
                    void addToMyDay(suggestions[0].id);
                    showToast(`Đã thêm "${suggestions[0].title}" vào hôm nay`, 'success');
                  }}
                >
                  <Sparkles size={14} />
                  <span>Đưa nhanh "{suggestions[0].title}" vào hôm nay</span>
                </button>
              )}

              <Link
                to="/tasks"
                className="myday-icon-btn"
                style={{ padding: '8px 14px', textDecoration: 'none' }}
              >
                <span>Mở tất cả công việc</span>
                <ArrowRight size={13} />
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {todoTasks.length > 0 && (
              <div className="myday-task-list">
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Cần làm hôm nay ({todoTasks.length})
                </div>
                {todoTasks.map(renderTaskRow)}
              </div>
            )}

            {doneTasks.length > 0 && (
              <div className="myday-task-list">
                <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--color-text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Đã hoàn thành hôm nay ({doneTasks.length})
                </div>
                {doneTasks.map(renderTaskRow)}
              </div>
            )}
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
          soundEnabled={pomodoro.soundEnabled}
          onToggleSound={pomodoro.toggleSound}
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
