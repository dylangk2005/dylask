import React, { useState } from 'react';
import { Plus, Maximize2, Calendar } from 'lucide-react';
import type { CreateTaskPayload, TaskPriority } from '@/types/task';

interface TaskQuickAddInputProps {
  onAdd: (payload: CreateTaskPayload) => Promise<void>;
  onOpenModal?: () => void;
  defaultCategory?: string;
}

const PRIORITY_OPTIONS: Array<{ value: TaskPriority; label: string }> = [
  { value: 'low', label: 'Thấp' },
  { value: 'medium', label: 'Vừa' },
  { value: 'high', label: 'Cao' },
];

/**
 * Ô nhập nhanh công việc (TaskQuickAddInput).
 * Đồng bộ trực tiếp với danh mục đang lọc, hỗ trợ chọn nhanh mức ưu tiên,
 * gắn hạn chót Hôm nay và mở Modal Tạo việc chi tiết.
 */
export const TaskQuickAddInput: React.FC<TaskQuickAddInputProps> = ({
  onAdd,
  onOpenModal,
  defaultCategory = 'Cá nhân',
}) => {
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueToday, setDueToday] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Luôn lấy theo danh mục đang chọn hiện tại thay vì khóa giá trị mount ban đầu
  const resolvedCategory = defaultCategory !== 'Tất cả' ? defaultCategory : 'Cá nhân';

  const getTodayEndIso = (): string => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 0).toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onAdd({
        title: title.trim(),
        priority,
        categoryName: resolvedCategory,
        dueDate: dueToday ? getTodayEndIso() : null,
      });
      setTitle('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="quick-add-form">
      <button
        type="button"
        onClick={onOpenModal}
        title="Mở cửa sổ tạo việc chi tiết"
        className="quick-add-plus-btn"
      >
        <Plus size={18} strokeWidth={2.5} />
      </button>

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder={`Thêm việc mới vào "${resolvedCategory}"... (Nhấn Enter để lưu nhanh)`}
        className="quick-add-input"
        disabled={isSubmitting}
      />

      <div className="quick-add-actions">
        {/* Chọn nhanh mức độ ưu tiên */}
        <div className="quick-add-priority-group" role="group" aria-label="Chọn mức độ ưu tiên">
          {PRIORITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setPriority(opt.value)}
              className={`quick-add-prio-btn prio-${opt.value} ${priority === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Gắn nhanh hạn chót là hôm nay */}
        <button
          type="button"
          onClick={() => setDueToday((prev) => !prev)}
          title="Đặt hạn chót là hôm nay"
          className={`quick-add-today-btn ${dueToday ? 'active' : ''}`}
        >
          <Calendar size={12} />
          <span>Hôm nay</span>
        </button>

        {onOpenModal && (
          <button
            type="button"
            onClick={onOpenModal}
            title="Mở form tạo việc chi tiết (Phím tắt: C)"
            className="quick-add-detail-btn"
          >
            <Maximize2 size={11} />
            <span>Chi tiết</span>
          </button>
        )}

        <span className="quick-add-enter-hint">Enter ↵</span>
      </div>
    </form>
  );
};
