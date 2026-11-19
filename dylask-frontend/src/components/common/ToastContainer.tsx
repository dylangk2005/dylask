import React from 'react';
import { CheckCircle2, Info, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/hooks/useToast';

/**
 * Container hiển thị danh sách thông báo Toast ở góc trên bên phải.
 */
export const ToastContainer: React.FC = () => {
  const { toasts, dismissToast } = useToast();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '64px',
        right: '20px',
        zIndex: 1300,
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => {
        const borderColor =
          toast.type === 'error'
            ? 'var(--color-danger)'
            : toast.type === 'info'
            ? 'var(--color-info)'
            : 'var(--color-success)';

        const Icon =
          toast.type === 'error' ? AlertCircle : toast.type === 'info' ? Info : CheckCircle2;

        return (
          <div
            key={toast.id}
            className="dylask-toast-item"
            style={{
              pointerEvents: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 14px',
              minWidth: '240px',
              maxWidth: '360px',
              borderRadius: 'var(--radius)',
              backgroundColor: 'var(--color-surface)',
              border: `1px solid ${borderColor}`,
              boxShadow: '0 10px 24px -8px rgba(15, 23, 42, 0.22)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: 500,
              color: 'var(--color-text)',
            }}
          >
            <Icon size={16} color={borderColor} style={{ flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              type="button"
              onClick={() => dismissToast(toast.id)}
              style={{
                border: 'none',
                background: 'transparent',
                color: 'var(--color-text-muted)',
                display: 'inline-flex',
                cursor: 'pointer',
                padding: '2px',
              }}
              aria-label="Đóng thông báo"
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
};
