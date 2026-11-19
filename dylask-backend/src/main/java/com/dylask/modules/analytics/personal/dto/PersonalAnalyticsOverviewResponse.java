package com.dylask.modules.analytics.personal.dto;

import java.time.Instant;
import java.util.List;

/**
 * DTO phản hồi tổng quan thống kê năng suất cá nhân (Personal Analytics).
 */
public record PersonalAnalyticsOverviewResponse(
        DateRangeDTO dateRange,
        PersonalKpiDTO kpis,
        List<DailyProductivityTrendDTO> dailyTrend,
        List<CategoryShareDTO> categoryBreakdown,
        PeakFocusHoursDTO peakFocusHours
) {
    public record DateRangeDTO(
            Instant from,
            Instant to,
            String rangeType
    ) {
    }

    public record PersonalKpiDTO(
            long totalCreated,
            long totalCompleted,
            long overdueTasks,
            double completionRate,
            int currentStreakDays,
            int longestStreakDays,
            long totalFocusMinutes,
            double totalFocusHours,
            long pomodoroSessions
    ) {
    }

    public record PeakFocusHoursDTO(
            String slot,
            String description
    ) {
    }
}
