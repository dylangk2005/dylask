package com.dylask.modules.analytics.personal.controller;

import com.dylask.common.dto.ApiResponse;
import com.dylask.common.exception.AppException;
import com.dylask.common.exception.ErrorCode;
import com.dylask.modules.analytics.personal.dto.PersonalAnalyticsOverviewResponse;
import com.dylask.modules.analytics.personal.service.PersonalAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.ZoneOffset;

/**
 * REST Controller cung cấp dữ liệu Thống kê & Phân tích Năng suất Cá nhân (Standard Mode).
 */
@RestController
@RequestMapping("/analytics/personal")
@RequiredArgsConstructor
public class PersonalAnalyticsController {

    private final PersonalAnalyticsService personalAnalyticsService;

    /**
     * Lấy tổng quan KPI, Streak, xu hướng theo ngày, phân bổ danh mục và khung giờ vàng.
     *
     * @param currentUserId ID người dùng từ JWT
     * @param range         Khoảng thống kê: 'week' (mặc định), 'month', 'year'
     * @return Dữ liệu thống kê cá nhân
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<PersonalAnalyticsOverviewResponse>> getPersonalOverview(
            @RequestAttribute(value = "currentUserId", required = false) Long currentUserId,
            @RequestParam(value = "range", defaultValue = "week") String range) {

        if (currentUserId == null) {
            throw new AppException(ErrorCode.UNAUTHORIZED);
        }

        PersonalAnalyticsOverviewResponse overview = personalAnalyticsService.getOverview(
                currentUserId,
                range,
                LocalDate.now(ZoneOffset.ofHours(7))
        );
        return ResponseEntity.ok(ApiResponse.ok(overview, "Lấy dữ liệu thống kê cá nhân thành công"));
    }
}
