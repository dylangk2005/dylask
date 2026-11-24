import { useState, useEffect, useCallback } from 'react';
import { planningApi } from '@/api/planning.api';
import { taskApi } from '@/api/task.api';
import type {
  OverdueTasksResponse,
  UpcomingDaysResponse,
  WeeklyPlanningResponse,
} from '@/types/planning';

export type PlanningTab = 'weekly' | 'upcoming' | 'overdue';

/**
 * Custom hook điều phối dữ liệu cho Kế hoạch tuần, 7 ngày tới và Việc quá hạn.
 */
export function usePlanning() {
  const [activeTab, setActiveTab] = useState<PlanningTab>('weekly');
  const [weekly, setWeekly] = useState<WeeklyPlanningResponse | null>(null);
  const [upcoming, setUpcoming] = useState<UpcomingDaysResponse | null>(null);
  const [overdue, setOverdue] = useState<OverdueTasksResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async (week?: number, year?: number) => {
    try {
      const [w, u, o] = await Promise.all([
        planningApi.getWeeklyPlanning(week, year),
        planningApi.getUpcoming7Days(),
        planningApi.getOverdueTasks(),
      ]);
      setWeekly(w);
      setUpcoming(u);
      setOverdue(o);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu kế hoạch';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      planningApi.getWeeklyPlanning(),
      planningApi.getUpcoming7Days(),
      planningApi.getOverdueTasks(),
    ])
      .then(([w, u, o]) => {
        if (!isMounted) return;
        setWeekly(w);
        setUpcoming(u);
        setOverdue(o);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu kế hoạch';
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  /**
   * Đổi trạng thái hoàn thành ('todo' <-> 'done') của công việc từ bất kỳ tab nào (Optimistic UI).
   */
  const toggleTaskStatus = useCallback(
    async (taskId: number, currentStatus: 'todo' | 'done') => {
      const nextStatus = currentStatus === 'done' ? 'todo' : 'done';

      setWeekly((prev) => {
        if (!prev) return prev;
        const nextByDay: typeof prev.scheduledByDay = {};
        for (const [day, items] of Object.entries(prev.scheduledByDay)) {
          nextByDay[day] = items.map((t) =>
            t.id === taskId ? { ...t, status: nextStatus } : t
          );
        }
        return {
          ...prev,
          unscheduledTasks: prev.unscheduledTasks.map((t) =>
            t.id === taskId ? { ...t, status: nextStatus } : t
          ),
          scheduledByDay: nextByDay,
        };
      });

      setUpcoming((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          days: prev.days.map((g) => ({
            ...g,
            tasks: g.tasks.map((t) =>
              t.id === taskId ? { ...t, status: nextStatus } : t
            ),
          })),
        };
      });

      try {
        await taskApi.updateStatus(taskId, { status: nextStatus });
        await loadAll(weekly?.weekNumber, weekly?.year);
      } catch (err) {
        console.error('Lỗi cập nhật trạng thái công việc:', err);
        await loadAll(weekly?.weekNumber, weekly?.year);
      }
    },
    [loadAll, weekly]
  );

  const scheduleTask = useCallback(
    async (taskId: number, targetDate: string) => {
      await planningApi.scheduleTask(taskId, targetDate);
      await loadAll(weekly?.weekNumber, weekly?.year);
    },
    [loadAll, weekly?.weekNumber, weekly?.year]
  );

  const createInboxTask = useCallback(
    async (title: string, priority: 'low' | 'medium' | 'high' = 'medium') => {
      await taskApi.createTask({ title, priority });
      await loadAll(weekly?.weekNumber, weekly?.year);
    },
    [loadAll, weekly?.weekNumber, weekly?.year]
  );

  const createTaskForDate = useCallback(
    async (title: string, targetDate: string) => {
      const created = await taskApi.createTask({ title, priority: 'medium' });
      await planningApi.scheduleTask(created.id, targetDate);
      await loadAll(weekly?.weekNumber, weekly?.year);
    },
    [loadAll, weekly?.weekNumber, weekly?.year]
  );

  const addGoal = useCallback(
    async (title: string) => {
      await planningApi.createWeeklyGoal(title, weekly?.weekNumber, weekly?.year);
      await loadAll(weekly?.weekNumber, weekly?.year);
    },
    [loadAll, weekly?.weekNumber, weekly?.year]
  );

  const toggleGoal = useCallback(
    async (goalId: number) => {
      await planningApi.toggleWeeklyGoal(goalId);
      await loadAll(weekly?.weekNumber, weekly?.year);
    },
    [loadAll, weekly?.weekNumber, weekly?.year]
  );

  const deleteGoal = useCallback(
    async (goalId: number) => {
      await planningApi.deleteWeeklyGoal(goalId);
      await loadAll(weekly?.weekNumber, weekly?.year);
    },
    [loadAll, weekly?.weekNumber, weekly?.year]
  );

  const bulkReschedule = useCallback(
    async (taskIds: number[], targetDate: string) => {
      await planningApi.bulkReschedule(taskIds, targetDate);
      await loadAll(weekly?.weekNumber, weekly?.year);
    },
    [loadAll, weekly?.weekNumber, weekly?.year]
  );

  const goToCurrentWeek = useCallback(async () => {
    await loadAll();
  }, [loadAll]);

  const shiftWeek = useCallback(
    async (delta: number) => {
      if (!weekly) return;
      let nextWeek = weekly.weekNumber + delta;
      let nextYear = weekly.year;
      if (nextWeek < 1) {
        nextYear -= 1;
        nextWeek = 52;
      } else if (nextWeek > 52) {
        nextYear += 1;
        nextWeek = 1;
      }
      await loadAll(nextWeek, nextYear);
    },
    [loadAll, weekly]
  );

  return {
    activeTab,
    setActiveTab,
    weekly,
    upcoming,
    overdue,
    isLoading,
    error,
    refresh: () => loadAll(weekly?.weekNumber, weekly?.year),
    toggleTaskStatus,
    scheduleTask,
    createInboxTask,
    createTaskForDate,
    addGoal,
    toggleGoal,
    deleteGoal,
    bulkReschedule,
    goToCurrentWeek,
    shiftWeek,
  };
}
