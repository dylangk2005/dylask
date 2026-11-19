package com.dylask.modules.planning.dto.request;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;
import java.util.List;

/**
 * DTO yêu cầu dời lịch hàng loạt các công việc quá hạn sang một ngày đích.
 */
public record BulkRescheduleRequestDTO(
        @NotEmpty(message = "Danh sách ID công việc không được để trống")
        List<Long> taskIds,

        @NotNull(message = "Ngày đích không được để trống")
        LocalDate targetDate
) {
}
