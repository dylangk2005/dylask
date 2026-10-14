import type { FC } from 'react';
import { Menu, Terminal, User, Sparkles } from 'lucide-react';
import { useDualMode } from '@/hooks/useDualMode';

interface HeaderProps {
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export const Header: FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen }) => {
  const { mode, toggleMode } = useDualMode();

  return (
    <header
      style={{
        height: '56px',
        minHeight: '56px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: 'var(--border-width) solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 var(--space-4)',
        gap: 'var(--space-3)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <button
          onClick={onToggleSidebar}
          aria-label="Toggle navigation sidebar"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--color-border)',
            backgroundColor: isSidebarOpen ? 'var(--color-surface-subtle)' : 'transparent',
            color: 'var(--color-text)',
          }}
        >
          <Menu size={18} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontWeight: 700, fontSize: 'var(--font-size-md)', color: 'var(--color-primary)' }}>
            Dylask
          </span>
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-primary-subtle)',
              color: 'var(--color-primary)',
              fontWeight: 600,
              textTransform: 'uppercase',
            }}
          >
            {mode === 'developer' ? 'Dev Mode' : 'Standard'}
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        {/* Dual Mode Switch Button */}
        <button
          onClick={toggleMode}
          title={`Chuyển sang ${mode === 'standard' ? 'Developer' : 'Standard'} Mode`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--space-2)',
            padding: '6px 12px',
            borderRadius: 'var(--radius)',
            border: 'var(--border-width) solid var(--color-border)',
            backgroundColor: 'var(--color-surface-subtle)',
            color: 'var(--color-text)',
            fontSize: 'var(--font-size-sm)',
            fontWeight: 500,
          }}
        >
          {mode === 'standard' ? (
            <>
              <Terminal size={15} color="var(--color-primary)" />
              <span>Chuyển Dev Mode</span>
            </>
          ) : (
            <>
              <Sparkles size={15} color="var(--color-primary)" />
              <span>Chuyển Standard</span>
            </>
          )}
        </button>

        {/* User Avatar Placeholder */}
        <div
          style={{
            width: '32px',
            height: '32px',
            borderRadius: 'var(--radius-full)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: 'var(--border-width) solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
          }}
        >
          <User size={16} />
        </div>
      </div>
    </header>
  );
};
