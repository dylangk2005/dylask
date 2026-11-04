package com.dylask.modules.task.dto.response;

import java.time.Instant;

/**
 * DTO đại diện cho một mục danh sách kiểm tra con (Checklist Item).
 */
public record ChecklistItemDTO(
        Long id,
        String title,
        Boolean isCompleted,
        Integer position,
        Instant createdAt
) {
}

