package com.dylask.modules.planning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/**
 * DTO tạo mới mục tiêu trọng tâm tuần.
 */
public record CreateWeeklyGoalRequestDTO(
        @NotBlank(message = "Tiêu đề mục tiêu tuần không được để trống")
        @Size(max = 255, message = "Tiêu đề tối đa 255 ký tự")
        String title,
        Integer weekNumber,
        Integer year
) {
}
