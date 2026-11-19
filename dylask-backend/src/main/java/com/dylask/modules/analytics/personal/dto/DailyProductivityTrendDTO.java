package com.dylask.modules.analytics.personal.dto;

import java.time.LocalDate;

/**
 * DTO xu hướng năng suất theo ngày (tạo mới, hoàn thành, phút Pomodoro).
 */
public record DailyProductivityTrendDTO(
        LocalDate date,
        String dayOfWeek,
        long created,
        long completed,
        long pomodoroMinutes
) {
}
