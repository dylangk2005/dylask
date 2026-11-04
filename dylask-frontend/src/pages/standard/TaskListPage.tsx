import React, { useState, useEffect } from 'react';
import { Search, CheckCircle2, Inbox, Calendar, AlertCircle, Clock, RefreshCw, Plus } from 'lucide-react';
import { useStandardTasks } from '@/hooks/useStandardTasks';
import { TaskQuickAddInput } from '@/components/task/TaskQuickAddInput';
import { TaskItemRow } from '@/components/task/TaskItemRow';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { CreateTaskModal } from '@/components/task/CreateTaskModal';
import type { TaskSummary } from '@/types/task';
import './taskList.css';

/**
 * Màn hình danh sách công việc chính (TaskListPage) - Standard Mode.
 * Hỗ trợ tạo việc siêu nhanh và Cửa sổ Modal Tạo việc Động chuyên sâu (CreateTaskModal).
 */
export const TaskListPage: React.FC = () => {
  const {
    tasks,
    activeTasks,
    completedTasks,
    isLoading,
    activeCategory,
    setActiveCategory,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    categories,
    createTask,
    toggleTaskStatus,
    deleteTask,
    updateLocalTask,
    refresh,
  } = useStandardTasks();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Phím tắt toàn cục 'c' để mở nhanh Modal Tạo việc khi không focus ô input
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (!isInputFocused && (e.key === 'c' || e.key === 'C')) {
        e.preventDefault();
        setIsCreateModalOpen(true);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const filterTabs: Array<{ id: 'all' | 'today' | 'upcoming' | 'overdue'; label: string; icon: React.ComponentType<{ size: number }> }> = [
    { id: 'all', label: 'Tất cả', icon: Inbox },
    { id: 'today', label: 'Hôm nay', icon: Clock },
    { id: 'upcoming', label: '7 ngày tới', icon: Calendar },
    { id: 'overdue', label: 'Quá hạn', icon: AlertCircle },
  ];

  return (
    <div className="task-list-page">
      {/* Header */}
      <div className="stage-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--space-3)' }}>
          <div>
            <h1 className="stage-title">Danh sách công việc</h1>
            <p className="stage-subtitle">
              Quản lý các đầu việc hàng ngày, hạn chót và chia nhỏ mục tiêu thành danh sách kiểm tra
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            {/* Nút chính Tạo Công Việc Mới (Mở Modal động) */}
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="create-task-btn"
              title="Mở cửa sổ tạo công việc đầy đủ (Phím tắt: C)"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tạo công việc</span>
            </button>

            <button
              type="button"
              onClick={refresh}
              title="Làm mới danh sách"
              style={{
                background: 'none',
                border: 'var(--border-width) solid var(--color-border)',
                backgroundColor: 'var(--color-surface)',
                cursor: 'pointer',
                color: 'var(--color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                padding: '7px 9px',
                borderRadius: 'var(--radius)',
                transition: 'var(--transition-fast)',
              }}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          padding: '6px 12px',
          backgroundColor: 'var(--color-surface)',
          border: 'var(--border-width) solid var(--color-border)',
          borderRadius: 'var(--radius)',
        }}
      >
        <Search size={16} color="var(--color-text-muted)" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Tìm kiếm công việc theo tiêu đề..."
          style={{
            flex: 1,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: 'var(--font-size-sm)',
            color: 'var(--color-text)',
            fontFamily: 'var(--font-sans)',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: 'var(--font-size-xs)',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
            }}
          >
            Xóa
          </button>
        )}
      </div>

      {/* Filter Chips & Categories */}
      <div className="filter-bar">
        {/* Date Filter Tabs */}
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveFilter(tab.id)}
                className={`category-pill ${isActive ? 'active' : ''}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <Icon size={13} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Category Pills */}
        <div className="category-pills">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`category-pill ${activeCategory === cat ? 'active' : ''}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Quick Add Input Card (có nút mở Modal chi tiết) */}
      <TaskQuickAddInput
        onAdd={async (payload) => {
          await createTask(payload);
        }}
        onOpenModal={() => setIsCreateModalOpen(true)}
        defaultCategory={activeCategory !== 'Tất cả' ? activeCategory : 'Cá nhân'}
      />

      {/* Loading Skeleton */}
      {isLoading && tasks.length === 0 ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Đang nạp công việc...
        </div>
      ) : tasks.length === 0 ? (
        /* Empty State */
        <div className="tasks-empty-state">
          <CheckCircle2 size={36} color="var(--color-primary)" strokeWidth={1.5} />
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text)' }}>
            Không có công việc nào
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', maxWidth: '340px' }}>
            {searchQuery
              ? `Không tìm thấy công việc nào khớp với từ khóa "${searchQuery}".`
              : 'Nhấn vào nút "Tạo công việc" hoặc gõ vào ô trên để bắt đầu thêm các việc cần làm!'}
          </p>
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="create-task-btn"
            style={{ marginTop: 'var(--space-2)' }}
          >
            <Plus size={15} />
            <span>Tạo việc đầu tiên</span>
          </button>
        </div>
      ) : (
        /* Task Groups */
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Active Tasks Group */}
          {activeTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div className="task-group-title">
                <span>Chưa hoàn thành</span>
                <span className="task-group-count">({activeTasks.length})</span>
              </div>
              {activeTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  onToggleStatus={toggleTaskStatus}
                  onSelect={(id) => setSelectedTaskId(id)}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}

          {/* Completed Tasks Group */}
          {completedTasks.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
              <div className="task-group-title">
                <span>Đã hoàn thành</span>
                <span className="task-group-count">({completedTasks.length})</span>
              </div>
              {completedTasks.map((task) => (
                <TaskItemRow
                  key={task.id}
                  task={task}
                  onToggleStatus={toggleTaskStatus}
                  onSelect={(id) => setSelectedTaskId(id)}
                  onDelete={deleteTask}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cửa Sổ Modal Tạo Việc Động Mới (CreateTaskModal) */}
      <CreateTaskModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={createTask}
        initialCategory={activeCategory !== 'Tất cả' ? activeCategory : 'Cá nhân'}
      />

      {/* Modal Xem & Chỉnh Sửa Chi Tiết (TaskDetailModal) */}
      <TaskDetailModal
        taskId={selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onUpdated={(updatedTask: TaskSummary) => {
          updateLocalTask(updatedTask);
        }}
        onDeleted={() => {
          setSelectedTaskId(null);
        }}
      />
    </div>
  );
};
