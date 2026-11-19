import React, { useState } from 'react';
import { X, Repeat, Check, Trash2, Loader2 } from 'lucide-react';
import { taskApi } from '@/api/task.api';
import type { RecurringConfig, RecurringPattern } from '@/types/task';

interface RecurringModalProps {
  isOpen: boolean;
  taskId: number;
  initialPattern?: RecurringPattern | null;
  initialInterval?: number;
  initialUntil?: string | null;
  initialReminderMinutes?: number | null;
  onClose: () => void;
  onSaved: (config: RecurringConfig) => void;
}

const PATTERN_OPTIONS: { value: RecurringPattern; label: string; desc: string }[] = [
  { value: 'DAILY', label: 'Hàng ngày', desc: 'Lặp lại mỗi N ngày' },
  { value: 'WEEKDAYS', label: 'Ngày trong tuần (T2 - T6)', desc: 'Tự động bỏ qua Thứ 7 & Chủ nhật' },
  { value: 'WEEKLY', label: 'Hàng tuần', desc: 'Cùng thứ trong tuần kế tiếp' },
  { value: 'MONTHLY', label: 'Hàng tháng', desc: 'Cùng ngày tháng sau (tự kẹp cuối tháng)' },
];

/**
 * Modal cấu hình quy tắc lặp lại định kỳ cho công việc (RecurringModal).
 */
export const RecurringModal: React.FC<RecurringModalProps> = ({
  isOpen,
  taskId,
  initialPattern,
  initialInterval = 1,
  initialUntil,
  initialReminderMinutes,
  onClose,
  onSaved,
}) => {
  const [pattern, setPattern] = useState<RecurringPattern>(initialPattern ?? 'DAILY');
  const [interval, setInterval] = useState<number>(initialInterval || 1);
  const [untilDate, setUntilDate] = useState<string>(() => {
    if (!initialUntil) return '';
    const d = new Date(initialUntil);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
      d.getDate()
    ).padStart(2, '0')}`;
  });
  const [reminderMinutes, setReminderMinutes] = useState<string>(
    initialReminderMinutes !== null && initialReminderMinutes !== undefined
      ? String(initialReminderMinutes)
      : ''
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);
      const untilIso = untilDate ? new Date(`${untilDate}T23:59:59`).toISOString() : null;
      const reminderVal = reminderMinutes ? Number(reminderMinutes) : null;

      const saved = await taskApi.setRecurring(taskId, {
        pattern,
        interval: Math.max(1, interval),
        until: untilIso,
        reminderMinutesBefore: reminderVal,
      });
      onSaved(saved);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = async () => {
    if (isSubmitting) return;
    try {
      setIsSubmitting(true);
      const cleared = await taskApi.clearRecurring(taskId);
      onSaved(cleared);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 1100,
        backgroundColor: 'rgba(15, 23, 42, 0.48)',
        backdropFilter: 'blur(3px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: 'var(--color-surface)',
          border: 'var(--border-width) solid var(--color-border)',
          borderRadius: 'var(--radius)',
          boxShadow: '0 20px 32px -12px rgba(0, 0, 0, 0.18)',
          overflow: 'hidden',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: 'var(--space-4) var(--space-5)',
            borderBottom: 'var(--border-width) solid var(--color-border)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 700 }}>
            <Repeat size={16} color="var(--color-primary)" />
            <span>Cấu hình lặp lại định kỳ</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSave} style={{ padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '6px' }}>
              Chu kỳ lặp lại
            </label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {PATTERN_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: `1px solid ${pattern === opt.value ? 'var(--color-primary)' : 'var(--color-border)'}`,
                    backgroundColor: pattern === opt.value ? 'var(--color-primary-subtle)' : 'var(--color-surface)',
                    cursor: 'pointer',
                  }}
                >
                  <input
                    type="radio"
                    name="recurringPattern"
                    value={opt.value}
                    checked={pattern === opt.value}
                    onChange={() => setPattern(opt.value)}
                    style={{ marginTop: '3px' }}
                  />
                  <div>
                    <div style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
                      {opt.label}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-3)' }}>
            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Khoảng cách lặp
              </label>
              <input
                type="number"
                min={1}
                value={interval}
                onChange={(e) => setInterval(Math.max(1, Number(e.target.value) || 1))}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
                Nhắc trước (phút)
              </label>
              <select
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                <option value="">Không nhắc</option>
                <option value="15">15 phút trước</option>
                <option value="60">1 giờ trước</option>
                <option value="1440">1 ngày trước</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 'var(--font-size-xs)', fontWeight: 600, color: 'var(--color-text-muted)', marginBottom: '4px' }}>
              Dừng lặp sau ngày (tùy chọn)
            </label>
            <input
              type="date"
              value={untilDate}
              onChange={(e) => setUntilDate(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 10px',
                borderRadius: 'var(--radius-sm)',
                border: 'var(--border-width) solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                color: 'var(--color-text)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: 'var(--space-2)',
              borderTop: 'var(--border-width) solid var(--color-border)',
            }}
          >
            {initialPattern ? (
              <button
                type="button"
                onClick={handleClear}
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  border: 'none',
                  background: 'none',
                  color: 'var(--color-danger)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={14} /> Hủy lặp lại
              </button>
            ) : (
              <span />
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '6px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                  cursor: 'pointer',
                }}
              >
                Đóng
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                {isSubmitting ? <Loader2 className="spinner" size={14} /> : <Check size={14} />}
                Lưu quy tắc
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
