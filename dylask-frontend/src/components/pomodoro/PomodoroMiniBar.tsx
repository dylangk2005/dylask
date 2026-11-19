import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Play, Pause, RotateCcw, Timer, ArrowUpRight } from 'lucide-react';
import { usePomodoro } from '@/hooks/usePomodoro';

function formatMMSS(totalSeconds: number): string {
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

const PHASE_BADGE: Record<'work' | 'shortBreak' | 'longBreak', string> = {
  work: 'Tập trung',
  shortBreak: 'Nghỉ ngắn',
  longBreak: 'Nghỉ dài',
};

/**
 * Thanh Mini-bar nổi ở góc dưới màn hình khi đồng hồ Pomodoro đang chạy
 * và người dùng đang xem các trang khác ngoài /my-day.
 */
export const PomodoroMiniBar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    activeTask,
    phase,
    secondsLeft,
    totalSeconds,
    isRunning,
    toggleRun,
    resetTimer,
  } = usePomodoro();

  const isStarted = isRunning || secondsLeft < totalSeconds;
  if (!isStarted || location.pathname === '/my-day') {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '24px',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '10px 14px',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-primary)',
        boxShadow: '0 12px 28px -8px rgba(15, 23, 42, 0.24)',
        maxWidth: '380px',
      }}
      role="status"
      aria-label="Đồng hồ Pomodoro đang chạy"
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          borderRadius: 'var(--radius-sm)',
          backgroundColor: 'var(--color-primary-subtle)',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Timer size={16} />
      </div>

      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--color-primary)', textTransform: 'uppercase' }}>
          {PHASE_BADGE[phase]}
        </div>
        <div
          style={{
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            color: 'var(--color-text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {activeTask ? activeTask.title : 'Tập trung tự do'}
        </div>
      </div>

      <div
        style={{
          fontFamily: 'var(--font-family-mono)',
          fontSize: 'var(--font-size-md)',
          fontWeight: 700,
          color: 'var(--color-text)',
          flexShrink: 0,
        }}
      >
        {formatMMSS(secondsLeft)}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
        <button
          type="button"
          onClick={toggleRun}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title={isRunning ? 'Tạm dừng' : 'Tiếp tục'}
        >
          {isRunning ? <Pause size={13} /> : <Play size={13} />}
        </button>

        <button
          type="button"
          onClick={resetTimer}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text-muted)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Đặt lại đồng hồ"
        >
          <RotateCcw size={13} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/my-day')}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
          title="Quay lại Kế hoạch hôm nay"
        >
          <ArrowUpRight size={14} />
        </button>
      </div>
    </div>
  );
};
