import type { FC } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Sun,
  CheckSquare,
  Calendar,
  Compass,
  BarChart2,
  Settings,
  Kanban,
  ListTodo,
  Crosshair,
  GitBranch,
  LineChart,
} from 'lucide-react';
import { useDualMode } from '@/hooks/useDualMode';
import { ModeSwitcher } from '@/components/common/ModeSwitcher';

interface SidebarProps {
  isOpen: boolean;
}

/**
 * Navigation Sidebar component with smooth width-clipping transition.
 * Keeps an inner fixed-width container (.sidebar-inner) so text labels never squish or wrap during slide animations.
 */
export const Sidebar: FC<SidebarProps> = ({ isOpen }) => {
  const { mode } = useDualMode();

  const standardNavItems = [
    { label: 'Kế hoạch hôm nay', path: '/my-day', icon: Sun },
    { label: 'Tất cả công việc', path: '/tasks', icon: CheckSquare },
    { label: 'Lịch trình', path: '/calendar', icon: Calendar },
    { label: 'Kế hoạch tuần', path: '/planning', icon: Compass },
    { label: 'Thống kê năng suất', path: '/analytics', icon: BarChart2 },
  ];

  const developerNavItems = [
    { label: 'Sprint Board', path: '/developer/board', icon: Kanban },
    { label: 'Backlog', path: '/developer/backlog', icon: ListTodo },
    { label: 'Focus Coding', path: '/developer/focus', icon: Crosshair },
    { label: 'Git & Webhooks', path: '/developer/git', icon: GitBranch },
    { label: 'Đo lường Agile', path: '/developer/metrics', icon: LineChart },
  ];

  const currentItems = mode === 'developer' ? developerNavItems : standardNavItems;

  return (
    <aside
      className={`app-sidebar ${isOpen ? 'is-open' : 'is-closed'}`}
      aria-hidden={!isOpen}
    >
      <div className="sidebar-inner">
        <div style={{ padding: 'var(--space-3)' }}>
          <div
            style={{
              fontSize: 'var(--font-size-xs)',
              textTransform: 'uppercase',
              color: 'var(--color-text-muted)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              padding: 'var(--space-2) var(--space-3)',
              marginBottom: 'var(--space-1)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {mode === 'developer' ? 'Developer Workspace' : 'Standard Workspace'}
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            {currentItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  style={({ isActive }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--space-3)',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius)',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: isActive ? 600 : 500,
                    color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                    backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
                    textDecoration: 'none',
                    transition: 'background-color 0.15s ease',
                    whiteSpace: 'nowrap',
                  })}
                >
                  <Icon size={16} style={{ flexShrink: 0 }} />
                  <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.label}
                  </span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Navigation & Dual-Mode Switcher */}
        <div
          style={{
            padding: 'var(--space-3)',
            borderTop: 'var(--border-width) solid var(--color-border)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
          }}
        >
          <div style={{ marginBottom: '2px' }}>
            <ModeSwitcher />
          </div>

          <NavLink
            to="/settings"
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-3)',
              padding: '8px 12px',
              borderRadius: 'var(--radius)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 600,
              color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
              backgroundColor: isActive ? 'var(--color-primary-subtle)' : 'transparent',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            })}
          >
            <Settings size={16} style={{ flexShrink: 0 }} />
            <span style={{ whiteSpace: 'nowrap' }}>Cài đặt hệ thống</span>
          </NavLink>
        </div>
      </div>
    </aside>
  );
};
