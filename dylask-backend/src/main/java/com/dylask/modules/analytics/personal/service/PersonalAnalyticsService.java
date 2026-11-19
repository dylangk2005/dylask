package com.dylask.modules.analytics.personal.service;

import com.dylask.modules.analytics.personal.dto.PersonalAnalyticsOverviewResponse;

import java.time.LocalDate;

/**
 * Interface dịch vụ thống kê & phân tích năng suất cá nhân (Standard Mode).
 */
public interface PersonalAnalyticsService {

    /**
     * Tổng hợp KPI, Streak, xu hướng theo ngày, phân bổ danh mục và khung giờ tập trung cao nhất.
     *
     * @param userId    ID người dùng
     * @param rangeType Khoảng thống kê: 'week' (mặc định), 'month', 'year'
     * @param today     Ngày tham chiếu (UTC+7)
     * @return Dữ liệu tổng quan thống kê cá nhân
     */
    PersonalAnalyticsOverviewResponse getOverview(Long userId, String rangeType, LocalDate today);
}
