import type { TaskPriority, TaskStatus } from '@/types/task';

export interface WeeklyGoal {
  id: number;
  title: string;
  isCompleted: boolean;
  weekNumber: number;
  year: number;
}

export interface PlanningTask {
  id: number;
  title: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate?: string | null;
  scheduledDate?: string | null;
  estimatedHours?: number | null;
  categoryName?: string | null;
}

export interface WeeklyPlanningResponse {
  weekNumber: number;
  year: number;
  startDate: string;
  endDate: string;
  unscheduledTasks: PlanningTask[];
  scheduledByDay: Record<string, PlanningTask[]>;
  weeklyGoals: WeeklyGoal[];
}

export interface UpcomingDayGroup {
  date: string;
  label: string;
  tasks: PlanningTask[];
}

export interface UpcomingDaysResponse {
  days: UpcomingDayGroup[];
}

export interface OverdueItem {
  task: PlanningTask;
  daysOverdue: number;
}

export interface OverdueTasksResponse {
  totalOverdue: number;
  severeOverdue: OverdueItem[];
  recentOverdue: OverdueItem[];
}
