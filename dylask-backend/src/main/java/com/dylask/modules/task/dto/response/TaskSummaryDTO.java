package com.dylask.modules.task.dto.response;

import java.time.Instant;

/**
 * DTO tóm tắt công việc hiển thị trên danh sách bảng và bộ lọc.
 */
public record TaskSummaryDTO(
        Long id,
        String title,
        String description,
        String priority,
        String status,
        Instant dueDate,
        Boolean isMyDay,
        String categoryName,
        Integer totalChecklists,
        Integer completedChecklists,
        Instant createdAt,
        Instant updatedAt
) {
}

