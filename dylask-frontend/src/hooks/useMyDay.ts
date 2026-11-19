import { useState, useEffect, useCallback } from 'react';
import { taskApi } from '@/api/task.api';
import type { MyDaySuggestion, MyDayTask, PomodoroSessionResult, TaskStatus } from '@/types/task';

/**
 * Custom hook quản lý dữ liệu Kế hoạch hôm nay (My Day) và Ngăn gợi ý thông minh.
 */
export function useMyDay() {
  const [date, setDate] = useState<string>('');
  const [tasks, setTasks] = useState<MyDayTask[]>([]);
  const [suggestions, setSuggestions] = useState<MyDaySuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const data = await taskApi.getMyDay();
      setDate(data.date);
      setTasks(data.tasks);
      setSuggestions(data.suggestions);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải Kế hoạch hôm nay';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    taskApi
      .getMyDay()
      .then((data) => {
        if (!isMounted) return;
        setDate(data.date);
        setTasks(data.tasks);
        setSuggestions(data.suggestions);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Không thể tải Kế hoạch hôm nay';
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const addToMyDay = useCallback(
    async (taskId: number) => {
      await taskApi.toggleMyDay(taskId, { isMyDay: true });
      await refresh();
    },
    [refresh]
  );

  const removeFromMyDay = useCallback(
    async (taskId: number) => {
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      await taskApi.toggleMyDay(taskId, { isMyDay: false });
      await refresh();
    },
    [refresh]
  );

  const toggleTaskStatus = useCallback(
    async (taskId: number, currentStatus: TaskStatus) => {
      const nextStatus: TaskStatus = currentStatus === 'done' ? 'todo' : 'done';
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: nextStatus } : t)));
      await taskApi.updateStatus(taskId, { status: nextStatus });
      await refresh();
    },
    [refresh]
  );

  const createMyDayTask = useCallback(
    async (title: string) => {
      const created = await taskApi.createTask({ title, priority: 'medium' });
      await taskApi.toggleMyDay(created.id, { isMyDay: true });
      await refresh();
    },
    [refresh]
  );

  const applyPomodoroResult = useCallback((result: PomodoroSessionResult) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === result.taskId
          ? {
              ...t,
              pomodoroSessionsCompleted: result.pomodoroSessionsCompleted,
              pomodoroTotalMinutes: result.pomodoroTotalMinutes,
            }
          : t
      )
    );
  }, []);

  return {
    date,
    tasks,
    suggestions,
    isLoading,
    error,
    refresh,
    addToMyDay,
    removeFromMyDay,
    toggleTaskStatus,
    createMyDayTask,
    applyPomodoroResult,
  };
}
