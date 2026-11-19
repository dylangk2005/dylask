import React from 'react';
import { Play, Pause, RotateCcw, Timer } from 'lucide-react';
import type { MyDayTask } from '@/types/task';
import type { PomodoroPhase } from '@/hooks/usePomodoroTimer';

interface PomodoroWidgetProps {
  activeTask: MyDayTask | null;
  availableTasks: MyDayTask[];
  onSelectTask: (task: MyDayTask | null) => void;
  phase: PomodoroPhase;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  completedInCycle: number;
  onToggleRun: () => void;
  onReset: () => void;
  onSwitchPhase: (phase: PomodoroPhase) => void;
}

function formatMMSS(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

/**
 * Widget đồng hồ bấm giờ tập trung Pomodoro (25p / 5p / 15p).
 */
export const PomodoroWidget: React.FC<PomodoroWidgetProps> = ({
  activeTask,
  availableTasks,
  onSelectTask,
  phase,
  secondsLeft,
  totalSeconds,
  isRunning,
  completedInCycle,
  onToggleRun,
  onReset,
  onSwitchPhase,
}) => {
  const progressPercent = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const filledDots = completedInCycle % 4 === 0 && completedInCycle > 0 && phase === 'longBreak'
    ? 4
    : completedInCycle % 4;

  return (
    <section className="pomodoro-card" aria-label="Đồng hồ Pomodoro">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
          <Timer size={16} color="var(--color-primary)" />
          <span>Pomodoro Focus</span>
        </div>
        <div className="pomodoro-cycle-dots" title={`Đã xong ${completedInCycle} phiên`}>
          {[0, 1, 2, 3].map((idx) => (
            <span key={idx} className={`pomodoro-dot ${idx < filledDots ? 'filled' : ''}`} />
          ))}
        </div>
      </div>

      <div className="pomodoro-phase-tabs" role="tablist">
        <button
          type="button"
          className={`pomodoro-phase-tab ${phase === 'work' ? 'active' : ''}`}
          onClick={() => onSwitchPhase('work')}
        >
          Tập trung 25p
        </button>
        <button
          type="button"
          className={`pomodoro-phase-tab ${phase === 'shortBreak' ? 'active' : ''}`}
          onClick={() => onSwitchPhase('shortBreak')}
        >
          Nghỉ ngắn 5p
        </button>
        <button
          type="button"
          className={`pomodoro-phase-tab ${phase === 'longBreak' ? 'active' : ''}`}
          onClick={() => onSwitchPhase('longBreak')}
        >
          Nghỉ dài 15p
        </button>
      </div>

      <div className="pomodoro-clock">{formatMMSS(secondsLeft)}</div>

      <div className="pomodoro-progress-bar">
        <div className="pomodoro-progress-fill" style={{ width: `${progressPercent}%` }} />
      </div>

      <div>
        <label
          style={{
            display: 'block',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--color-text-muted)',
            marginBottom: '4px',
          }}
        >
          Công việc đang gắn phiên
        </label>
        <select
          value={activeTask ? String(activeTask.id) : ''}
          onChange={(e) => {
            const val = e.target.value;
            if (!val) {
              onSelectTask(null);
              return;
            }
            const found = availableTasks.find((t) => String(t.id) === val) ?? null;
            onSelectTask(found);
          }}
          style={{
            width: '100%',
            padding: '6px 8px',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-border)',
            backgroundColor: 'var(--color-bg)',
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 500,
            outline: 'none',
          }}
        >
          <option value="">Tập trung tự do (không lưu vào task)</option>
          {availableTasks.map((t) => (
            <option key={t.id} value={String(t.id)}>
              {t.title}
            </option>
          ))}
        </select>
      </div>

      <div className="pomodoro-controls">
        <button
          type="button"
          className="myday-icon-btn myday-icon-btn-primary"
          onClick={onToggleRun}
          style={{ padding: '8px 18px', fontSize: 'var(--font-size-sm)' }}
        >
          {isRunning ? <Pause size={15} /> : <Play size={15} />}
          <span>{isRunning ? 'Tạm dừng' : 'Bắt đầu'}</span>
        </button>

        <button
          type="button"
          className="myday-icon-btn"
          onClick={onReset}
          title="Đặt lại đồng hồ (không tính phiên)"
          style={{ padding: '8px 12px' }}
        >
          <RotateCcw size={15} />
        </button>
      </div>
    </section>
  );
};
