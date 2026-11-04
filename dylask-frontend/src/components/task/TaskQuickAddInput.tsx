import React, { useState } from 'react';
import { Plus, Maximize2 } from 'lucide-react';
import type { CreateTaskPayload, TaskPriority } from '@/types/task';

interface TaskQuickAddInputProps {
  onAdd: (payload: CreateTaskPayload) => Promise<void>;
  onOpenModal?: () => void;
  defaultCategory?: string;
}

/**
 * Ô nhập nhanh công việc (TaskQuickAddInput).
 * Tuân thủ quy chuẩn UI Motion & Interactions:
 * - Focus-within viền màu thương hiệu ngọc bích
 * - Nhấn Enter để gửi nhanh không cần rời tay khỏi bàn phím
 * - Có nút mở cửa sổ Modal Tạo việc chi tiết
 */
export const TaskQuickAddInput: React.FC<TaskQuickAddInputProps> = ({
  onAdd,
  onOpenModal,
  defaultCategory = 'Cá nhân',
}) => {
  const [title, setTitle] = useState('');
  const [priority] = useState<TaskPriority>('medium');
  const [category] = useState(defaultCategory);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAdd({
        title: title.trim(),
        priority,
        categoryName: category !== 'Tất cả' ? category : 'Cá nhân',
      });
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        backgroundColor: 'var(--color-surface)',
        border: 'var(--border-width) solid var(--color-border)',
        borderRadius: 'var(--radius)',
        padding: 'var(--space-3) var(--space-4)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--space-3)',
        transition: 'var(--transition-smooth)',
        boxShadow: 'var(--shadow-sm, 0 1px 3px rgba(0,0,0,0.05))',
      }}
      className="quick-add-form"
    >
      <button
        type="button"
        onClick={onOpenModal}
        title="Mở cửa sổ tạo việc chi tiết"
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          color: 'var(--color-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--radius-sm)',
          transition: 'var(--transition-fast)',
        }}
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Thêm việc mới... (Nhấn Enter để lưu nhanh)"
        style={{
          flex: 1,
          border: 'none',
          background: 'transparent',
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--font-size-base)',
          color: 'var(--color-text)',
          outline: 'none',
        }}
        disabled={isSubmitting}
      />

      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
        {onOpenModal && (
          <button
            type="button"
            onClick={onOpenModal}
            title="Mở form tạo việc chi tiết (Ctrl + Enter / C)"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-primary)',
              backgroundColor: 'var(--color-primary-subtle)',
              border: '1px solid var(--color-border)',
              padding: '2px 8px',
              borderRadius: 'var(--radius-sm)',
              cursor: 'pointer',
              fontWeight: 600,
              transition: 'var(--transition-fast)',
            }}
          >
            <Maximize2 size={11} />
            <span>Chi tiết</span>
          </button>
        )}

        <span
          style={{
            fontSize: 'var(--font-size-xs)',
            fontFamily: 'var(--font-mono)',
            color: 'var(--color-text-muted)',
            backgroundColor: 'var(--color-surface-subtle)',
            border: 'var(--border-width) solid var(--color-border)',
            padding: '2px 6px',
            borderRadius: 'var(--radius-sm)',
            userSelect: 'none',
          }}
        >
          Enter ↵
        </span>
      </div>
    </form>
  );
};
