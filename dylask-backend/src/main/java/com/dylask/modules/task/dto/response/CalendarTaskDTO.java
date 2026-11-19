package com.dylask.modules.task.dto.response;

import java.time.Instant;

/**
 * DTO hiển thị thẻ công việc trên lưới lịch trình (Calendar View).
 */
public record CalendarTaskDTO(
        Long id,
        String title,
        Instant dueDate,
        String priority,
        String status,
        Boolean isRecurring,
        String recurringPattern,
        String categoryName
) {
}
