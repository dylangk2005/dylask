import React, { useState, useEffect, useCallback } from 'react';
import { X, Calendar, Flag, Tag, CheckSquare, Plus, Trash2, Check, Loader2 } from 'lucide-react';
import type { CreateTaskPayload, TaskPriority, TaskSummary } from '@/types/task';
import { STANDARD_CATEGORIES } from '@/hooks/useStandardTasks';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: CreateTaskPayload) => Promise<TaskSummary>;
  initialCategory?: string;
}

/**
 * Modal Tạo Công Việc Mới Chuyên Sâu (CreateTaskModal).
 * Tuân thủ quy chuẩn thiết kế docs/layout-html/standard-task-modal/layout.html
 * và quy chuẩn chuyển động UI Motion & Interactions.
 */
export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  initialCategory = 'Cá nhân',
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [categoryName, setCategoryName] = useState(() =>
    initialCategory !== 'Tất cả' ? initialCategory : 'Cá nhân'
  );
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = useCallback(() => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setCategoryName(initialCategory !== 'Tất cả' ? initialCategory : 'Cá nhân');
    setIsCustomCategory(false);
    setSubtasks([]);
    setNewSubtask('');
  }, [initialCategory]);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      await onCreate({
        title: title.trim(),
        description: description.trim() || null,
        priority,
        categoryName: categoryName.trim() || 'Cá nhân',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        checklistTitles: subtasks.length > 0 ? subtasks : undefined,
      });
      resetForm();
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  }, [title, isSubmitting, onCreate, description, priority, categoryName, dueDate, subtasks, resetForm, onClose]);

  // Đóng bằng phím Escape hoặc submit bằng Ctrl + Enter
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        handleSubmit();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleClose, handleSubmit]);

  if (!isOpen) return null;

  const handleAddSubtask = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newSubtask.trim()) return;
    setSubtasks((prev) => [...prev, newSubtask.trim()]);
    setNewSubtask('');
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks((prev) => prev.filter((_, i) => i !== index));
  };

  // Các preset thiết lập hạn chót nhanh
  const setQuickDueDate = (type: 'today' | 'tomorrow' | 'nextWeek') => {
    const d = new Date();
    if (type === 'tomorrow') {
      d.setDate(d.getDate() + 1);
    } else if (type === 'nextWeek') {
      d.setDate(d.getDate() + 7);
    }
    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');
    setDueDate(`${yyyy}-${mm}-${dd}`);
  };

  const availableCategories = STANDARD_CATEGORIES.filter((c) => c !== 'Tất cả');

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(28, 27, 24, 0.45)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 'var(--space-4)',
      }}
      onClick={handleClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius)',
          border: 'var(--border-width) solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.16)',
          animation: 'fadeInSlide 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--space-3) var(--space-5)',
            borderBottom: 'var(--border-width) solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--color-surface)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span
              style={{
                fontSize: 'var(--font-size-xs)',
                fontWeight: 700,
                color: 'var(--color-primary)',
                backgroundColor: 'var(--color-primary-subtle)',
                border: '1px solid var(--color-border)',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Tạo Công Việc Mới
            </span>
          </div>

          <button
            type="button"
            onClick={handleClose}
            style={{
              width: '28px',
              height: '28px',
              border: 'none',
              background: 'transparent',
              borderRadius: 'var(--radius-sm)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'var(--transition-fast)',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Form Body */}
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}
        >
          <div
            style={{
              padding: 'var(--space-5)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-4)',
              overflowY: 'auto',
              flex: 1,
            }}
          >
            {/* 1. Tiêu đề lớn (Title Free-Input) */}
            <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 'var(--space-2)' }}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Cần hoàn thành việc gì?..."
                autoFocus
                style={{
                  width: '100%',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--font-size-xl)',
                  fontWeight: 700,
                  color: 'var(--color-text)',
                  lineHeight: 1.35,
                }}
                required
              />
            </div>

            {/* 2. Ghi chú chi tiết (Notes) */}
            <div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Thêm mô tả, ghi chú chi tiết hoặc đường dẫn liên quan..."
                style={{
                  width: '100%',
                  minHeight: '64px',
                  backgroundColor: 'var(--color-bg)',
                  border: 'var(--border-width) solid var(--color-border)',
                  borderRadius: 'var(--radius)',
                  padding: 'var(--space-2) var(--space-3)',
                  fontFamily: 'var(--font-sans)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text)',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.15s ease',
                }}
              />
            </div>

            {/* 3. Bộ thuộc tính xếp gọn (Properties Container) */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--space-3)',
                backgroundColor: 'var(--color-surface-subtle)',
                border: 'var(--border-width) solid var(--color-border)',
                borderRadius: 'var(--radius)',
                padding: 'var(--space-3) var(--space-4)',
              }}
            >
              {/* Row: Danh mục & Hạn chót */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                {/* Category Picker */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    <Tag size={13} color="var(--color-primary)" /> Danh mục
                  </label>

                  {isCustomCategory ? (
                    <div style={{ display: 'flex', gap: '4px' }}>
                      <input
                        type="text"
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        placeholder="Tên danh mục mới"
                        autoFocus
                        style={{
                          flex: 1,
                          height: '32px',
                          backgroundColor: 'var(--color-surface)',
                          border: 'var(--border-width) solid var(--color-border)',
                          borderRadius: 'var(--radius-sm)',
                          padding: '0 8px',
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text)',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setIsCustomCategory(false)}
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                        }}
                      >
                        Huỷ
                      </button>
                    </div>
                  ) : (
                    <select
                      value={categoryName}
                      onChange={(e) => {
                        if (e.target.value === '__NEW__') {
                          setIsCustomCategory(true);
                          setCategoryName('');
                        } else {
                          setCategoryName(e.target.value);
                        }
                      }}
                      style={{
                        width: '100%',
                        height: '32px',
                        backgroundColor: 'var(--color-surface)',
                        border: 'var(--border-width) solid var(--color-border)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0 8px',
                        fontSize: 'var(--font-size-xs)',
                        color: 'var(--color-text)',
                        outline: 'none',
                      }}
                    >
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      <option value="__NEW__">+ Nhập danh mục khác...</option>
                    </select>
                  )}
                </div>

                {/* Due Date Picker */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: 600,
                      color: 'var(--color-text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    <Calendar size={13} color="var(--color-primary)" /> Hạn chót
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      height: '32px',
                      backgroundColor: 'var(--color-surface)',
                      border: 'var(--border-width) solid var(--color-border)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0 8px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                  />
                  {/* Preset Quick Chips */}
                  <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate('today')}
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Hôm nay
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate('tomorrow')}
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Ngày mai
                    </button>
                    <button
                      type="button"
                      onClick={() => setQuickDueDate('nextWeek')}
                      style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '3px',
                        border: '1px solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        color: 'var(--color-text-muted)',
                        cursor: 'pointer',
                      }}
                    >
                      Tuần tới
                    </button>
                  </div>
                </div>
              </div>

              {/* Row: Priority Selector (3 nút bấm kèm chấm màu) */}
              <div>
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    color: 'var(--color-text-muted)',
                    marginBottom: '6px',
                  }}
                >
                  <Flag size={13} color="var(--color-primary)" /> Mức độ ưu tiên
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'var(--space-2)' }}>
                  {/* Low */}
                  <button
                    type="button"
                    onClick={() => setPriority('low')}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: priority === 'low' ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: priority === 'low' ? '1.5px solid #2563EB' : '1px solid var(--color-border)',
                      backgroundColor: priority === 'low' ? '#EFF6FF' : 'var(--color-surface)',
                      color: priority === 'low' ? '#1D4ED8' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                    Thấp
                  </button>

                  {/* Medium */}
                  <button
                    type="button"
                    onClick={() => setPriority('medium')}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: priority === 'medium' ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: priority === 'medium' ? '1.5px solid #D97706' : '1px solid var(--color-border)',
                      backgroundColor: priority === 'medium' ? '#FFFBEB' : 'var(--color-surface)',
                      color: priority === 'medium' ? '#B45309' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
                    Vừa
                  </button>

                  {/* High */}
                  <button
                    type="button"
                    onClick={() => setPriority('high')}
                    style={{
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      fontSize: 'var(--font-size-xs)',
                      fontWeight: priority === 'high' ? 600 : 500,
                      borderRadius: 'var(--radius-sm)',
                      border: priority === 'high' ? '1.5px solid #DC2626' : '1px solid var(--color-border)',
                      backgroundColor: priority === 'high' ? '#FEF2F2' : 'var(--color-surface)',
                      color: priority === 'high' ? '#B91C1C' : 'var(--color-text-muted)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626' }} />
                    Cao
                  </button>
                </div>
              </div>
            </div>

            {/* 4. Danh sách việc con (Checklist items) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: 'var(--font-size-xs)', fontWeight: 600 }}>
                  <CheckSquare size={14} color="var(--color-primary)" /> Việc con cần làm (Checklists)
                </span>
                {subtasks.length > 0 && (
                  <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {subtasks.length} mục
                  </span>
                )}
              </div>

              {/* Danh sách các subtasks đã thêm */}
              {subtasks.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {subtasks.map((st, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '5px 8px',
                        backgroundColor: 'var(--color-surface-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--color-border)',
                        fontSize: 'var(--font-size-xs)',
                      }}
                    >
                      <span style={{ color: 'var(--color-text)' }}>• {st}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveSubtask(idx)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--color-text-muted)',
                          cursor: 'pointer',
                          display: 'flex',
                          padding: '2px',
                        }}
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Input thêm subtask */}
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubtask();
                    }
                  }}
                  placeholder="Thêm mục việc con..."
                  style={{
                    flex: 1,
                    height: '30px',
                    backgroundColor: 'var(--color-surface)',
                    border: 'var(--border-width) solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    padding: '0 8px',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text)',
                    outline: 'none',
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                  style={{
                    height: '30px',
                    padding: '0 10px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    backgroundColor: 'var(--color-surface-subtle)',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: newSubtask.trim() ? 'pointer' : 'default',
                    color: newSubtask.trim() ? 'var(--color-text)' : 'var(--color-text-muted)',
                  }}
                >
                  <Plus size={13} /> Thêm
                </button>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div
            style={{
              padding: 'var(--space-3) var(--space-5)',
              borderTop: 'var(--border-width) solid var(--color-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'var(--color-surface-subtle)',
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
              Phím tắt: Ctrl + Enter
            </span>

            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button
                type="button"
                onClick={handleClose}
                style={{
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'var(--border-width) solid var(--color-border)',
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text)',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>

              <button
                type="submit"
                disabled={!title.trim() || isSubmitting}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 18px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  backgroundColor: 'var(--color-primary)',
                  color: '#FFFFFF',
                  fontSize: 'var(--font-size-sm)',
                  fontWeight: 600,
                  cursor: title.trim() && !isSubmitting ? 'pointer' : 'not-allowed',
                  opacity: title.trim() && !isSubmitting ? 1 : 0.6,
                  transition: 'var(--transition-fast)',
                }}
              >
                {isSubmitting ? <Loader2 className="spinner" size={14} /> : <Check size={14} />}
                Tạo công việc
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
