import { useDualMode } from '@/hooks/useDualMode';
import { CheckCircle2, ShieldCheck, Database, Code2 } from 'lucide-react';

export const StandardTasksPlaceholder = () => {
  const { mode } = useDualMode();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div
        style={{
          padding: 'var(--space-6)',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius)',
          border: 'var(--border-width) solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-4)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <CheckCircle2 size={24} color="var(--color-primary)" />
          <h1 style={{ fontSize: 'var(--font-size-xl)', fontWeight: 700 }}>
            Hạ Tầng Dự Án Dylask Đã Sẵn Sàng (Phase 0)
          </h1>
        </div>

        <p style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-base)' }}>
          Bạn đang xem giao diện ở chế độ{' '}
          <strong style={{ color: 'var(--color-primary)' }}>
            {mode === 'developer' ? 'Developer Workspace' : 'Standard Workspace'}
          </strong>
          . Bạn có thể nhấn nút chuyển chế độ trên góc phải thanh Header để kiểm tra tính năng Dual-Mode.
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 'var(--space-3)',
            marginTop: 'var(--space-2)',
          }}
        >
          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Database size={18} color="var(--color-primary)" />
              <strong style={{ fontSize: 'var(--font-size-sm)' }}>Cơ Sở Dữ Liệu</strong>
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Flyway migration V1 đã khởi tạo bảng users và refresh_tokens trên MySQL 8.4.
            </span>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <Code2 size={18} color="var(--color-primary)" />
              <strong style={{ fontSize: 'var(--font-size-sm)' }}>Spring Boot Backend</strong>
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              ApiResponse, GlobalExceptionHandler, CorsConfig và Context-Path /api/v1 hoàn tất 100% test pass.
            </span>
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              backgroundColor: 'var(--color-surface-subtle)',
              borderRadius: 'var(--radius)',
              border: 'var(--border-width) solid var(--color-border)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-2)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
              <ShieldCheck size={18} color="var(--color-primary)" />
              <strong style={{ fontSize: 'var(--font-size-sm)' }}>Frontend React 19</strong>
            </div>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-muted)' }}>
              Router, AppLayout, Sidebar responsive, Design Tokens và API client sẵn sàng cho Phase 1.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
