import React from 'react';
import { Play, Pause, RotateCcw, Timer, Volume2, VolumeX } from 'lucide-react';
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
  soundEnabled: boolean;
  onToggleSound: () => void;
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
  soundEnabled,
  onToggleSound,
  onToggleRun,
  onReset,
  onSwitchPhase,
}) => {
  const progressRatio = totalSeconds > 0 ? (totalSeconds - secondsLeft) / totalSeconds : 0;
  const ringSize = 132;
  const ringStroke = 7;
  const ringRadius = (ringSize - ringStroke) / 2;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringOffset = ringCircumference * (1 - progressRatio);
  const ringColor =
    phase === 'work'
      ? 'var(--color-primary)'
      : phase === 'shortBreak'
      ? 'var(--color-info)'
      : '#8B5CF6';
  const filledDots = completedInCycle % 4 === 0 && completedInCycle > 0 && phase === 'longBreak'
    ? 4
    : completedInCycle % 4;

  return (
    <section className="pomodoro-card" aria-label="Đồng hồ Pomodoro">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: 'var(--font-size-sm)' }}>
          <Timer size={16} color={ringColor} />
          <span>Pomodoro Focus</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            type="button"
            onClick={onToggleSound}
            title={soundEnabled ? 'Đang bật chuông báo' : 'Đang tắt chuông báo'}
            style={{
              border: 'none',
              background: 'transparent',
              color: soundEnabled ? 'var(--color-primary)' : 'var(--color-text-muted)',
              display: 'inline-flex',
              cursor: 'pointer',
              padding: '2px',
            }}
          >
            {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
          </button>
          <div className="pomodoro-cycle-dots" title={`Đã xong ${completedInCycle} phiên`}>
            {[0, 1, 2, 3].map((idx) => (
              <span key={idx} className={`pomodoro-dot ${idx < filledDots ? 'filled' : ''}`} />
            ))}
          </div>
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

      <div style={{ display: 'flex', justifyContent: 'center', padding: '4px 0' }}>
        <div style={{ position: 'relative', width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} style={{ transform: 'rotate(-90deg)' }}>
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="transparent"
              stroke="var(--color-surface-subtle)"
              strokeWidth={ringStroke}
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={ringRadius}
              fill="transparent"
              stroke={ringColor}
              strokeWidth={ringStroke}
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 0.5s linear' }}
            />
          </svg>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div className="pomodoro-clock" style={{ fontSize: '28px', padding: 0 }}>
              {formatMMSS(secondsLeft)}
            </div>
            <div style={{ fontSize: '10px', fontWeight: 600, color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>
              {phase === 'work' ? 'Tập trung' : phase === 'shortBreak' ? 'Nghỉ ngắn' : 'Nghỉ dài'}
            </div>
          </div>
        </div>
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
