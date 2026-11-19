import { api } from '@/api/client';
import type {
  OverdueTasksResponse,
  PlanningTask,
  UpcomingDaysResponse,
  WeeklyGoal,
  WeeklyPlanningResponse,
} from '@/types/planning';

/**
 * API Client cho phân hệ Kế hoạch tuần, 7 ngày tới và Việc quá hạn (FEAT-STD-05).
 */
export const planningApi = {
  getWeeklyPlanning: (week?: number, year?: number): Promise<WeeklyPlanningResponse> => {
    const query = new URLSearchParams();
    if (week !== undefined) query.set('week', String(week));
    if (year !== undefined) query.set('year', String(year));
    const qs = query.toString();
    return api.get<WeeklyPlanningResponse>(qs ? `/planning/weekly?${qs}` : '/planning/weekly');
  },

  scheduleTask: (taskId: number, scheduledDate: string): Promise<PlanningTask> => {
    return api.put<PlanningTask>(`/planning/tasks/${taskId}/schedule`, { scheduledDate });
  },

  createWeeklyGoal: (title: string, weekNumber?: number, year?: number): Promise<WeeklyGoal> => {
    return api.post<WeeklyGoal>('/planning/weekly-goals', { title, weekNumber, year });
  },

  toggleWeeklyGoal: (goalId: number): Promise<WeeklyGoal> => {
    return api.patch<WeeklyGoal>(`/planning/weekly-goals/${goalId}/toggle`);
  },

  deleteWeeklyGoal: (goalId: number): Promise<void> => {
    return api.delete<void>(`/planning/weekly-goals/${goalId}`);
  },

  getUpcoming7Days: (): Promise<UpcomingDaysResponse> => {
    return api.get<UpcomingDaysResponse>('/planning/upcoming');
  },

  getOverdueTasks: (): Promise<OverdueTasksResponse> => {
    return api.get<OverdueTasksResponse>('/planning/overdue');
  },

  bulkReschedule: (taskIds: number[], targetDate: string): Promise<PlanningTask[]> => {
    return api.post<PlanningTask[]>('/planning/tasks/bulk-reschedule', { taskIds, targetDate });
  },
};
