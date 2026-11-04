import React, { useEffect, useState } from 'react';
import { X, Calendar, Flag, Tag, Trash2, Check, Loader2 } from 'lucide-react';
import type { TaskDetail, TaskPriority, TaskSummary } from '@/types/task';
import { taskApi } from '@/api/task.api';
import { ChecklistSection } from './ChecklistSection';
import { STANDARD_CATEGORIES } from '@/hooks/useStandardTasks';

interface TaskDetailModalProps {
  taskId: number | null;
  onClose: () => void;
  onUpdated: (task: TaskSummary) => void;
  onDeleted: (taskId: number) => void;
}

/**
 * Modal xem và chỉnh sửa chi tiết công việc (TaskDetailModal).
 * Phẳng, tinh tế, tuân thủ Design System tokens và hỗ trợ quản lý checklist con.
 * Hỗ trợ chọn danh mục qua dropdown chuẩn hoặc nhập danh mục tuỳ chỉnh.
 */
export const TaskDetailModal: React.FC<TaskDetailModalProps> = ({
  taskId,
  onClose,
  onUpdated,
  onDeleted,
}) => {
  const [detail, setDetail] = useState<TaskDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [categoryName, setCategoryName] = useState('Cá nhân');
  const [isCustomCategory, setIsCustomCategory] = useState(false);

  useEffect(() => {
    if (!taskId) return;

    let isMounted = true;

    taskApi
      .getTaskById(taskId)
      .then((data) => {
        if (!isMounted) return;
        setDetail(data);
        setTitle(data.title);
        setDescription(data.description || '');
        setPriority(data.priority);

        const currentCat = data.categoryName || 'Cá nhân';
        setCategoryName(currentCat);
        const isPreset = STANDARD_CATEGORIES.includes(currentCat);
        setIsCustomCategory(!isPreset);

        if (data.dueDate) {
          const d = new Date(data.dueDate);
          const yyyy = d.getFullYear();
          const mm = (d.getMonth() + 1).toString().padStart(2, '0');
          const dd = d.getDate().toString().padStart(2, '0');
          setDueDate(`${yyyy}-${mm}-${dd}`);
        } else {
          setDueDate('');
        }
      })
      .catch((err) => {
        console.error('Không thể lấy chi tiết task', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [taskId]);

  if (!taskId) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || isSaving) return;

    try {
      setIsSaving(true);
      const updated = await taskApi.updateTask(taskId, {
        title: title.trim(),
        description: description.trim() || null,
        priority,
        categoryName: categoryName.trim() || 'Cá nhân',
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      });

      // Tạo tóm tắt để cập nhật danh sách
      const summary: TaskSummary = {
        id: updated.id,
        title: updated.title,
        description: updated.description,
        priority: updated.priority,
        status: updated.status,
        dueDate: updated.dueDate,
        isMyDay: updated.isMyDay,
        categoryName: updated.categoryName,
        totalChecklists: updated.checklists.length,
        completedChecklists: updated.checklists.filter((c) => c.isCompleted).length,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      };

      onUpdated(summary);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vĩnh viễn công việc này?')) {
      await taskApi.deleteTask(taskId);
      onDeleted(taskId);
      onClose();
    }
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
        backgroundColor: 'rgba(28, 27, 24, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
        padding: 'var(--space-4)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '560px',
          backgroundColor: 'var(--color-surface)',
          borderRadius: 'var(--radius)',
          border: 'var(--border-width) solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          boxShadow: 'var(--shadow-hover-md)',
          animation: 'fadeInSlide 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: 'var(--space-4)',
            borderBottom: 'var(--border-width) solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: 'var(--color-text)' }}>
              Chỉnh sửa công việc
            </span>
            <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--font-size-xs)' }}>•</span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '2px 8px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-primary-subtle)',
                fontSize: 'var(--font-size-xs)',
                fontWeight: 600,
                color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
              }}
            >
              <Tag size={12} />
              {categoryName || 'Cá nhân'}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Đóng cửa sổ"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              display: 'flex',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-surface-hover)')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Content */}
        {isLoading ? (
          <div style={{ padding: 'var(--space-10)', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Loader2 className="spinner" size={20} color="var(--color-primary)" />
            <span>Đang tải thông tin...</span>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
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
              {/* Tiêu đề */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    color: 'var(--color-text-muted)',
                    marginBottom: 'var(--space-1)',
                  }}
                >
                  Tiêu đề công việc
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-width) solid var(--color-border)',
                    fontSize: 'var(--font-size-md)',
                    fontWeight: 600,
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-surface)',
                    outline: 'none',
                  }}
                  required
                />
              </div>

              {/* Danh mục, Hạn chót & Mức độ ưu tiên */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 'var(--space-3)',
                }}
              >
                {/* Priority */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    <Flag size={13} /> Mức ưu tiên
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-width) solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                  >
                    <option value="low">Thấp</option>
                    <option value="medium">Trung bình</option>
                    <option value="high">Cao</option>
                  </select>
                </div>

                {/* Due Date */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    <Calendar size={13} /> Hạn chót
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '6px 8px',
                      borderRadius: 'var(--radius-sm)',
                      border: 'var(--border-width) solid var(--color-border)',
                      backgroundColor: 'var(--color-surface)',
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text)',
                      outline: 'none',
                    }}
                  />
                </div>

                {/* Category Picker */}
                <div>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-muted)',
                      marginBottom: '4px',
                    }}
                  >
                    <Tag size={13} /> Danh mục
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
                          padding: '6px 8px',
                          borderRadius: 'var(--radius-sm)',
                          border: 'var(--border-width) solid var(--color-border)',
                          backgroundColor: 'var(--color-surface)',
                          fontSize: 'var(--font-size-sm)',
                          color: 'var(--color-text)',
                          outline: 'none',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsCustomCategory(false);
                          setCategoryName('Cá nhân');
                        }}
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
                        padding: '6px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: 'var(--border-width) solid var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        fontSize: 'var(--font-size-sm)',
                        color: 'var(--color-text)',
                        outline: 'none',
                      }}
                    >
                      {availableCategories.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                      {/* Hiển thị category hiện tại nếu không thuộc preset chuẩn */}
                      {categoryName && !availableCategories.includes(categoryName) && (
                        <option value={categoryName}>{categoryName}</option>
                      )}
                      <option value="__NEW__">+ Nhập danh mục khác...</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Ghi chú chi tiết */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: 'var(--font-size-xs)',
                    color: 'var(--color-text-muted)',
                    marginBottom: '4px',
                  }}
                >
                  Ghi chú chi tiết
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Thêm mô tả hoặc hướng dẫn thực hiện..."
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'var(--border-width) solid var(--color-border)',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text)',
                    backgroundColor: 'var(--color-surface)',
                    outline: 'none',
                    resize: 'vertical',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>

              {/* Subtasks Checklists */}
              {detail && (
                <div style={{ paddingTop: 'var(--space-2)', borderTop: '1px solid var(--color-border)' }}>
                  <ChecklistSection
                    taskId={taskId}
                    initialItems={detail.checklists}
                    onItemsChange={(newItems) => {
                      setDetail((prev) => (prev ? { ...prev, checklists: newItems } : null));
                    }}
                  />
                </div>
              )}
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <button
                  type="button"
                  onClick={handleDelete}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    color: 'var(--color-danger)',
                    background: 'none',
                    border: 'none',
                    fontSize: 'var(--font-size-xs)',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: '6px 8px',
                    borderRadius: 'var(--radius-sm)',
                  }}
                >
                  <Trash2 size={14} /> Xóa việc
                </button>
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)', userSelect: 'none' }}>
                  ID #{taskId}
                </span>
              </div>

              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  onClick={onClose}
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
                  disabled={isSaving}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    padding: '6px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: 'none',
                    backgroundColor: 'var(--color-primary)',
                    color: '#FFFFFF',
                    fontSize: 'var(--font-size-sm)',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {isSaving ? <Loader2 className="spinner" size={14} /> : <Check size={14} />}
                  Lưu thay đổi
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
