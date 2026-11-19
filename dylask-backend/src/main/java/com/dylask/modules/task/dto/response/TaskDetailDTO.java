package com.dylask.modules.task.dto.response;

import java.time.Instant;
import java.util.List;

/**
 * DTO chi tiết toàn diện của một công việc, bao gồm cả danh sách các mục kiểm tra con.
 */
public record TaskDetailDTO(
        Long id,
        String title,
        String description,
        String priority,
        String status,
        Instant dueDate,
        Boolean isMyDay,
        String categoryName,
        Boolean isRecurring,
        String recurringPattern,
        Integer recurringInterval,
        Instant recurringUntil,
        Integer reminderMinutesBefore,
        List<ChecklistItemDTO> checklists,
        Instant createdAt,
        Instant updatedAt
) {
}

