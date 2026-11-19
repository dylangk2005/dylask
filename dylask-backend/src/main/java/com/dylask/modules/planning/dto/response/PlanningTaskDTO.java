package com.dylask.modules.planning.dto.response;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

/**
 * DTO công việc hiển thị trong Kế hoạch tuần, 7 ngày tới và Việc quá hạn.
 */
public record PlanningTaskDTO(
        Long id,
        String title,
        String priority,
        String status,
        Instant dueDate,
        LocalDate scheduledDate,
        BigDecimal estimatedHours,
        String categoryName
) {
}
