import React from 'react';
import { useDualMode } from '@/hooks/useDualMode';
import { Sparkles, Terminal } from 'lucide-react';

interface ModeSwitcherProps {
  compact?: boolean;
}

/**
 * Component công tắc chuyển đổi chế độ giao diện (Dual-Mode Switcher).
 * Hỗ trợ chuyển đổi nhanh giữa Standard Mode (Cá nhân) và Developer Mode (Kỹ thuật).
 */
export const ModeSwitcher: React.FC<ModeSwitcherProps> = ({ compact = false }) => {
  const { mode, switchMode } = useDualMode();

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        borderRadius: 'var(--radius)',
        backgroundColor: 'var(--color-surface-subtle)',
        border: 'var(--border-width) solid var(--color-border)',
        position: 'relative',
        width: compact ? 'auto' : '100%',
        userSelect: 'none',
      }}
    >
      {/* Nút Standard Mode */}
      <button
        type="button"
        onClick={() => switchMode('standard')}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: compact ? '4px 8px' : '6px 12px',
          borderRadius: 'calc(var(--radius) - 2px)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: mode === 'standard' ? 600 : 500,
          color: mode === 'standard' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          backgroundColor: mode === 'standard' ? 'var(--color-surface)' : 'transparent',
          boxShadow: mode === 'standard' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
        title="Chế độ Cá nhân (Standard Mode): Tối giản, tập trung vào công việc và thói quen"
      >
        <Sparkles size={14} color={mode === 'standard' ? 'var(--color-primary)' : 'currentColor'} />
        <span>Cá nhân</span>
      </button>

      {/* Nút Developer Mode */}
      <button
        type="button"
        onClick={() => switchMode('developer')}
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          padding: compact ? '4px 8px' : '6px 12px',
          borderRadius: 'calc(var(--radius) - 2px)',
          fontSize: 'var(--font-size-xs)',
          fontWeight: mode === 'developer' ? 600 : 500,
          color: mode === 'developer' ? 'var(--color-primary)' : 'var(--color-text-muted)',
          backgroundColor: mode === 'developer' ? 'var(--color-surface)' : 'transparent',
          boxShadow: mode === 'developer' ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
          transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
        title="Chế độ Lập trình viên (Developer Mode): Kanban Sprint, mật độ cao, tối ưu Git"
      >
        <Terminal size={14} color={mode === 'developer' ? 'var(--color-primary)' : 'currentColor'} />
        <span>Developer</span>
      </button>
    </div>
  );
};
