package com.dylask.modules.planning.dto.request;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * DTO yêu cầu gán ngày lên lịch thực hiện cho một công việc.
 */
public record ScheduleTaskRequestDTO(
        @NotNull(message = "Ngày lên lịch không được để trống")
        LocalDate scheduledDate
) {
}
