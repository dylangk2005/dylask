import React, { useState } from 'react';
import { Plus, Check, Trash2, CheckSquare } from 'lucide-react';
import type { ChecklistItem } from '@/types/task';
import { taskApi } from '@/api/task.api';

interface ChecklistSectionProps {
  taskId: number;
  initialItems: ChecklistItem[];
  onItemsChange?: (items: ChecklistItem[]) => void;
}

/**
 * Phân đoạn danh sách kiểm tra con (Checklists / Subtasks).
 * Hiển thị thanh tiến độ hoàn thành và danh sách các mục kiểm tra có thể tick chọn.
 */
export const ChecklistSection: React.FC<ChecklistSectionProps> = ({
  taskId,
  initialItems,
  onItemsChange,
}) => {
  const [items, setItems] = useState<ChecklistItem[]>(initialItems);
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const total = items.length;
  const completedCount = items.filter((i) => i.isCompleted).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || isAdding) return;

    try {
      setIsAdding(true);
      const created = await taskApi.addChecklist(taskId, { title: newTitle.trim() });
      const updated = [...items, created];
      setItems(updated);
      onItemsChange?.(updated);
      setNewTitle('');
    } finally {
      setIsAdding(false);
    }
  };

  const handleToggle = async (itemId: number) => {
    // Optimistic toggle
    const updated = items.map((i) =>
      i.id === itemId ? { ...i, isCompleted: !i.isCompleted } : i
    );
    setItems(updated);
    onItemsChange?.(updated);

    try {
      await taskApi.toggleChecklist(taskId, itemId);
    } catch {
      // Revert on error
      setItems(items);
      onItemsChange?.(items);
    }
  };

  const handleDelete = async (itemId: number) => {
    const updated = items.filter((i) => i.id !== itemId);
    setItems(updated);
    onItemsChange?.(updated);

    try {
      await taskApi.deleteChecklist(taskId, itemId);
    } catch {
      setItems(items);
      onItemsChange?.(items);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Header & Progress */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <CheckSquare size={16} color="var(--color-primary)" />
          <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            Danh sách việc con
          </span>
        </div>
        {total > 0 && (
          <span
            style={{
              fontSize: 'var(--font-size-xs)',
              fontFamily: 'var(--font-mono)',
              color: 'var(--color-text-muted)',
            }}
          >
            {completedCount}/{total} ({percent}%)
          </span>
        )}
      </div>

      {/* Progress Bar */}
      {total > 0 && (
        <div
          style={{
            height: '4px',
            backgroundColor: 'var(--color-surface-subtle)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${percent}%`,
              backgroundColor: 'var(--color-primary)',
              transition: 'width 0.25s ease',
            }}
          />
        </div>
      )}

      {/* List Items */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
        {items.map((item) => (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--space-2)',
              padding: '6px 8px',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              transition: 'var(--transition-fast)',
            }}
            className="checklist-item-row"
          >
            <button
              type="button"
              onClick={() => handleToggle(item.id)}
              style={{
                width: '16px',
                height: '16px',
                borderRadius: '3px',
                border: item.isCompleted ? 'none' : '1.5px solid var(--color-border-strong)',
                backgroundColor: item.isCompleted ? 'var(--color-primary)' : 'transparent',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
              }}
            >
              {item.isCompleted && <Check size={11} strokeWidth={3} />}
            </button>

            <span
              style={{
                flex: 1,
                fontSize: 'var(--font-size-sm)',
                color: item.isCompleted ? 'var(--color-text-muted)' : 'var(--color-text)',
                textDecoration: item.isCompleted ? 'line-through' : 'none',
              }}
            >
              {item.title}
            </span>

            <button
              type="button"
              onClick={() => handleDelete(item.id)}
              title="Xóa mục con"
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-muted)',
                cursor: 'pointer',
                padding: '2px',
                display: 'flex',
                alignItems: 'center',
                opacity: 0.5,
              }}
            >
              <Trash2 size={13} />
            </button>
          </div>
        ))}
      </div>

      {/* Add New Checklist Item Input */}
      <form onSubmit={handleAdd} style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '2px' }}>
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Thêm mục kiểm tra con..."
          style={{
            flex: 1,
            padding: '6px 10px',
            fontSize: 'var(--font-size-sm)',
            borderRadius: 'var(--radius-sm)',
            border: 'var(--border-width) solid var(--color-border)',
            backgroundColor: 'var(--color-surface)',
            color: 'var(--color-text)',
            outline: 'none',
          }}
          disabled={isAdding}
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || isAdding}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            backgroundColor: 'var(--color-primary)',
            color: '#FFFFFF',
            fontSize: 'var(--font-size-xs)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Plus size={14} /> Thêm
        </button>
      </form>
    </div>
  );
};

