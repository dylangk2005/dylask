import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  CheckCircle2,
  CheckSquare,
  Inbox,
  Calendar,
  AlertCircle,
  Clock,
  RefreshCw,
  Plus,
  ArrowUpDown,
  ChevronDown,
  X,
} from 'lucide-react';
import { useStandardTasks, type TaskSortOption } from '@/hooks/useStandardTasks';
import { TaskQuickAddInput } from '@/components/task/TaskQuickAddInput';
import { TaskItemRow } from '@/components/task/TaskItemRow';
import { TaskDetailModal } from '@/components/task/TaskDetailModal';
import { CreateTaskModal } from '@/components/task/CreateTaskModal';
import type { TaskSummary } from '@/types/task';
import './taskList.css';

const CATEGORY_DOT_COLORS: Record<string, string> = {
  'Tất cả': '#0F766E',
  'Cá nhân': '#0F766E',
  'Công việc': '#2563EB',
  'Học tập': '#7C3AED',
  'Mua sắm': '#D97706',
  'Gia đình': '#DB2777',
};

/**
 * Màn hình danh sách công việc chính (TaskListPage) - Standard Mode.
 * Hỗ trợ tìm kiếm nhanh (/), sắp xếp đa chiều, lọc thời gian & danh mục tách biệt,
 * tạo việc siêu nhanh đồng bộ danh mục và ghim trực tiếp vào My Day.
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
    sortBy,
    setSortBy,
    categories,
    createTask,
    toggleTaskStatus,
    toggleMyDay,
    deleteTask,
    updateLocalTask,
    refresh,
  } = useStandardTasks();

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [showCompleted, setShowCompleted] = useState(true);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Phím tắt toàn cục: 'c' mở Modal tạo việc, '/' focus nhanh vào ô tìm kiếm
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInputFocused = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (isInputFocused) return;

      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        setIsCreateModalOpen(true);
      } else if (e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const filterTabs: Array<{
    id: 'all' | 'today' | 'upcoming' | 'overdue';
    label: string;
    icon: React.ComponentType<{ size: number }>;
  }> = [
    { id: 'all', label: 'Tất cả', icon: Inbox },
    { id: 'today', label: 'Hôm nay', icon: Clock },
    { id: 'upcoming', label: '7 ngày tới', icon: Calendar },
    { id: 'overdue', label: 'Quá hạn', icon: AlertCircle },
  ];

  const completionPercent = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return (
    <div className="task-list-page">
      {/* Header đồng bộ cùng MyDayPage */}
      <div className="stage-header">
        <div className="stage-header-main">
          <div>
            <div className="stage-title-row">
              <span className="stage-icon-badge" aria-hidden="true">
                <CheckSquare size={20} strokeWidth={2.2} />
              </span>
              <h1 className="stage-title">Danh sách công việc</h1>
              <span className="stage-progress-pill" title={`Hoàn thành ${completionPercent}%`}>
                <span>
                  {completedTasks.length}/{tasks.length} hoàn thành
                </span>
                <span className="stage-progress-track">
                  <span
                    className="stage-progress-fill"
                    style={{ width: `${completionPercent}%` }}
                  />
                </span>
              </span>
            </div>
            <p className="stage-subtitle">
              Quản lý các đầu việc hàng ngày, hạn chót và chia nhỏ mục tiêu thành danh sách kiểm tra
            </p>
          </div>

          <div className="stage-header-actions">
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(true)}
              className="create-task-btn"
              title="Mở cửa sổ tạo công việc đầy đủ (Phím tắt: C)"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Tạo công việc</span>
              <span className="create-task-kbd">C</span>
            </button>

            <button
              type="button"
              onClick={refresh}
              title="Làm mới danh sách"
              className={`refresh-icon-btn ${isLoading ? 'spinning' : ''}`}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>
      </div>

      {/* Thanh Search + Sắp xếp */}
      <div className="tasks-toolbar">
        <div className="tasks-search-box">
          <Search size={16} color="var(--color-text-muted)" />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                if (searchQuery) {
                  setSearchQuery('');
                } else {
                  searchInputRef.current?.blur();
                }
              }
            }}
            placeholder="Tìm kiếm công việc theo tiêu đề..."
            className="tasks-search-input"
          />
          {searchQuery ? (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="tasks-search-clear"
              title="Xóa từ khóa tìm kiếm"
            >
              <X size={14} />
            </button>
          ) : (
            <span className="tasks-search-kbd" title="Nhấn phím / để tìm kiếm nhanh">
              /
            </span>
          )}
        </div>

        <div className="tasks-sort-box">
          <ArrowUpDown size={14} color="var(--color-text-muted)" />
          <select
            aria-label="Sắp xếp công việc"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as TaskSortOption)}
            className="tasks-sort-select"
          >
            <option value="newest">Sắp xếp: Mặc định</option>
            <option value="priority">Ưu tiên: Cao → Thấp</option>
            <option value="dueDate">Hạn chót: Gần nhất</option>
          </select>
        </div>
      </div>

      {/* Phân tách rõ Bộ lọc Thời gian (Segmented) và Danh mục (Color Chips) */}
      <div className="filter-bar">
        <div className="time-segmented-control" role="tablist" aria-label="Lọc theo thời gian">
          {filterTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(tab.id)}
                className={`time-segment-btn ${isActive ? 'active' : ''} ${
                  tab.id === 'overdue' ? 'is-overdue' : ''
                }`}
              >
                <Icon size={13} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="category-pills" role="tablist" aria-label="Lọc theo danh mục">
          {categories.map((cat) => {
            const dotColor = CATEGORY_DOT_COLORS[cat] || '#64748B';
            const isActive = activeCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveCategory(cat)}
                className={`category-pill ${isActive ? 'active' : ''}`}
              >
                <span
                  className="category-dot"
                  style={{ backgroundColor: isActive ? '#FFFFFF' : dotColor }}
                />
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Add Input (tự động đồng bộ danh mục đang chọn) */}
      <TaskQuickAddInput
        onAdd={async (payload) => {
          await createTask(payload);
        }}
        onOpenModal={() => setIsCreateModalOpen(true)}
        defaultCategory={activeCategory !== 'Tất cả' ? activeCategory : 'Cá nhân'}
      />

      {/* Loading / Empty / Task Groups */}
      {isLoading && tasks.length === 0 ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Đang nạp công việc...
        </div>
      ) : tasks.length === 0 ? (
        <div className="tasks-empty-state">
          <CheckCircle2 size={36} color="var(--color-primary)" strokeWidth={1.5} />
          <h3 style={{ fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--color-text)' }}>
            Không có công việc nào
          </h3>
          <p style={{ fontSize: 'var(--font-size-sm)', maxWidth: '360px' }}>
            {searchQuery
              ? `Không tìm thấy công việc nào khớp với từ khóa "${searchQuery}".`
              : activeFilter !== 'all' || activeCategory !== 'Tất cả'
                ? 'Chưa có công việc nào trong bộ lọc hiện tại. Thử chuyển sang "Tất cả" hoặc tạo việc mới ngay.'
                : 'Nhấn nút "Tạo công việc" hoặc gõ vào ô trên để bắt đầu lên danh sách việc cần làm!'}
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
        <div className="task-groups-stack">
          {/* Active Tasks Group */}
          {activeTasks.length > 0 && (
            <div className="task-group-section">
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
                  onToggleMyDay={toggleMyDay}
                />
              ))}
            </div>
          )}

          {/* Completed Tasks Group (Cho phép thu gọn / mở rộng) */}
          {completedTasks.length > 0 && (
            <div className="task-group-section">
              <button
                type="button"
                onClick={() => setShowCompleted((prev) => !prev)}
                className="task-group-toggle-btn"
                aria-expanded={showCompleted}
              >
                <ChevronDown
                  size={14}
                  className={`task-group-chevron ${showCompleted ? 'open' : ''}`}
                />
                <span>Đã hoàn thành</span>
                <span className="task-group-count">({completedTasks.length})</span>
              </button>

              {showCompleted &&
                completedTasks.map((task) => (
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
