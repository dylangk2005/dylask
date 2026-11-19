import { useState, useEffect, useCallback } from 'react';
import { analyticsApi } from '@/api/analytics.api';
import type { AnalyticsRange, PersonalAnalyticsOverview } from '@/types/analytics';

/**
 * Custom hook tải và lọc dữ liệu Thống kê Năng suất Cá nhân theo khoảng thời gian.
 */
export function usePersonalAnalytics(initialRange: AnalyticsRange = 'week') {
  const [range, setRange] = useState<AnalyticsRange>(initialRange);
  const [data, setData] = useState<PersonalAnalyticsOverview | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await analyticsApi.getPersonalOverview(range);
      setData(res);
      setError(null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu thống kê';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [range]);

  useEffect(() => {
    let isMounted = true;
    analyticsApi
      .getPersonalOverview(range)
      .then((res) => {
        if (!isMounted) return;
        setData(res);
        setError(null);
      })
      .catch((err) => {
        if (!isMounted) return;
        const msg = err instanceof Error ? err.message : 'Không thể tải dữ liệu thống kê';
        setError(msg);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [range]);

  return {
    range,
    setRange,
    data,
    isLoading,
    error,
    refresh,
  };
}
