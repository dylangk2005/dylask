package com.dylask.modules.task.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

import java.time.Instant;

/**
 * DTO yêu cầu cấu hình quy tắc lặp lại định kỳ cho công việc.
 */
public record SetRecurringRequestDTO(
        @NotBlank(message = "Chu kỳ lặp lại không được để trống")
        @Pattern(
                regexp = "^(DAILY|WEEKDAYS|WEEKLY|MONTHLY)$",
                message = "Chu kỳ lặp lại phải thuộc DAILY, WEEKDAYS, WEEKLY hoặc MONTHLY"
        )
        String pattern,

        @Min(value = 1, message = "Khoảng cách lặp phải lớn hơn hoặc bằng 1")
        Integer interval,

        Instant until,

        @Min(value = 0, message = "Thời gian nhắc trước không được âm")
        Integer reminderMinutesBefore
) {
}
