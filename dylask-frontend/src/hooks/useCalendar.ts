import { useState, useEffect, useCallback, useMemo } from 'react';
import { taskApi } from '@/api/task.api';
import type { CalendarTask, TaskStatus } from '@/types/task';

export type CalendarViewMode = 'month' | 'week' | 'day';

/**
 * Tính khoảng ngày [startDate, endDate] cần nạp từ backend tương ứng với chế độ xem lịch.
 */
function getRangeForView(currentDate: Date, viewMode: CalendarViewMode): { start: Date; end: Date } {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const date = currentDate.getDate();

  if (viewMode === 'month') {
    const firstOfMonth = new Date(year, month, 1);
    const dayOfWeek = (firstOfMonth.getDay() + 6) % 7; // Mon = 0, Sun = 6
    const start = new Date(year, month, 1 - dayOfWeek, 0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 41, 23, 59, 59, 999);
    return { start, end };
  }

  if (viewMode === 'week') {
    const dayOfWeek = (currentDate.getDay() + 6) % 7;
    const start = new Date(year, month, date - dayOfWeek, 0, 0, 0, 0);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6, 23, 59, 59, 999);
    return { start, end };
  }

  const start = new Date(year, month, date, 0, 0, 0, 0);
  const end = new Date(year, month, date, 23, 59, 59, 999);
  return { start, end };
}

/**
 * Custom hook quản lý trạng thái, dữ liệu và thao tác cho màn hình Lịch trình (Calendar View).
 */
export function useCalendar() {
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());
  const [tasks, setTasks] = useState<CalendarTask[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const range = useMemo(() => getRangeForView(currentDate, viewMode), [currentDate, viewMode]);

  const fetchCalendarTasks = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taskApi.getCalendarTasks(range.start.toISOString(), range.end.toISOString());
      setTasks(data);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu lịch trình';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    let isMounted = true;

    taskApi
      .getCalendarTasks(range.start.toISOString(), range.end.toISOString())
      .then((data) => {
        if (!isMounted) return;
        setTasks(data);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu lịch trình';
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [range]);

  const goToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  const goPrev = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() - 1);
      } else if (viewMode === 'week') {
        next.setDate(next.getDate() - 7);
      } else {
        next.setDate(next.getDate() - 1);
      }
      return next;
    });
  }, [viewMode]);

  const goNext = useCallback(() => {
    setCurrentDate((prev) => {
      const next = new Date(prev);
      if (viewMode === 'month') {
        next.setMonth(next.getMonth() + 1);
      } else if (viewMode === 'week') {
        next.setDate(next.getDate() + 7);
      } else {
        next.setDate(next.getDate() + 1);
      }
      return next;
    });
  }, [viewMode]);

  /**
   * Đổi trạng thái hoàn thành của task trên lịch và nạp lại để hiển thị task lặp lại mới (nếu có).
   */
  const toggleTaskStatus = useCallback(
    async (taskId: number, currentStatus: TaskStatus) => {
      const nextStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
      try {
        await taskApi.updateStatus(taskId, { status: nextStatus });
        await fetchCalendarTasks();
      } catch (err) {
        console.error('Lỗi cập nhật trạng thái công việc:', err);
        await fetchCalendarTasks();
      }
    },
    [fetchCalendarTasks]
  );

  /**
   * Kéo thả công việc sang ngày/giờ mới trên lưới lịch để cập nhật dueDate (Optimistic UI).
   */
  const rescheduleTask = useCallback(
    async (taskId: number, targetDateStr: string, targetHour?: number): Promise<boolean> => {
      const targetTask = tasks.find((t) => t.id === taskId);
      const [yyyy, mm, dd] = targetDateStr.split('-').map(Number);
      const currentDue = targetTask?.dueDate ? new Date(targetTask.dueDate) : new Date();
      const optimisticDate = new Date(
        yyyy,
        mm - 1,
        dd,
        targetHour !== undefined ? targetHour : currentDue.getHours(),
        targetHour !== undefined ? 0 : currentDue.getMinutes(),
        0,
        0
      );

      // 1. Cập nhật vị trí trên lưới ngay lập tức để thao tác kéo thả mượt mà
      const previousTasks = tasks;
      setTasks((prev) =>
        prev.map((t) =>
          t.id === taskId ? { ...t, dueDate: optimisticDate.toISOString() } : t
        )
      );

      try {
        const detail = await taskApi.getTaskById(taskId);
        const oldDate = detail.dueDate ? new Date(detail.dueDate) : new Date();
        const updatedDate = new Date(
          yyyy,
          mm - 1,
          dd,
          targetHour !== undefined ? targetHour : oldDate.getHours(),
          targetHour !== undefined ? 0 : oldDate.getMinutes(),
          0,
          0
        );

        await taskApi.updateTask(taskId, {
          title: detail.title,
          description: detail.description,
          priority: detail.priority,
          categoryName: detail.categoryName,
          dueDate: updatedDate.toISOString(),
        });
        await fetchCalendarTasks();
        return true;
      } catch (err) {
        console.error('Không thể dời ngày công việc:', err);
        setTasks(previousTasks);
        return false;
      }
    },
    [fetchCalendarTasks, tasks]
  );

  return {
    viewMode,
    setViewMode,
    currentDate,
    setCurrentDate,
    range,
    tasks,
    isLoading,
    error,
    goToday,
    goPrev,
    goNext,
    refresh: fetchCalendarTasks,
    toggleTaskStatus,
    rescheduleTask,
  };
}
