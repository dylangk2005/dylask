import { useState, useEffect, useMemo, useCallback } from 'react';
import { taskApi } from '@/api/task.api';
import type { TaskSummary, CreateTaskPayload, TaskStatus, TaskPriority } from '@/types/task';

export const STANDARD_CATEGORIES = [
  'Tất cả',
  'Cá nhân',
  'Công việc',
  'Học tập',
  'Mua sắm',
  'Gia đình',
];

export type TaskSortOption = 'newest' | 'priority' | 'dueDate';

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
};

const sortTasksByOption = (items: TaskSummary[], sortBy: TaskSortOption): TaskSummary[] => {
  if (sortBy === 'newest') return items;

  return [...items].sort((a, b) => {
    if (sortBy === 'priority') {
      const diff = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      if (diff !== 0) return diff;
    }

    // Ưu tiên công việc có hạn chót sớm hơn đứng trước
    if (a.dueDate && b.dueDate) {
      return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
    }
    if (a.dueDate) return -1;
    if (b.dueDate) return 1;

    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });
};

/**
 * Custom Hook quản lý trạng thái danh sách công việc ở chế độ Standard Mode.
 * Hỗ trợ bộ lọc danh mục, bộ lọc ngày (hôm nay, sắp tới, quá hạn), tìm kiếm từ khóa,
 * sắp xếp, ghim vào My Day và cập nhật giao diện lạc quan (Optimistic UI < 16ms).
 */
export const useStandardTasks = () => {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Bộ lọc & sắp xếp
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<TaskSortOption>('newest');

  useEffect(() => {
    let isCancelled = false;

    const loadTasks = async () => {
      try {
        const response = await taskApi.getTasks({
          mode: 'standard',
          category: activeCategory !== 'Tất cả' ? activeCategory : undefined,
          filter: activeFilter !== 'all' ? activeFilter : undefined,
          search: searchQuery.trim() || undefined,
          size: 100, // Lấy toàn bộ công việc danh sách của trang
        });
        if (!isCancelled) {
          setTasks(response.content || []);
          setError(null);
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Không thể tải danh sách công việc';
          setError(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadTasks();

    return () => {
      isCancelled = true;
    };
  }, [activeCategory, activeFilter, searchQuery, refreshTrigger]);

  /**
   * Tạo công việc mới nhanh chóng.
   */
  const createTask = async (payload: CreateTaskPayload): Promise<TaskSummary> => {
    const defaultCat = activeCategory !== 'Tất cả' ? activeCategory : 'Cá nhân';
    const newTask = await taskApi.createTask({
      ...payload,
      categoryName: payload.categoryName || defaultCat,
    });
    setTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  /**
   * Cập nhật trạng thái hoàn thành ('todo' <-> 'done') với Optimistic UI.
   */
  const toggleTaskStatus = async (taskId: number) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const nextStatus: TaskStatus = target.status === 'done' ? 'todo' : 'done';

    // 1. Cập nhật lạc quan ngay lập tức trên UI (<16ms)
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t))
    );

    // 2. Gửi request đồng bộ ngầm lên Backend
    try {
      await taskApi.updateStatus(taskId, { status: nextStatus });
    } catch {
      // Rollback trạng thái cũ nếu gặp lỗi mạng
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, status: target.status } : t))
      );
    }
  };

  /**
   * Ghim hoặc gỡ công việc khỏi Kế hoạch hôm nay (My Day) trực tiếp từ danh sách.
   */
  const toggleMyDay = async (taskId: number) => {
    const target = tasks.find((t) => t.id === taskId);
    if (!target) return;

    const nextMyDay = !target.isMyDay;

    // 1. Cập nhật trạng thái My Day lạc quan trên UI
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, isMyDay: nextMyDay } : t))
    );

    // 2. Đồng bộ với endpoint PATCH /tasks/{id}/my-day
    try {
      await taskApi.toggleMyDay(taskId, { isMyDay: nextMyDay });
    } catch {
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, isMyDay: target.isMyDay } : t))
      );
    }
  };

  /**
   * Xóa công việc.
   */
  const deleteTask = async (taskId: number) => {
    const previous = [...tasks];
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
    try {
      await taskApi.deleteTask(taskId);
    } catch (err) {
      setTasks(previous);
      throw err;
    }
  };

  /**
   * Cập nhật lại một task trong danh sách cục bộ sau khi sửa từ modal.
   */
  const updateLocalTask = (updated: TaskSummary) => {
    if (activeCategory !== 'Tất cả' && updated.categoryName !== activeCategory) {
      setTasks((prev) => prev.filter((t) => t.id !== updated.id));
    } else {
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    }
  };

  const handleRefresh = useCallback(() => {
    setIsLoading(true);
    setRefreshTrigger((prev) => prev + 1);
  }, []);

  // Thống kê phân loại và sắp xếp công việc
  const activeTasks = useMemo(
    () => sortTasksByOption(tasks.filter((t) => t.status === 'todo'), sortBy),
    [tasks, sortBy]
  );
  const completedTasks = useMemo(
    () => sortTasksByOption(tasks.filter((t) => t.status === 'done'), sortBy),
    [tasks, sortBy]
  );

  return {
    tasks,
    activeTasks,
    completedTasks,
    isLoading,
    error,
    activeCategory,
    setActiveCategory,
    activeFilter,
    setActiveFilter,
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    categories: STANDARD_CATEGORIES,
    createTask,
    toggleTaskStatus,
    toggleMyDay,
    deleteTask,
    updateLocalTask,
    refresh: handleRefresh,
  };
};
