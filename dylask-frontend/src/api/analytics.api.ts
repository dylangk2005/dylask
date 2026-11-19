import { api } from '@/api/client';
import type { AnalyticsRange, PersonalAnalyticsOverview } from '@/types/analytics';

/**
 * API Client cho phân hệ Thống kê & Phân tích Năng suất Cá nhân (Personal Analytics).
 */
export const analyticsApi = {
  /**
   * Lấy tổng quan KPI, Streak, xu hướng ngày và phân bổ danh mục.
   */
  getPersonalOverview: (range: AnalyticsRange = 'week'): Promise<PersonalAnalyticsOverview> => {
    const query = new URLSearchParams({ range });
    return api.get<PersonalAnalyticsOverview>(`/analytics/personal/overview?${query.toString()}`);
  },
};
