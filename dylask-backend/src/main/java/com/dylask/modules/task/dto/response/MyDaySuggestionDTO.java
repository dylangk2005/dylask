package com.dylask.modules.task.dto.response;

import java.time.Instant;

/**
 * DTO công việc đề xuất thông minh để thêm vào Kế hoạch hôm nay (Smart Suggestions).
 */
public record MyDaySuggestionDTO(
        Long id,
        String title,
        String priority,
        Instant dueDate,
        String reason
) {
}
