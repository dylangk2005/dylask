import { useState, useEffect, useMemo, useCallback } from 'react';
import { taskApi } from '@/api/task.api';
import type { TaskSummary, CreateTaskPayload, TaskStatus } from '@/types/task';

export const STANDARD_CATEGORIES = [
  'Tất cả',
  'Cá nhân',
  'Công việc',
  'Học tập',
  'Mua sắm',
  'Gia đình',
];

/**
 * Custom Hook quản lý trạng thái danh sách công việc ở chế độ Standard Mode.
 * Hỗ trợ bộ lọc danh mục, bộ lọc ngày (hôm nay, sắp tới, quá hạn), tìm kiếm từ khóa,
 * và cập nhật giao diện lạc quan (Optimistic UI < 16ms) khi đánh dấu hoàn thành.
 */
export const useStandardTasks = () => {
  const [tasks, setTasks] = useState<TaskSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  // Bộ lọc
  const [activeCategory, setActiveCategory] = useState<string>('Tất cả');
  const [activeFilter, setActiveFilter] = useState<'all' | 'today' | 'upcoming' | 'overdue'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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

  // Thống kê phân loại công việc
  const activeTasks = useMemo(() => tasks.filter((t) => t.status === 'todo'), [tasks]);
  const completedTasks = useMemo(() => tasks.filter((t) => t.status === 'done'), [tasks]);

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
    categories: STANDARD_CATEGORIES,
    createTask,
    toggleTaskStatus,
    deleteTask,
    updateLocalTask,
    refresh: handleRefresh,
  };
};
