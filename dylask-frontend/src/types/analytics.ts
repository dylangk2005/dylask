export type AnalyticsRange = 'week' | 'month' | 'year';

export interface AnalyticsDateRange {
  from: string;
  to: string;
  rangeType: AnalyticsRange;
}

export interface PersonalKpi {
  totalCreated: number;
  totalCompleted: number;
  overdueTasks: number;
  completionRate: number;
  currentStreakDays: number;
  longestStreakDays: number;
  totalFocusMinutes: number;
  totalFocusHours: number;
  pomodoroSessions: number;
}

export interface DailyProductivityTrend {
  date: string;
  dayOfWeek: string;
  created: number;
  completed: number;
  pomodoroMinutes: number;
}

export interface CategoryShare {
  categoryId: number;
  name: string;
  color: string;
  taskCount: number;
  percentage: number;
}

export interface PeakFocusHours {
  slot: string;
  description: string;
}

export interface PersonalAnalyticsOverview {
  dateRange: AnalyticsDateRange;
  kpis: PersonalKpi;
  dailyTrend: DailyProductivityTrend[];
  categoryBreakdown: CategoryShare[];
  peakFocusHours: PeakFocusHours;
}
